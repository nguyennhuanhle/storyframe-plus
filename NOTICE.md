# Storyframe Plus — notices

## Fork and licensing scope

This project is a fork of
[storyframe-cli](https://github.com/thieung/storyframe-cli).

The [MIT license](LICENSE) covers the contributions made in **this fork** —
the web GUI, the desktop app, the packaging/installer, the bilingual
interface, and related changes.

The upstream project `storyframe-cli` does **not** declare a license, so code
originating from it remains under its original author's copyright. If you plan
to redistribute or relicense the project as a whole, please confirm terms with
the upstream author.

## Third-party components

The application depends on — and, in the packaged installer/portable builds,
bundles — third-party software, each under its own license. This project's MIT
license does **not** cover them; refer to each project for its terms.

- **Python** (PSF License) — bundled in the installer / portable build
- **FFmpeg** (https://ffmpeg.org) — bundled binary from the
  [Gyan.dev](https://www.gyan.dev/ffmpeg/builds/) builds, distributed as a
  separate program under its own (L)GPL terms
- **Deno** (MIT) — bundled binary; used by yt-dlp as a JavaScript runtime
- **yt-dlp** (Unlicense)
- **faster-whisper** (MIT), **RapidOCR** (Apache-2.0),
  **PySceneDetect** (BSD-3-Clause)
- **OpenCV**, **NumPy**, **scikit-image**, **Pillow**, **imagehash**,
  **rapidfuzz**
- **FastAPI**, **Uvicorn**, **pywebview**

The speech-recognition model downloaded at first run is provided by its
respective publisher under its own terms.
