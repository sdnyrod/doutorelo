from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path('/home/ubuntu/saude-integrativa-ia-dev')
OUT_PNG = ROOT / 'home-preview-approval.png'
OUT_PDF = ROOT / 'home-preview-approval.pdf'
LOGO_PATH = Path('/home/ubuntu/webdev-static-assets/doutorelo-logo-branca-pulso-vermelho.png')

W, H = 1600, 900
WHITE = '#FFFFFF'
OFF_WHITE = '#F7F8FA'
NAVY = '#0D1B2D'
STEEL = '#6A7488'
MIST = '#E5E7EB'
MIST_DARK = '#D8DEE8'
GREEN = '#3BC7A2'
RED = '#FF2432'

FONT_REG = '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf'
FONT_MED = '/usr/share/fonts/truetype/noto/NotoSans-Medium.ttf'
FONT_BOLD = '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf'


def font(size: int, weight: str = 'regular'):
    if weight == 'bold':
        path = FONT_BOLD
    elif weight == 'medium':
        path = FONT_MED
    else:
        path = FONT_REG
    return ImageFont.truetype(path, size=size)


def rgba(hex_color: str, alpha: int) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def rounded_layer(size=(W, H)) -> Image.Image:
    return Image.new('RGBA', size, (0, 0, 0, 0))


def shadowed_round(canvas: Image.Image, box, radius, fill, outline=None, width=1, shadow=(13, 27, 45, 14), blur=18, offset=(0, 8)):
    x1, y1, x2, y2 = box
    if shadow and shadow[3] > 0:
        shadow_layer = rounded_layer(canvas.size)
        sdraw = ImageDraw.Draw(shadow_layer)
        sx, sy = offset
        sdraw.rounded_rectangle((x1 + sx, y1 + sy, x2 + sx, y2 + sy), radius=radius, fill=shadow)
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur))
        canvas.alpha_composite(shadow_layer)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_text_center(draw: ImageDraw.ImageDraw, box, text: str, fnt: ImageFont.FreeTypeFont, fill):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x1, y1, x2, y2 = box
    draw.text((x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2 - 2), text, font=fnt, fill=fill)


def paste_logo(canvas: Image.Image, path: Path, center_xy, max_w: int, max_h: int):
    logo = Image.open(path).convert('RGBA')
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    ratio = min(max_w / logo.width, max_h / logo.height)
    resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)
    x = int(center_xy[0] - resized.width / 2)
    y = int(center_xy[1] - resized.height / 2)
    canvas.alpha_composite(resized, (x, y))
    return (x, y, x + resized.width, y + resized.height)


def draw_pulse(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, color: str = RED, width: int = 2):
    points = [
        (x, y),
        (x + int(w * .23), y),
        (x + int(w * .30), y - 1),
        (x + int(w * .37), y - 9),
        (x + int(w * .46), y + 9),
        (x + int(w * .55), y),
        (x + int(w * .66), y),
        (x + int(w * .73), y - 7),
        (x + int(w * .82), y + 8),
        (x + int(w * .90), y),
        (x + w, y),
    ]
    draw.line(points, fill=color, width=width, joint='curve')


def draw_menu_button(img: Image.Image):
    draw = ImageDraw.Draw(img)
    shadowed_round(img, (32, 32, 92, 92), 30, WHITE, MIST_DARK, 1, shadow=(13, 27, 45, 18), blur=14, offset=(0, 6))
    for yy, x2 in ((53, 70), (62, 65), (71, 70)):
        draw.rounded_rectangle((53, yy, x2, yy + 3), radius=2, fill=NAVY)


def draw_status_pill(img: Image.Image):
    draw = ImageDraw.Draw(img)
    box = (1168, 72, 1488, 130)
    shadowed_round(img, box, 29, WHITE, MIST_DARK, 1, shadow=(13, 27, 45, 10), blur=10, offset=(0, 4))
    draw.ellipse((1192, 94, 1206, 108), fill=GREEN)
    draw.text((1220, 88), 'IA INTEGRATIVA ATIVA', font=font(18, 'bold'), fill=GREEN)


