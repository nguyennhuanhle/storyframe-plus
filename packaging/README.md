# Packaging — Windows installer

This folder builds the downloadable Windows product so non-technical users can
**install and run Storyframe without Git**. It is a separate distribution
channel: nothing here changes the CLI, the web GUI, or `start.bat`.

## What it produces

- `dist/StoryframeSetup-<version>-x64.exe` — a normal installer (per-user, no
  admin). Creates Start Menu / Desktop shortcuts and opens the app in its own
  window.
- `dist/Storyframe-<version>-portable-x64.zip` — unzip and run `Storyframe.vbs`,
  no installation.

## How it works

Instead of freezing with PyInstaller (which fights the ML native deps), the
build ships a **real relocatable Python** with everything preinstalled:

```
%LOCALAPPDATA%\Storyframe\
├── python\             relocatable CPython + installed storyframe-plus[local,gui,desktop]
├── bin\                ffmpeg.exe, ffprobe.exe, deno.exe
├── storyframe_app.pyw  bootstrap: puts bin\ on PATH, launches the desktop window
├── Storyframe.vbs      portable launcher (no console)
└── storyframe.ico
```

The speech-recognition model (~0.5 GB) still downloads on first use, keeping the
installer smaller. Outputs are written to `Documents\Storyframe\`.

## Build locally

```powershell
winget install JRSoftware.InnoSetup      # one time
powershell -ExecutionPolicy Bypass -File packaging\build.ps1 -Version 0.3.0
```

Artifacts land in `packaging/dist/`. Build outputs (`build/`, `dist/`,
`downloads/`) are git-ignored.

## Build in CI / publish a release

`.github/workflows/release.yml` builds on a Windows runner. Push a tag to
publish a GitHub Release with both artifacts attached:

```bash
git tag v0.3.0
git push origin v0.3.0
```

Or run the workflow manually (Actions → Build installer → Run workflow) to get
the artifacts without creating a release.

## Known limitations / TODO

- **Unsigned**: Windows SmartScreen shows "unknown publisher". Users click
  *More info → Run anyway*. Fix later with code signing (e.g. Azure Trusted
  Signing).
- **yt-dlp ages**: YouTube changes break yt-dlp over time. The app should
  self-update yt-dlp on download failure (planned).
- **Size**: expect roughly 400–800 MB installed (ML runtimes are heavy).
