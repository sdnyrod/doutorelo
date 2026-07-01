from collections import deque
from pathlib import Path
from PIL import Image

SOURCE = Path('/home/ubuntu/webdev-static-assets/doutorelo-logo-oficial-web.png')
img = Image.open(SOURCE).convert('RGBA')
w, h = img.size
px = img.load()


def is_whiteish(x, y):
    r, g, b, a = px[x, y]
    if a == 0:
        return False
    # white/off-white backing and internal white areas; keeps gray lettering out.
    return r >= 225 and g >= 225 and b >= 225 and (max(r, g, b) - min(r, g, b) <= 45)

visited = set()
components = []
for y in range(h):
    for x in range(w):
        if (x, y) in visited or not is_whiteish(x, y):
            continue
        q = deque([(x, y)])
        visited.add((x, y))
        area = 0
        sx = sy = 0
        minx = maxx = x
        miny = maxy = y
        border = False
        while q:
            cx, cy = q.popleft()
            area += 1
            sx += cx
            sy += cy
            minx = min(minx, cx)
            maxx = max(maxx, cx)
            miny = min(miny, cy)
            maxy = max(maxy, cy)
            if cx in (0, w - 1) or cy in (0, h - 1):
                border = True
            for nx, ny in ((cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited and is_whiteish(nx, ny):
                    visited.add((nx, ny))
                    q.append((nx, ny))
        if area >= 15:
            components.append({
                'area': area,
                'bbox': (minx, miny, maxx, maxy),
                'center': (sx / area, sy / area),
                'border': border,
                'box_size': (maxx - minx + 1, maxy - miny + 1),
            })

print(f'source={SOURCE}')
print(f'size={w}x{h}')
print(f'components={len(components)}')
for i, c in enumerate(sorted(components, key=lambda item: item['area'], reverse=True)[:40], start=1):
    print(f"#{i:02d} area={c['area']} bbox={c['bbox']} size={c['box_size']} center=({c['center'][0]:.1f},{c['center'][1]:.1f}) border={c['border']}")
