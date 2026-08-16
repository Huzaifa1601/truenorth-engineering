from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "img"
SOURCES = {
    "industrial": Path(r"D:\WhatsApp Image 2026-08-04 at 1.06.41 AM.jpeg"),
    "hvac": Path(r"D:\WhatsApp Image 2026-08-04 at 12.57.19 AM.jpeg"),
}


def save_crop(source_key, box, output_name, size):
    image = Image.open(SOURCES[source_key]).convert("RGB")
    crop = image.crop(box).resize(size, Image.Resampling.LANCZOS)
    crop = ImageEnhance.Contrast(crop).enhance(1.04)
    crop.save(OUTPUT / output_name, "WEBP", quality=86, method=6)


OUTPUT.mkdir(parents=True, exist_ok=True)
save_crop("industrial", (760, 60, 1536, 358), "hero-industrial.webp", (1600, 740))
save_crop("hvac", (410, 72, 1024, 414), "project-hvac.webp", (960, 640))
save_crop("hvac", (58, 430, 396, 648), "project-pump-room.webp", (960, 640))
