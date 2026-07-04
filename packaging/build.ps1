<#
  Build the Storyframe Windows installer (StoryframeSetup-<version>-x64.exe)
  and a portable zip.

  What it does:
    1. Downloads a relocatable CPython (python-build-standalone)
    2. Installs Storyframe + all dependencies into it (no PyInstaller)
    3. Bundles ffmpeg, ffprobe, and deno
    4. Produces a portable zip and an Inno Setup installer

  Requirements: internet, and Inno Setup 6 (ISCC.exe) on PATH or default path.
    winget install JRSoftware.InnoSetup

  Usage:
    powershell -ExecutionPolicy Bypass -File packaging\build.ps1 -Version 0.3.0
#>
param(
  [string]$Version = "0.3.0",
  [string]$PyVersion = "3.11",
  [switch]$Clean
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"  # much faster Invoke-WebRequest downloads

$Pkg      = $PSScriptRoot
$Root     = Split-Path -Parent $Pkg
$Build    = Join-Path $Pkg "build"
$Staging  = Join-Path $Build "staging"
$Downloads= Join-Path $Build "downloads"
$Dist     = Join-Path $Pkg "dist"

function Say($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Ok($m)  { Write-Host "    [OK] $m" -ForegroundColor Green }

if ($Clean -and (Test-Path $Build)) { Remove-Item $Build -Recurse -Force }
if (Test-Path $Staging) { Remove-Item $Staging -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Staging, $Downloads, $Dist | Out-Null

$headers = @{ "User-Agent" = "storyframe-build" }

# --- 1. Relocatable CPython ------------------------------------------------
Say "Resolving python-build-standalone ($PyVersion)"
$rel = Invoke-RestMethod "https://api.github.com/repos/astral-sh/python-build-standalone/releases/latest" -Headers $headers
$pyPattern = "cpython-$([regex]::Escape($PyVersion))\.\d+\+.*x86_64-pc-windows-msvc-install_only\.tar\.gz$"
$asset = $rel.assets | Where-Object { $_.name -match $pyPattern } | Select-Object -First 1
if (-not $asset) { throw "No python-build-standalone asset matched: $pyPattern" }
$pyTar = Join-Path $Downloads $asset.name
if (-not (Test-Path $pyTar)) { Invoke-WebRequest $asset.browser_download_url -OutFile $pyTar }
Ok $asset.name

Say "Extracting Python"
tar -xzf $pyTar -C $Staging
$Py = Join-Path $Staging "python\python.exe"
if (-not (Test-Path $Py)) { throw "python.exe not found after extract: $Py" }
Ok (& $Py --version 2>&1)

# --- 2. Install Storyframe + dependencies ----------------------------------
Say "Installing Storyframe and dependencies (several minutes)"
& $Py -m pip install --upgrade pip --quiet
& $Py -m pip install "$Root[local,gui,desktop]" --quiet
if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
# Trim caches to shrink the bundle.
Get-ChildItem $Staging -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
$pipCache = Join-Path $Staging "python\Lib\site-packages\pip\_vendor"
Ok "dependencies installed"

# --- 3. ffmpeg + ffprobe ---------------------------------------------------
Say "Downloading ffmpeg"
$ffZip = Join-Path $Downloads "ffmpeg-release-essentials.zip"
if (-not (Test-Path $ffZip)) {
  Invoke-WebRequest "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile $ffZip
}
$ffDir = Join-Path $Build "ffmpeg"
if (Test-Path $ffDir) { Remove-Item $ffDir -Recurse -Force }
Expand-Archive $ffZip -DestinationPath $ffDir -Force
$binDst = Join-Path $Staging "bin"
New-Item -ItemType Directory -Force -Path $binDst | Out-Null
Get-ChildItem $ffDir -Recurse -Include ffmpeg.exe, ffprobe.exe |
  ForEach-Object { Copy-Item $_.FullName $binDst -Force }
Ok "ffmpeg + ffprobe bundled"

# --- 4. deno ---------------------------------------------------------------
Say "Downloading deno"
$denoRel = Invoke-RestMethod "https://api.github.com/repos/denoland/deno/releases/latest" -Headers $headers
$denoAsset = $denoRel.assets | Where-Object { $_.name -eq "deno-x86_64-pc-windows-msvc.zip" } | Select-Object -First 1
if (-not $denoAsset) { throw "deno windows asset not found" }
$denoZip = Join-Path $Downloads "deno.zip"
if (-not (Test-Path $denoZip)) { Invoke-WebRequest $denoAsset.browser_download_url -OutFile $denoZip }
Expand-Archive $denoZip -DestinationPath $binDst -Force
Ok "deno bundled"

# --- 5. WebView2 bootstrapper ----------------------------------------------
Say "Downloading WebView2 bootstrapper"
try {
  Invoke-WebRequest "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile (Join-Path $Staging "webview2setup.exe")
  Ok "webview2 bootstrapper bundled"
} catch {
  Write-Host "    [!] WebView2 bootstrapper download failed; skipping (most PCs already have it)." -ForegroundColor Yellow
}

# --- 6. App launcher files -------------------------------------------------
Say "Adding launcher files"
Copy-Item (Join-Path $Pkg "storyframe_app.pyw") $Staging -Force
Copy-Item (Join-Path $Pkg "Storyframe.vbs")     $Staging -Force
$icon = Join-Path $Pkg "assets\storyframe.ico"
if (-not (Test-Path $icon)) { & $Py (Join-Path $Pkg "make_icon.py") }
Copy-Item $icon $Staging -Force
Ok "launcher files staged"

# --- 7. Portable zip -------------------------------------------------------
Say "Building portable zip"
$portable = Join-Path $Dist "Storyframe-$Version-portable-x64.zip"
if (Test-Path $portable) { Remove-Item $portable -Force }
Compress-Archive -Path (Join-Path $Staging "*") -DestinationPath $portable
Ok ("portable: {0} MB" -f [math]::Round((Get-Item $portable).Length / 1MB, 1))

# --- 8. Inno Setup installer ----------------------------------------------
Say "Compiling installer with Inno Setup"
$iscc = (Get-Command iscc -ErrorAction SilentlyContinue).Source
if (-not $iscc) {
  foreach ($p in @(
      "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
      "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
      "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe")) {
    if (Test-Path $p) { $iscc = $p; break }
  }
}
if (-not $iscc) { throw "Inno Setup (ISCC.exe) not found. Install: winget install JRSoftware.InnoSetup" }

& $iscc "/DMyAppVersion=$Version" "/DStagingDir=$Staging" "/DOutputDir=$Dist" (Join-Path $Pkg "storyframe.iss")
if ($LASTEXITCODE -ne 0) { throw "Inno Setup compile failed" }

Say "Done"
Get-ChildItem $Dist | Sort-Object Name |
  Format-Table Name, @{ N = "Size(MB)"; E = { [math]::Round($_.Length / 1MB, 1) } } -AutoSize
