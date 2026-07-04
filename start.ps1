<#
  Storyframe launcher for Windows.
  Downloads nothing to configure by hand: on first run it installs everything
  it needs (Python if missing, Python libraries, ffmpeg, deno) and then starts
  the local web interface. Just run it and wait.

  Usage:
    Double-click start.bat, or run:  powershell -File start.ps1
    Options:  -Update     reinstall/upgrade Python dependencies
              -Port N     use a different port (default 8765)
              -NoBrowser  do not open the browser automatically
#>
param(
  [switch]$Update,
  [int]$Port = 8765,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "    [!]  $msg" -ForegroundColor Yellow }

function Refresh-Path {
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
              [System.Environment]::GetEnvironmentVariable("Path", "User")
}

function Get-PythonVersion($exe, $extraArg) {
  try {
    if ($extraArg) { $out = & $exe $extraArg "--version" 2>&1 }
    else           { $out = & $exe "--version" 2>&1 }
    if ($out -match "Python (\d+)\.(\d+)") {
      return [pscustomobject]@{ Major = [int]$Matches[1]; Minor = [int]$Matches[2] }
    }
  } catch { }
  return $null
}

function Find-BasePython {
  # Returns @{ exe; args; ver } for a Python >= 3.11, or $null.
  $candidates = @(
    @{ exe = "py";      arg = "-3.11" },
    @{ exe = "py";      arg = "-3.12" },
    @{ exe = "py";      arg = "-3.13" },
    @{ exe = "py";      arg = "-3" },
    @{ exe = "python";  arg = $null },
    @{ exe = "python3"; arg = $null }
  )
  foreach ($c in $candidates) {
    if (-not (Get-Command $c.exe -ErrorAction SilentlyContinue)) { continue }
    $ver = Get-PythonVersion $c.exe $c.arg
    if ($ver -and ($ver.Major -gt 3 -or ($ver.Major -eq 3 -and $ver.Minor -ge 11))) {
      $a = @(); if ($c.arg) { $a = @($c.arg) }
      return @{ exe = $c.exe; args = $a; ver = $ver }
    }
  }
  # winget/python.org per-user installs often skip PATH; search known locations.
  $roots = @(
    (Join-Path $env:LOCALAPPDATA "Programs\Python"),
    (Join-Path $env:ProgramFiles "Python313"),
    (Join-Path $env:ProgramFiles "Python312"),
    (Join-Path $env:ProgramFiles "Python311")
  )
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    $found = Get-ChildItem -Path $root -Recurse -Filter python.exe -ErrorAction SilentlyContinue |
             Select-Object -First 1
    if ($found) {
      $ver = Get-PythonVersion $found.FullName $null
      if ($ver -and ($ver.Major -gt 3 -or ($ver.Major -eq 3 -and $ver.Minor -ge 11))) {
        return @{ exe = $found.FullName; args = @(); ver = $ver }
      }
    }
  }
  return $null
}

Write-Host "======================================" -ForegroundColor White
Write-Host "  Storyframe - Trinh tach truyen video" -ForegroundColor White
Write-Host "======================================" -ForegroundColor White

$hasWinget = [bool](Get-Command winget -ErrorAction SilentlyContinue)
if (-not $hasWinget) {
  Write-Warn2 "Khong tim thay 'winget' (App Installer). May co the tu cai it phu thuoc hon."
  Write-Warn2 "Neu gap loi, hay cap nhat Windows hoac cai 'App Installer' tu Microsoft Store."
}

# --- 1. Ensure a Python 3.11+ interpreter, then build the venv --------------

$venvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
  Write-Step "Kiem tra Python 3.11 tro len"
  $base = Find-BasePython

  if (-not $base -and $hasWinget) {
    Write-Warn2 "May chua co Python phu hop. Dang tu cai Python 3.11 (co the mat vai phut)..."
    winget install --id Python.Python.3.11 -e --accept-source-agreements --accept-package-agreements --silent | Out-Null
    Refresh-Path
    $base = Find-BasePython
  }

  if (-not $base) {
    Write-Warn2 "Khong the tu cai Python."
    Write-Host "    Hay cai Python 3.11 tu https://www.python.org/downloads/ (nho tick 'Add to PATH')," -ForegroundColor Yellow
    Write-Host "    hoac chay:  winget install Python.Python.3.11" -ForegroundColor Yellow
    Write-Host "    roi chay lai file nay." -ForegroundColor Yellow
    exit 1
  }
  Write-Ok "Dung Python $($base.ver.Major).$($base.ver.Minor)"

  Write-Step "Tao moi truong ao (.venv)"
  & $base.exe @($base.args) -m venv .venv
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $venvPython)) {
    Write-Warn2 "Tao venv that bai."; exit 1
  }
  Write-Ok "Da tao .venv"
} else {
  Write-Ok "Da co moi truong ao (.venv)"
}

# --- 2. Install / verify Python dependencies --------------------------------

Write-Step "Kiem tra thu vien Python"
& $venvPython -c "import storyframe_cli.gui.server, faster_whisper, rapidocr, scenedetect" 2>$null
$depsReady = ($LASTEXITCODE -eq 0)

if ($Update -or -not $depsReady) {
  if ($Update) { Write-Host "    Dang cap nhat thu vien..." }
  else         { Write-Host "    Lan chay dau tien - dang cai dat thu vien (co the mat vai phut)..." }
  & $venvPython -m pip install -U pip --quiet
  & $venvPython -m pip install -e ".[local,gui]" --quiet
  if ($LASTEXITCODE -ne 0) { Write-Warn2 "Cai dat thu vien that bai."; exit 1 }
  Write-Ok "Da cai dat xong thu vien"
} else {
  Write-Ok "Thu vien da san sang"
}

# --- 3. Ensure system tools (ffmpeg, deno) via winget -----------------------

function Ensure-Tool($name, $wingetId, $required) {
  if (Get-Command $name -ErrorAction SilentlyContinue) {
    Write-Ok "$name da co"
    return
  }
  if ($hasWinget) {
    Write-Host "    Dang cai $name (winget install $wingetId)..." -ForegroundColor Yellow
    winget install --id $wingetId -e --accept-source-agreements --accept-package-agreements --silent | Out-Null
    Refresh-Path
    if (Get-Command $name -ErrorAction SilentlyContinue) {
      Write-Ok "$name da cai xong"
    } else {
      Write-Warn2 "$name da cai nhung chua thay trong PATH - thu mo lai file nay neu gap loi."
    }
  } else {
    if ($required) { Write-Warn2 "Thieu $name. Cai bang: winget install $wingetId" }
    else           { Write-Warn2 "Thieu $name (chi can khi tai video YouTube). Cai bang: winget install $wingetId" }
  }
}

Write-Step "Kiem tra cong cu he thong"
Ensure-Tool "ffmpeg" "Gyan.FFmpeg" $true
Ensure-Tool "deno"   "DenoLand.Deno" $false

# --- 4. Start the server ----------------------------------------------------

Write-Step "Khoi dong ung dung"
Write-Host "    Dia chi: http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "    Nhan Ctrl+C de dung.`n" -ForegroundColor DarkGray

$serverArgs = @("-m", "storyframe_cli", "gui", "--port", "$Port")
if ($NoBrowser) { $serverArgs += "--no-browser" }
& $venvPython @serverArgs
