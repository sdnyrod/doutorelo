from pathlib import Path

from PIL import Image

TARGET = Path('/home/ubuntu/webdev-static-assets/doutorelo-logo-branca-pulso-vermelho.png')
img = Image.open(TARGET).convert('RGBA')
w, h = img.size
pixels = list(img.getdata())

total = len(pixels)
transparent = sum(1 for r, g, b, a in pixels if a == 0)
visible = total - transparent
white_pixels = sum(
    1
    for r, g, b, a in pixels
    if a >= 180 and r >= 220 and g >= 220 and b >= 220 and max(r, g, b) - min(r, g, b) <= 55
)
red_pixels = sum(
    1
    for r, g, b, a in pixels
    if a >= 160 and r >= 180 and g <= 90 and b <= 105
)

print(f'target={TARGET}')
print(f'size={w}x{h} visible_pixels={visible} transparent_pixels={transparent}')
print(f'visible_white_pixels={white_pixels}')
print(f'visible_red_pixels={red_pixels}')

if visible <= 0:
    raise SystemExit('FAIL: expected visible logo pixels')
if transparent <= 0:
    raise SystemExit('FAIL: expected transparent background around the logo')
if white_pixels < 100:
    raise SystemExit(f'FAIL: expected visible white wordmark pixels, found {white_pixels}')
if red_pixels < 40:
    raise SystemExit(f'FAIL: expected visible red pulse pixels, found {red_pixels}')

print('PASS: approved white wordmark and red pulse logo remains visible with transparency')
