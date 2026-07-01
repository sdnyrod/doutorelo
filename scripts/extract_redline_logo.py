from __future__ import annotations

from pathlib import Path

from PIL import Image

SOURCE = Path("/home/ubuntu/webdev-static-assets/doutorelo-redline-logo-work/page-000.png")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/doutorelo-logo-branca-pulso-vermelho.png")
PREVIEW = Path("/home/ubuntu/webdev-static-assets/doutorelo-redline-logo-work/crop-preview.png")

img = Image.open(SOURCE).convert("RGBA")
# Page 2 has the approved principal wordmark centered in the logo card.
# Coordinates deliberately exclude the small 'LOGO PRINCIPAL' label and card borders.
manual_region = (455, 610, 1145, 790)
region = img.crop(manual_region)

pixels = region.load()
width, height = region.size
mask_points: list[tuple[int, int]] = []

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Keep navy letters, red pulse, green connector and antialiased colored edges;
        # discard the white/off-white background.
        if a > 0 and not (r > 238 and g > 238 and b > 238):
            # Avoid capturing extremely pale card noise while retaining light red line edges.
            if min(r, g, b) < 225 or abs(int(r) - int(g)) > 18 or abs(int(g) - int(b)) > 18:
                mask_points.append((x, y))

if not mask_points:
    raise RuntimeError("No logo pixels detected in crop region")

left = max(0, min(x for x, _ in mask_points) - 34)
top = max(0, min(y for _, y in mask_points) - 30)
right = min(width, max(x for x, _ in mask_points) + 35)
bottom = min(height, max(y for _, y in mask_points) + 31)
logo = region.crop((left, top, right, bottom)).convert("RGBA")

# Convert the white field to transparency. Use a soft alpha ramp to keep antialiasing.
out_pixels = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = out_pixels[x, y]
        whiteness = min(r, g, b)
        if r > 246 and g > 246 and b > 246:
            out_pixels[x, y] = (255, 255, 255, 0)
        elif r > 235 and g > 235 and b > 235:
            alpha = max(0, min(255, int((246 - whiteness) * 20)))
            out_pixels[x, y] = (r, g, b, min(a, alpha))

# Upscale modestly for crisp display in the app header without changing proportions.
scale = 2
logo = logo.resize((logo.width * scale, logo.height * scale), Image.Resampling.LANCZOS)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
logo.save(OUTPUT)
logo.convert("RGB").save(PREVIEW)
print({"source": str(SOURCE), "output": str(OUTPUT), "preview": str(PREVIEW), "manual_region": manual_region, "bbox_in_region": (left, top, right, bottom), "output_size": logo.size})
