from collections import deque
from pathlib import Path
from PIL import Image

SOURCE = Path('/home/ubuntu/webdev-static-assets/doutorelo-logo-oficial-web.png')
OUTPUT = Path('/home/ubuntu/webdev-static-assets/doutorelo-logo-oficial-transparente-final.png')

img = Image.open(SOURCE).convert('RGBA')
width, height = img.size
pixels = img.load()

# O único branco permitido pelo usuário é o pequeno círculo dentro do anel verde.
# No asset oficial de origem, esse círculo corresponde ao componente branco com
# centro aproximado em (224,166) e bbox (208,150)-(239,183), antes do recorte.
KEEP_WHITE_CIRCLE_CENTER = (224, 166)
KEEP_WHITE_CIRCLE_MAX_DISTANCE = 26


def is_whiteish(x: int, y: int) -> bool:
    r, g, b, a = pixels[x, y]
    if a == 0:
        return False
    return r >= 225 and g >= 225 and b >= 225 and (max(r, g, b) - min(r, g, b) <= 45)


def should_keep_authorized_white(x: int, y: int) -> bool:
    cx, cy = KEEP_WHITE_CIRCLE_CENTER
    dx = x - cx
    dy = y - cy
    return (dx * dx + dy * dy) <= KEEP_WHITE_CIRCLE_MAX_DISTANCE * KEEP_WHITE_CIRCLE_MAX_DISTANCE

visited = set()
components = []
for y in range(height):
    for x in range(width):
        if (x, y) in visited or not is_whiteish(x, y):
            continue
        queue = deque([(x, y)])
        visited.add((x, y))
        component = []
        while queue:
            cx, cy = queue.popleft()
            component.append((cx, cy))
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited and is_whiteish(nx, ny):
                    visited.add((nx, ny))
                    queue.append((nx, ny))
        components.append(component)

kept_white_pixels = 0
transparent_pixels = 0
for component in components:
    keep_component = any(should_keep_authorized_white(x, y) for x, y in component)
    for x, y in component:
        if keep_component and should_keep_authorized_white(x, y):
            # Preserva apenas o círculo branco autorizado, sem expandi-lo.
            kept_white_pixels += 1
            continue
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        transparent_pixels += 1

alpha = img.getchannel('A')
bbox = alpha.getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = max(20, int((right - left) * 0.035))
    pad_y = max(14, int((bottom - top) * 0.12))
    left = max(0, left - pad_x)
    top = max(0, top - pad_y)
    right = min(width, right + pad_x)
    bottom = min(height, bottom + pad_y)
    img = img.crop((left, top, right, bottom))

img.save(OUTPUT)
print(f'created={OUTPUT}')
print(f'size={img.size[0]}x{img.size[1]} mode={img.mode}')
print(f'alpha_extrema={img.getchannel("A").getextrema()}')
print(f'white_components_found={len(components)} transparent_pixels={transparent_pixels} kept_white_pixels={kept_white_pixels}')
