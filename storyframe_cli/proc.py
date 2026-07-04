from __future__ import annotations

import os
import subprocess
import sys


def no_window_creationflags() -> int:
    """Return CREATE_NO_WINDOW for internal tool subprocesses when the packaged
    desktop app is running (it sets ``STORYFRAME_NO_CONSOLE=1``).

    Under ``pythonw`` there is no console, so every ffmpeg/ffprobe/yt-dlp launch
    would otherwise pop its own console window. This is gated on an explicit env
    var (set by the desktop app and inherited by the engine subprocess) rather
    than console detection, which is unreliable for CREATE_NO_WINDOW children.

    Returns 0 for normal CLI and browser-GUI use, so their behavior is unchanged.
    """
    if sys.platform == "win32" and os.environ.get("STORYFRAME_NO_CONSOLE") == "1":
        return subprocess.CREATE_NO_WINDOW
    return 0
