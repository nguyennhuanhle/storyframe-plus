from __future__ import annotations

import os

from PIL import ImageFont


def _candidate_font_paths() -> list[str]:
    paths: list[str] = []
    windir = os.environ.get("WINDIR") or os.environ.get("SystemRoot") or r"C:\Windows"
    fonts_dir = os.path.join(windir, "Fonts")
    paths += [
        os.path.join(fonts_dir, name)
        for name in ("arialbd.ttf", "seguisb.ttf", "segoeui.ttf", "arial.ttf")
    ]
    paths += [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    return paths


def load_scaled_font(size: int) -> ImageFont.ImageFont:
    """Load a TrueType font at the requested pixel size, trying Windows, macOS,
    and Linux locations.

    The important part on Windows: the hardcoded macOS/Linux paths never resolve,
    so the old code fell back to ``ImageFont.load_default()`` — a fixed ~11px
    bitmap font that ignores ``size`` and renders captions tiny. We always prefer
    a real scalable font.
    """
    size = max(1, int(size))
    for path in _candidate_font_paths():
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    try:
        # Pillow >= 10.1 returns a scalable default when given a size.
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()
