from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

palette = [
    ("Creme Vivo", "#FFFDF8", "Fundo principal"),
    ("Areia Clara", "#FFF7EC", "Fundo secundário"),
    ("Menta Calma", "#E7F7EF", "Cuidado leve"),
    ("Sálvia Elo", "#DCEEE4", "Vínculo"),
    ("Coral Presença", "#F8735B", "Ação humana"),
    ("Verde Tinta", "#213832", "Texto principal"),
    ("Verde Profundo", "#3E7A68", "Confiança"),
    ("Rosa Pele", "#FFE6DF", "Apoio sensível"),
]

out = Path("/home/ubuntu/saude-integrativa-ia-dev/brand-palette-v1.png")
W, H = 1600, 980
img = Image.new("RGB", (W, H), "#FFFDF8")
d = ImageDraw.Draw(img)

try:
    title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58)
    subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    label_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
except Exception:
    title_font = subtitle_font = label_font = small_font = None

d.text((80, 70), "Paleta inicial de marca", fill="#213832", font=title_font)
d.text((80, 145), "Saúde integrativa, vínculo humano e tecnologia discreta", fill="#3E7A68", font=subtitle_font)

x0, y0 = 80, 240
card_w, card_h = 340, 250
gap_x, gap_y = 40, 48
for i, (name, hexv, role) in enumerate(palette):
    row, col = divmod(i, 4)
    x = x0 + col * (card_w + gap_x)
    y = y0 + row * (card_h + gap_y)
    d.rounded_rectangle((x, y, x + card_w, y + card_h), radius=28, fill="white", outline="#E4DCCC", width=2)
    d.rounded_rectangle((x + 18, y + 18, x + card_w - 18, y + 126), radius=22, fill=hexv)
    text_fill = "#213832"
    if hexv in ["#213832", "#3E7A68", "#F8735B"]:
        sample_fill = "#FFFDF8"
    else:
        sample_fill = "#213832"
    d.text((x + 40, y + 55), "Aa", fill=sample_fill, font=title_font)
    d.text((x + 24, y + 150), name, fill=text_fill, font=label_font)
    d.text((x + 24, y + 190), hexv, fill="#65776F", font=small_font)
    d.text((x + 24, y + 220), role, fill="#65776F", font=small_font)

# Footer guidance
d.rounded_rectangle((80, 875, 1520, 925), radius=24, fill="#E7F7EF", outline="#DCEEE4", width=2)
d.text((115, 889), "Regra de uso: verde estrutura a confiança; coral chama para ação; creme cria respiro; sálvia e menta sustentam cuidado.", fill="#213832", font=small_font)

img.save(out)
print(out)