def draw_silent_orbital_field(img: Image.Image):
    """Reproduces the Home's silent atmospheric band as barely visible clinical lines, not colored fog."""
    draw = ImageDraw.Draw(img)
    y = 212
    draw.line((260, y, 610, y), fill='#EDF0F4', width=2)
    draw.line((990, y, 1340, y), fill='#EDF0F4', width=2)
    draw.ellipse((618, y - 5, 628, y + 5), fill='#EEF2F6', outline=MIST)
    draw.ellipse((972, y - 5, 982, y + 5), fill='#EEF2F6', outline=MIST)
    draw_pulse(draw, 690, y, 220, RED, 2)
    draw.line((742, y + 34, 858, y + 34), fill=GREEN, width=2)


def draw_chat_composer(img: Image.Image):
    draw = ImageDraw.Draw(img)
    # The real initial Home has no visible conversation history: only the composer capsule in the center.
    shell = (150, 456, 1450, 594)
    shadowed_round(img, shell, 58, WHITE, MIST_DARK, 2, shadow=(13, 27, 45, 20), blur=20, offset=(0, 9))

    # Thin red micro-accent only; never a red background or halo.
    draw.line((228, 456, 480, 456), fill=RED, width=2)
    draw.line((1120, 456, 1372, 456), fill=RED, width=2)

    # Left signal indicator mirrors the small input core, recolored as a clinical pulse microdetail.
    shadowed_round(img, (192, 500, 246, 554), 27, WHITE, MIST, 1, shadow=(13, 27, 45, 5), blur=6, offset=(0, 2))
    draw.rounded_rectangle((216, 514, 222, 540), radius=3, fill=RED)

    draw.text((282, 507), 'Digite sua mensagem.', font=font(35, 'medium'), fill=STEEL)

    # Circular send action, matching the coded navy -> green -> red direction without large colored glow.
    cx, cy, r = 1380, 527, 36
    button_layer = rounded_layer(img.size)
    bdraw = ImageDraw.Draw(button_layer)
    for i in range(r, 0, -1):
        t = i / r
        if t > 0.55:
            color = rgba(NAVY, 255)
        elif t > 0.20:
            color = rgba(GREEN, 255)
        else:
            color = rgba(RED, 255)
        bdraw.ellipse((cx - i, cy - i, cx + i, cy + i), fill=color)
    shadowed_round(img, (cx - r, cy - r, cx + r, cy + r), r, (0, 0, 0, 0), None, 0, shadow=(13, 27, 45, 18), blur=9, offset=(0, 5))
    img.alpha_composite(button_layer)
    draw = ImageDraw.Draw(img)
    draw.line((1365, 527, 1393, 527), fill=WHITE, width=4)
    draw.line((1384, 516, 1396, 527), fill=WHITE, width=4)
    draw.line((1384, 538, 1396, 527), fill=WHITE, width=4)


def draw_footer(img: Image.Image):
    draw = ImageDraw.Draw(img)
    box = (138, 758, 1462, 824)
    shadowed_round(img, box, 26, WHITE, MIST_DARK, 1, shadow=(13, 27, 45, 10), blur=11, offset=(0, 4))
    items = [
        ('Seus dados protegidos', RED),
        ('Orientação segura', GREEN),
        ('Encaminhamento quando necessário', GREEN),
    ]
    x = 202
    for label, color in items:
        draw_pulse(draw, x, 791, 66, color, 2)
        draw.text((x + 92, 775), label, font=font(20, 'bold'), fill=STEEL)
        x += 414


