from pathlib import Path
from PIL import Image, ImageChops

source = Path("/home/ubuntu/webdev-static-assets/doutorelo/doutorelo-logo-oficial.jpg")
target = Path("/home/ubuntu/webdev-static-assets/doutorelo/doutorelo-logo-oficial-crop.jpg")

image = Image.open(source).convert("RGB")
background = Image.new("RGB", image.size, (255, 255, 255))
diff = ImageChops.difference(image, background)
# Ignore near-white compression noise by amplifying only meaningful differences.
diff = diff.point(lambda value: 255 if value > 18 else 0)
bbox = diff.getbbox()

if not bbox:
    raise SystemExit("No non-white content found in logo image")

left, top, right, bottom = bbox
margin_x = 56
margin_y = 44
crop_box = (
    max(0, left - margin_x),
    max(0, top - margin_y),
    min(image.width, right + margin_x),
    min(image.height, bottom + margin_y),
)

cropped = image.crop(crop_box)
cropped.save(target, quality=94, optimize=True)
print(target)
