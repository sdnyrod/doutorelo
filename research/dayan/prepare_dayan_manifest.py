#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "dayan_youtube_videos_top250.csv"
OUT_DIR = ROOT / "corpus"
OUT_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_JSON = OUT_DIR / "dayan_video_manifest.json"
MANIFEST_JSONL = OUT_DIR / "dayan_video_manifest.jsonl"
SUMMARY_MD = OUT_DIR / "dayan_manifest_summary.md"

THEME_RULES: Dict[str, List[str]] = {
    "nutricao_alimentos_bebidas": ["food", "foods", "eat", "eating", "comer", "alimento", "alimentos", "drink", "water", "agua", "chá", "cha", "coffee", "café", "leite", "milk", "suco", "juice"],
    "emagrecimento_metabolismo": ["weight", "lose", "loss", "fat", "belly", "emagrecer", "emagrece", "gordura", "barriga", "metabolism", "metabolismo", "obes", "skinny"],
    "prevencao_alertas_risco": ["cancer", "heart", "sinais", "symptoms", "sintomas", "danger", "risk", "risco", "warning", "alerta", "stroke", "avc", "attack"],
    "inflamacao_detox": ["inflamed", "inflama", "inflammation", "desinflamar", "detox", "detoxify", "desintox", "toxin", "toxina"],
    "circulacao_cardio_vascular": ["vein", "circulation", "circulação", "circulacao", "vascular", "blood", "pressão", "pressao", "pressure", "heart", "coração", "coracao", "cholesterol", "colesterol"],
    "suplementos_vitaminas_compostos": ["vitamin", "vitamina", "supplement", "suplement", "magnesium", "magnésio", "magnesio", "omega", "zinco", "zinc", "remedy", "remédio", "remedio", "natural"],
    "sono_energia_cognicao": ["sleep", "sono", "tired", "cansado", "cansaço", "cansaco", "energy", "energia", "brain", "memória", "memoria", "fog", "anxiety", "ansiedade"],
    "habitos_rotina_estilo_de_vida": ["habit", "hábito", "habito", "routine", "rotina", "exercise", "exercício", "exercicio", "walk", "caminhada", "morning", "manhã", "manha"],
    "beleza_pele_cabelo_envelhecimento": ["skin", "pele", "hair", "cabelo", "wrinkle", "ruga", "aging", "envelhecimento", "beauty", "beleza", "collagen", "colageno", "colágeno"],
    "hormonios_libido_sexualidade": ["hormone", "hormônio", "hormonio", "testosterone", "testosterona", "libido", "sex", "sexual", "menopause", "menopausa"],
}

DOMAIN_LABELS = {
    "nutricao_alimentos_bebidas": "Nutrição, alimentos e bebidas",
    "emagrecimento_metabolismo": "Emagrecimento e metabolismo",
    "prevencao_alertas_risco": "Prevenção, sintomas de alerta e risco",
    "inflamacao_detox": "Inflamação e desintoxicação",
    "circulacao_cardio_vascular": "Circulação, vascular e cardiovascular",
    "suplementos_vitaminas_compostos": "Suplementos, vitaminas e compostos naturais",
    "sono_energia_cognicao": "Sono, energia, cognição e sintomas funcionais",
    "habitos_rotina_estilo_de_vida": "Estilo de vida, hábitos e rotina",
    "beleza_pele_cabelo_envelhecimento": "Beleza, pele, cabelo e envelhecimento",
    "hormonios_libido_sexualidade": "Hormônios, libido e sexualidade",
    "outros_a_classificar_por_transcricao": "Outros ou a classificar por transcrição",
}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def classify_title(title: str) -> str:
    t = title.lower()
    scores = {theme: sum(1 for kw in kws if kw.lower() in t) for theme, kws in THEME_RULES.items()}
    best_theme, best_score = max(scores.items(), key=lambda item: item[1])
    return best_theme if best_score > 0 else "outros_a_classificar_por_transcricao"


def main() -> None:
    rows = []
    with INPUT.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            idx = int(raw["index"])
            title = normalize_text(raw["title"])
            video_id = normalize_text(raw["id"])
            theme = classify_title(title)
            item = {
                "index": idx,
                "video_id": video_id,
                "url": normalize_text(raw["url"]),
                "title": title,
                "duration_seconds": float(raw["duration_seconds"] or 0),
                "duration_string": normalize_text(raw["duration_string"]),
                "initial_theme": theme,
                "initial_theme_label": DOMAIN_LABELS[theme],
                "extraction_status": "pending",
                "transcript_path": f"research/dayan/corpus/transcripts/{idx:03d}_{video_id}.txt",
                "structured_path": f"research/dayan/corpus/structured/{idx:03d}_{video_id}.json",
                "source_type": "youtube_public_video",
            }
            rows.append(item)

    if len(rows) != 250:
        raise SystemExit(f"Manifesto esperado com 250 vídeos, encontrado {len(rows)}")

    MANIFEST_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with MANIFEST_JSONL.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    counts: Dict[str, int] = {}
    for row in rows:
        counts[row["initial_theme_label"]] = counts.get(row["initial_theme_label"], 0) + 1

    lines = [
        "# Manifesto normalizado dos 250 vídeos Dr. Dayan",
        "",
        "Este arquivo confirma a lista de entrada para a extração profunda. Cada vídeo recebeu identificador, URL, duração, tema inicial por título e caminhos previstos para transcrição e estruturação.",
        "",
        f"Total de vídeos normalizados: **{len(rows)}**.",
        "",
        "| Tema inicial | Vídeos |",
        "|---|---:|",
    ]
    for label, count in sorted(counts.items(), key=lambda item: (-item[1], item[0])):
        lines.append(f"| {label} | {count} |")
    lines.extend([
        "",
        "## Primeiros 10 vídeos",
        "",
        "| # | ID | Duração | Tema inicial | Título |",
        "|---:|---|---:|---|---|",
    ])
    for row in rows[:10]:
        safe_title = row["title"].replace("|", "\\|")
        lines.append(f"| {row['index']} | `{row['video_id']}` | {row['duration_string']} | {row['initial_theme_label']} | {safe_title} |")
    SUMMARY_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({"videos": len(rows), "summary": str(SUMMARY_MD), "manifest": str(MANIFEST_JSON)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
