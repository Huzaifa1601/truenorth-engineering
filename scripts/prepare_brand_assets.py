from pathlib import Path
import base64
import io
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"D:\WhatsApp Image 2026-08-04 at 12.50.07 AM.jpeg")
OUT = ROOT / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

image = Image.open(SOURCE).convert("RGBA")
pixels = image.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, a = pixels[x, y]
        distance = max(0, 255 - r) + max(0, 255 - g) + max(0, 255 - b)
        pixels[x, y] = (r, g, b, 0 if distance < 34 else min(255, distance * 7))

alpha = image.getchannel("A")
bounds = alpha.getbbox()
image = image.crop(bounds)
canvas = image
side = max(image.width, image.height)
icon_canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0))
icon_canvas.alpha_composite(image, ((side - image.width) // 2, (side - image.height) // 2))

def save_png(name, size, source=icon_canvas):
    source.resize((size, size), Image.Resampling.LANCZOS).save(OUT / name, "PNG", optimize=True)

def save_logo(name, width, source=canvas):
    height = round(source.height * width / source.width)
    source.resize((width, height), Image.Resampling.LANCZOS).save(OUT / name, "PNG", optimize=True)

white = canvas.copy()
white_pixels = white.load()
for y in range(white.height):
    for x in range(white.width):
        r, g, b, a = white_pixels[x, y]
        if a and b > r * 1.12 and b > g * 1.02:
            white_pixels[x, y] = (247, 250, 253, a)

save_logo("logo.png", 1000)
save_logo("logo-white.png", 1000, white)
save_logo("logo-small.png", 240)
white_icon = Image.new("RGBA", (side, side), (255, 255, 255, 0))
white_icon.alpha_composite(white, ((side - white.width) // 2, (side - white.height) // 2))
save_png("favicon-32.png", 32, white_icon)
save_png("favicon-16.png", 16, white_icon)
save_png("apple-touch-icon.png", 180, white_icon)
white_icon.resize((64, 64), Image.Resampling.LANCZOS).save(OUT / "favicon.ico", "ICO", sizes=[(64, 64), (32, 32), (16, 16)])

def svg_image(name, png_name):
    data = base64.b64encode((OUT / png_name).read_bytes()).decode("ascii")
    ratio = canvas.width / canvas.height
    view_height = round(1000 / ratio)
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ' + str(view_height) + '" role="img"><image href="data:image/png;base64,' + data + '" width="1000" height="' + str(view_height) + '" preserveAspectRatio="xMidYMid meet"/></svg>'
    (OUT / name).write_text(svg, encoding="ascii")

svg_image("logo.svg", "logo.png")
svg_image("logo-white.svg", "logo-white.png")
