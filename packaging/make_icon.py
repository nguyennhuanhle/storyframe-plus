"""Generate packaging/assets/storyframe.ico from the app's book+star mark."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "assets" / "storyframe.ico"
OUT.parent.mkdir(parents=True, exist_ok=True)

SIZE = 256
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Purple rounded square, matching the in-app logo mark.
draw.rounded_rectangle([18, 18, 238, 238], radius=54, fill=(122, 91, 255, 255))

# Book emoji centered on top, using the Windows color-emoji font.
try:
    font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 150)
    draw.text((128, 132), "\U0001F4D6", font=font, anchor="mm", embedded_color=True)
except Exception:
    # Fallback: draw a simple white book + yellow star if emoji is unavailable.
    draw.rounded_rectangle([64, 84, 192, 176], radius=10, fill=(255, 255, 255, 255))
    draw.line([128, 92, 128, 168], fill=(200, 190, 255, 255), width=4)
    draw.polygon(
        [(196, 60), (204, 82), (228, 82), (208, 98), (216, 122),
         (196, 108), (176, 122), (184, 98), (164, 82), (188, 82)],
        fill=(255, 216, 77, 255),
    )

sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(OUT, sizes=sizes)
print(f"wrote {OUT}")
