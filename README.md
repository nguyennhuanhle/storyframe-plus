# Storyframe Plus

[Tiếng Việt](README.vi.md)

Turn read-aloud story videos into a **PDF picture book** and an **MP3** of the
narration — entirely on your own machine. Storyframe Plus extracts clean
story-text frames from a video, exports the narration audio as MP3, and packages
the selected images into a PDF.

> This is a fork of [storyframe-cli](https://github.com/thieung/storyframe-cli)
> that adds a friendly local **web GUI** for non-technical users, first-class
> **Windows** support, a one-click launcher, and several reliability fixes.

<p align="center">
  <img src="docs/assets/storyframe-cli-overview.png" alt="Storyframe overview" width="720">
</p>

Supports:

- YouTube URLs, with local download cache
- single local video files
- folders of videos

## Platforms

| Platform | Status |
| --- | --- |
| Windows | Supported. Use `start.bat` for one-click setup. |
| macOS | Supported and tested. |
| Linux | Supported if system packages are installed. |

## Quick start (Windows)

1. Download this repository (green **Code** button → **Download ZIP**, then
   unzip) or clone it.
2. Double-click **`start.bat`**.
3. Wait for the first-run setup to finish — the app then opens in your browser.

On the first run the launcher installs everything it needs automatically —
Python (if missing), the Python libraries, `ffmpeg`, and `deno` (used for
YouTube downloads) — via `winget`. Re-run `start.bat` any time to open the app;
pass `-Update` to upgrade dependencies. The AI speech model (~0.5&nbsp;GB)
downloads the first time you process a video.

## Manual install (any platform)

System tools:

```bash
# Windows
winget install Gyan.FFmpeg DenoLand.Deno
# macOS
brew install ffmpeg
# Linux
sudo apt-get install ffmpeg
```

`ffmpeg` is required. `deno` (or another yt-dlp JS runtime) is required for
YouTube downloads. `tesseract` is optional — it is only used as an OCR fallback.

Clone and install:

```bash
git clone https://github.com/nguyennhuanhle/storyframe-plus.git
cd storyframe-plus
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[local,gui]"
```

Python 3.11+ is required.

Python dependencies:

- base: `liteparse`, `numpy`, `opencv-python-headless`, `pillow`, `yt-dlp`
- local pipeline (`local`): `faster-whisper`, `imagehash`, `pytesseract`,
  `rapidocr`, `rapidfuzz`, `scenedetect`, `scikit-image`
- web GUI (`gui`): `fastapi`, `uvicorn`, `python-multipart`

`faster-whisper` downloads the selected ASR model on first use.

## Web GUI

Start the local web interface:

```bash
storyframe gui
```

The browser opens at `http://127.0.0.1:8765`. From there you can:

- Paste a YouTube link or pick a local video, and start processing.
- Watch friendly per-stage progress, and cancel a running job.
- Listen to the MP3, then open or download the PDF when it is ready.
- Review the pages: frames flagged **needs review** are outlined; remove or
  restore pages and rebuild the PDF in seconds.
- Delete a project (also removes its files from disk).
- Open the built-in user guide (**Hướng dẫn sử dụng**).

Everything runs locally; jobs and outputs persist under
`outputs/storyframe-runs`. The interface is in Vietnamese, aimed at
non-technical users.

## Command line

YouTube:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID"
```

Local file:

```bash
storyframe run "/path/to/book.mp4"
```

Folder:

```bash
storyframe run "/path/to/video-folder"
```

Videos without on-frame story text:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force
```

Faster reruns for YouTube:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

Nested folders:

```bash
storyframe run "/path/to/video-folder" --recursive
```

## Use With Codex App Or Claude Desktop

Open this repository as the working folder, then use one of these prompts.
These prompts assume the app can access your local files and terminal.

YouTube run:

```text
Install the local dependencies for this repo, then run Storyframe on:
https://www.youtube.com/watch?v=VIDEO_ID

Keep outputs under outputs/storyframe-runs, reuse the YouTube cache, and do not
commit generated MP3/PDF/JPG files. After the run, summarize the output folder
and any rows marked needs_review.
```

Folder batch:

```text
Run Storyframe on every video in /path/to/video-folder recursively.
Keep work files for review, report the output paths, and do not commit generated media.
```

## Output

By default, each video writes to:

```text
outputs/storyframe-runs/<video-name>/
```

Main files:

```text
<video-name>.mp3
<video-name>.pdf
frames/*.jpg
review-index.csv
review-contact-sheet.jpg
manifest.json
```

## CPU Usage

Storyframe is local/free, so the first run can use a lot of CPU. The heavy
steps are OCR over sampled frames, scene/page detection, and local ASR when no
YouTube captions are available.

Recommended command for YouTube videos:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

`--speed auto` uses YouTube captions when available and keeps an OCR/frame
cache under `<output-root>/_work/cache`, so rerunning the same video is much
lighter.

If your machine gets too hot, cap CPU threads:

```bash
OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 \
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

For videos with no story text on screen, use caption rendering:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto --caption-mode force
```

## Useful Options

```bash
# Choose output directory.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --output-root runs

# Reuse a shared YouTube cache.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" \
  --download-cache-dir outputs/storyframe-youtube-cache

# Use browser cookies if YouTube asks for login.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --cookies-from-browser chrome

# Render transcript captions when the video has no story text on frames.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force

# Use YouTube captions when available and reuse OCR/frame cache.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto

# Keep raw scanned frames and work files for debugging.
storyframe run "/path/to/book.mp4" --keep-work
```

Basic help:

```bash
storyframe run --help
```

Advanced OCR/ASR tuning flags:

```bash
storyframe run --advanced-help
```

## Notes

- `strict-complete` is the default quality mode.
- `--caption-mode off` is the default to protect videos that already have
  story text on frames.
- Use `--caption-mode force` for videos with no on-frame story text. Use
  `--caption-mode auto` only when you want Storyframe to detect that case.
- Use `--speed auto` to skip local ASR when YouTube captions are available and
  reuse OCR/frame cache on reruns. If captions are unavailable, it uses an
  OCR-first fallback for videos that already show story text on screen.
- YouTube downloads are cached under `<output-root>/_youtube-cache`.
- Only process videos you have the right to download, transform, and store.

## Development

```bash
python3 -m unittest discover -s tests
python3 -m storyframe_cli run "https://www.youtube.com/watch?v=VIDEO_ID"
python3 -m storyframe_cli gui
```
