"""Install-root bootstrap for the packaged Storyframe desktop app.

Placed next to the bundled ``python\`` and ``bin\`` folders. It puts the bundled
ffmpeg/ffprobe/deno on PATH, then launches the desktop window. Run with the
bundled ``pythonw.exe`` (no console).
"""
import os
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
bin_dir = here / "bin"

os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")
os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONUNBUFFERED", "1")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ["STORYFRAME_NO_CONSOLE"] = "1"

try:
    from storyframe_cli.gui.desktop import main
    main()
except Exception:
    # Surface fatal startup errors to the user instead of failing silently.
    import traceback

    message = traceback.format_exc()
    log = here / "storyframe-error.log"
    try:
        log.write_text(message, encoding="utf-8")
    except Exception:
        pass
    try:
        import ctypes

        ctypes.windll.user32.MessageBoxW(
            None,
            "Storyframe could not start.\n\nDetails were saved to:\n" + str(log),
            "Storyframe",
            0x10,
        )
    except Exception:
        pass
    sys.exit(1)