def create_home_page() -> Image.Image:
    img = Image.new('RGBA', (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    # Base approved for the preview: white/off-white only. No red stains, organic fog, red gradient, or decorative particles.
    draw.rectangle((0, 0, W, H), fill=WHITE)
    shadowed_round(img, (56, 48, 1544, 852), 42, OFF_WHITE, MIST, 1, shadow=(13, 27, 45, 12), blur=16, offset=(0, 7))
    shadowed_round(img, (92, 78, 1508, 828), 32, WHITE, '#EEF1F5', 1, shadow=(13, 27, 45, 7), blur=10, offset=(0, 4))

    draw_menu_button(img)

    # Header mirrors the React Home: small logo link at top-left and a status pill at top-right.
    paste_logo(img, LOGO_PATH, (324, 102), 420, 82)
    draw_status_pill(img)

    draw_silent_orbital_field(img)
    draw_chat_composer(img)
    draw_footer(img)

    return img


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int):
    words = text.split()
    lines = []
    line = ''
    for word in words:
        test = f'{line} {word}'.strip()
        if draw.textbbox((0, 0), test, font=fnt)[2] <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def create_checklist_page() -> Image.Image:
    img = Image.new('RGBA', (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    paste_logo(img, LOGO_PATH, (320, 86), 390, 76)
    draw.text((96, 152), 'TRAVA DE APROVAÇÃO ANTES DE IMPLEMENTAR', font=font(18, 'bold'), fill=GREEN)
    draw.text((96, 194), 'Preview da Home em branco/off-white, sem mancha vermelha', font=font(42, 'bold'), fill=NAVY)
    intro = ('Este PDF é apenas um preview visual estático para aprovação. Nenhum arquivo funcional da Home será alterado antes da aprovação explícita de Sidney. '
             'A eventual implementação posterior deverá trocar somente a camada visual: classes, tokens de cor, tipografia, bordas, sombras, fundos, logo e microacentos.')
    y = 264
    for line in wrap_text(draw, intro, font(22), 1300):
        draw.text((96, y), line, font=font(22), fill=STEEL)
        y += 34

    rows = [
        ('Estrutura da Home', 'Menu circular fixo, header com logo e status, chat central em estado inicial e selos inferiores.'),
        ('Fundo', 'Branco/off-white predominante; sem fundo vermelho, névoa orgânica, manchas, halos amplos ou partículas dominantes.'),
        ('Vermelho #FF2432', 'Apenas fio de pulso, borda fina ou microindicador; nunca bloco, névoa, gradiente ou superfície principal.'),
        ('Verde #3BC7A2', 'Apenas status, microacento e inteligência discreta; nunca dominante.'),
        ('Tipografia', 'Preview usa Noto Sans como substituto local da Poppins; hierarquia navy/steel preservada.'),
        ('Funcionalidade', 'IA, respostas, validações, geolocalização, estados React, handlers, tRPC, sugestões, delays e navegação permanecem intocados.'),
    ]

    x0, y0 = 96, 374
    col1, col2 = 330, 1080
    row_h = 62
    draw.rounded_rectangle((x0, y0, x0 + col1 + col2, y0 + row_h), radius=18, fill=OFF_WHITE, outline=MIST_DARK)
    draw.text((x0 + 22, y0 + 23), 'Critério', font=font(18, 'bold'), fill=NAVY)
    draw.text((x0 + col1 + 22, y0 + 23), 'Como aparece neste PDF', font=font(18, 'bold'), fill=NAVY)
    draw.line((x0 + col1, y0, x0 + col1, y0 + row_h), fill=MIST_DARK, width=1)
    y = y0 + row_h
    for idx, (crit, desc) in enumerate(rows):
        fill = WHITE if idx % 2 == 0 else '#FCFDFE'
        draw.rectangle((x0, y, x0 + col1 + col2, y + row_h), fill=fill, outline=MIST)
        draw.text((x0 + 22, y + 20), crit, font=font(16, 'bold'), fill=NAVY)
        draw.text((x0 + col1 + 22, y + 20), desc, font=font(15), fill=STEEL)
        draw.line((x0 + col1, y, x0 + col1, y + row_h), fill=MIST_DARK, width=1)
        y += row_h

    draw.text((96, 838), 'Aprovação solicitada: somente após o seu “aprovado” eu aplico a camada visual no app.', font=font(20, 'bold'), fill=RED)
    return img


def save_pdf_from_pages(pages: list[Image.Image], output_path: Path):
    pdf = canvas.Canvas(str(output_path), pagesize=(W, H))
    for page in pages:
        rgb_page = page.convert('RGB')
        pdf.drawImage(ImageReader(rgb_page), 0, 0, width=W, height=H)
        pdf.showPage()
    pdf.save()


if __name__ == '__main__':
    page1 = create_home_page().convert('RGB')
    page2 = create_checklist_page().convert('RGB')
    page1.save(OUT_PNG, quality=96)
    save_pdf_from_pages([page1, page2], OUT_PDF)
    print(f'created {OUT_PNG}')
    print(f'created {OUT_PDF}')
