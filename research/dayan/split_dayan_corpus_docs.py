from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/home/ubuntu/saude-integrativa-ia-dev")
SOURCE = ROOT / "docs" / "dayan_corpus_completo.md"
OUT_DIR = ROOT / "docs" / "dayan_corpus_split"
OUT_DIR.mkdir(parents=True, exist_ok=True)

text = SOURCE.read_text(encoding="utf-8")
lines = text.splitlines()

video_heading_re = re.compile(r"^## Vídeo (\d{3}) — (.*)$")
first_video_idx = next((i for i, line in enumerate(lines) if video_heading_re.match(line)), None)
if first_video_idx is None:
    raise RuntimeError("Não encontrei os cabeçalhos dos vídeos no documento completo.")

front_lines = lines[:first_video_idx]
# Remove very long full index from executive version after keeping overview sections.
executive_cut = next((i for i, line in enumerate(front_lines) if line.startswith("## Índice geral dos vídeos")), len(front_lines))
executive_lines = front_lines[:executive_cut]
executive_lines.extend([
    "## Como usar os arquivos divididos",
    "",
    "O arquivo completo do corpus ficou grande para visualização direta na interface. Por isso, o conteúdo foi dividido em partes menores, cada uma com cerca de 50 vídeos, preservando título, URL, temas, seções e chunks rastreáveis.",
    "",
    "| Arquivo | Faixa de vídeos | Uso recomendado |",
    "|---|---:|---|",
])
for start in [1, 51, 101, 151, 201]:
    end = min(start + 49, 249)
    executive_lines.append(f"| `dayan_corpus_parte_{((start - 1)//50)+1:02d}_videos_{start:03d}_{end:03d}.md` | {start:03d}–{end:03d} | Leitura detalhada por vídeo e chunk. |")
executive_lines.extend([
    "",
    "## Nota sobre escopo",
    "",
    "Estes documentos consolidam o conteúdo analisado e estruturado do corpus atual. Eles não são transcrições brutas integrais; são a versão organizada usada para consulta, auditoria, priorização de temas e evolução do RAG.",
    "",
])
executive_path = ROOT / "docs" / "dayan_corpus_guia_executivo.md"
executive_path.write_text("\n".join(executive_lines).rstrip() + "\n", encoding="utf-8")

# Split video sections.
video_positions: list[tuple[int, int, str]] = []
for idx, line in enumerate(lines):
    match = video_heading_re.match(line)
    if match:
        video_positions.append((idx, int(match.group(1)), match.group(2)))

for part_no, start_video in enumerate([1, 51, 101, 151, 201], start=1):
    end_video = min(start_video + 49, 249)
    selected_positions = [(idx, num, title) for idx, num, title in video_positions if start_video <= num <= end_video]
    if not selected_positions:
        continue
    start_idx = selected_positions[0][0]
    next_after = next((idx for idx, num, _ in video_positions if num > end_video), len(lines))
    part_lines = [
        f"# Corpus Dayan — Parte {part_no:02d}: vídeos {start_video:03d} a {end_video:03d}",
        "",
        "Este arquivo é uma parte menor do documento completo do corpus Dayan. A divisão foi feita para facilitar abertura, leitura e revisão dentro da interface.",
        "",
        "| Campo | Descrição |",
        "|---|---|",
        "| Escopo | Conteúdo consolidado e estruturado por vídeo. |",
        "| Rastreabilidade | Preserva título, URL, tema, seção e chunks. |",
        "| Limite | Não é transcrição bruta integral; é corpus analisado para consulta e RAG. |",
        "",
        "## Índice desta parte",
        "",
    ]
    for _, num, title in selected_positions:
        slug = f"vídeo-{num:03d}--" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        part_lines.append(f"- [Vídeo {num:03d} — {title}](#{slug})")
    part_lines.extend(["", "---", ""])
    part_lines.extend(lines[start_idx:next_after])
    out = OUT_DIR / f"dayan_corpus_parte_{part_no:02d}_videos_{start_video:03d}_{end_video:03d}.md"
    out.write_text("\n".join(part_lines).rstrip() + "\n", encoding="utf-8")

print(f"Guia executivo: {executive_path}")
for p in sorted(OUT_DIR.glob("dayan_corpus_parte_*.md")):
    size_kb = p.stat().st_size / 1024
    line_count = len(p.read_text(encoding="utf-8").splitlines())
    print(f"{p} | {size_kb:.1f} KB | {line_count} linhas")
