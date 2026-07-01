#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, Iterable, List

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT / "corpus"
ANALYSES = CORPUS / "video_analyses"
OUT = CORPUS / "consolidated"
OUT.mkdir(parents=True, exist_ok=True)

ACCESS_AUDIT = CORPUS / "video_121_access_audit.md"

SECTION_LABELS = {
    "1": "tese_central",
    "2": "sequencia_argumentos",
    "3": "conceitos_definicoes",
    "4": "metaforas_analogias",
    "5": "recomendacoes",
    "6": "alertas_contraindicacoes",
    "7": "limites_clinicos",
    "8": "topicos_base_ia",
    "9": "frases_memoraveis",
    "10": "resumo_operacional",
}

THEME_LABELS = {
    "nutricao_alimentos_bebidas": "Nutrição, alimentos e bebidas",
    "metabolismo_emagrecimento": "Metabolismo, emagrecimento e composição corporal",
    "doencas_cronicas_cardiometabolicas": "Doenças crônicas e cardiometabólicas",
    "hormonios_longevidade_energia": "Hormônios, longevidade e energia",
    "saude_digestiva_intestinal": "Saúde digestiva e intestinal",
    "sono_cerebro_saude_mental": "Sono, cérebro e saúde mental",
    "fitoterapia_suplementos_remedios_caseiros": "Fitoterapia, suplementos e remédios caseiros",
    "exames_medicamentos_riscos": "Exames, medicamentos e riscos terapêuticos",
    "habitos_estilo_de_vida": "Hábitos e estilo de vida",
    "outros_a_classificar_por_transcricao": "Outros ou a classificar",
}

QUERY_THEMES = {
    "agua_hidratacao": ["água", "agua", "hidratação", "hidratacao", "alcalina", "cloro", "microplástico", "microplastico", "orp"],
    "diabetes_glicemia": ["diabetes", "glicemia", "insulina", "açúcar", "acucar", "resistência à insulina", "resistencia a insulina"],
    "hipertensao_coracao": ["pressão alta", "pressao alta", "hipertensão", "hipertensao", "coração", "coracao", "cardiovascular", "infarto", "colesterol"],
    "emagrecimento_obesidade": ["emagrecer", "emagrecimento", "obesidade", "perder peso", "gordura abdominal", "barriga"],
    "intestino_estomago": ["intestino", "estômago", "estomago", "digestão", "digestao", "gastrite", "refluxo", "constipação", "prisão de ventre"],
    "sono_ansiedade_cerebro": ["sono", "insônia", "insonia", "ansiedade", "cérebro", "cerebro", "memória", "memoria", "depressão", "depressao"],
    "figado_desintoxicacao": ["fígado", "figado", "detox", "desintoxicação", "desintoxicacao", "gordura no fígado", "gordura no figado"],
    "inflamacao_dor": ["inflamação", "inflamacao", "dor", "artrite", "artrose", "fibromialgia"],
    "suplementos_chas": ["suplemento", "vitamina", "magnésio", "magnesio", "chá", "cha", "fitoterápico", "fitoterapico"],
    "medicamentos_alertas": ["remédio", "remedio", "medicamento", "estatinas", "omeprazol", "antibiótico", "antibiotico", "efeito colateral"],
    "hormonios_energia": ["hormônio", "hormonio", "testosterona", "tireoide", "menopausa", "energia", "cansaço", "cansaco"],
    "cancer_prevencao": ["câncer", "cancer", "tumor", "prevenção do câncer", "prevencao do cancer"],
}

SAFETY_TERMS = [
    "não deve", "nao deve", "contraindica", "contra-indica", "risco", "alerta", "cuidado", "hipertens", "cardiopata",
    "gravidez", "gestante", "rim", "renal", "fígado", "figado", "medicação", "medicacao", "medicamento", "médico", "medico",
]


def read_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def clean_text(value: str) -> str:
    value = re.sub(r"\r\n?", "\n", value or "")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text, flags=re.UNICODE))


def extract_sections(md: str) -> Dict[str, str]:
    pattern = re.compile(r"^###\s+(\d+)\.\s+(.+?)\s*$", re.MULTILINE)
    matches = list(pattern.finditer(md))
    sections: Dict[str, str] = {}
    for i, match in enumerate(matches):
        num = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        key = SECTION_LABELS.get(num, f"secao_{num}")
        sections[key] = clean_text(md[start:end])
    return sections


def detect_query_themes(text: str) -> List[str]:
    low = text.lower()
    detected: List[str] = []
    for key, terms in QUERY_THEMES.items():
        if any(term in low for term in terms):
            detected.append(key)
    return detected


def extract_terms(text: str, max_terms: int = 18) -> List[str]:
    low = text.lower()
    phrases = []
    candidates = [
        "pressão alta", "resistência à insulina", "água alcalina", "microplásticos", "metais pesados",
        "gordura no fígado", "saúde intestinal", "jejum intermitente", "sono profundo", "inflamação silenciosa",
        "diabetes", "colesterol", "hipertensão", "ansiedade", "insônia", "magnésio", "vitamina d",
        "omeprazol", "estatinas", "intestino", "fígado", "tireoide", "menopausa", "testosterona",
        "emagrecimento", "obesidade", "câncer", "gastrite", "refluxo", "detox", "chá", "suplemento",
    ]
    for candidate in candidates:
        if candidate in low:
            phrases.append(candidate)
    # Preserve order and limit.
    seen = set()
    ordered = []
    for item in phrases:
        if item not in seen:
            seen.add(item)
            ordered.append(item)
    return ordered[:max_terms]


def has_safety_content(text: str) -> bool:
    low = text.lower()
    return any(term in low for term in SAFETY_TERMS)


def first_sentence(text: str, max_chars: int = 360) -> str:
    text = clean_text(re.sub(r"^[*\-\d\.\s]+", "", text))
    if not text:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", text)
    out = parts[0] if parts else text
    if len(out) > max_chars:
        out = out[: max_chars - 1].rstrip() + "…"
    return out


def make_chunk_id(index: int, video_id: str, section_key: str) -> str:
    return f"dayan_{index:03d}_{video_id}_{section_key}"


records: List[Dict[str, Any]] = []
chunks: List[Dict[str, Any]] = []
failures: List[Dict[str, Any]] = []

for meta_path in sorted(ANALYSES.glob("*.json")):
    meta = read_json(meta_path)
    idx = int(meta.get("index") or 0)
    status = meta.get("status")
    md_rel = meta.get("analysis_file")
    md_path = ROOT.parent.parent / md_rel if md_rel else meta_path.with_suffix(".md")
    if not md_path.exists():
        md_path = meta_path.with_suffix(".md")
    if status != "completed" or int(meta.get("analysis_word_count") or 0) < 300:
        failures.append({
            "index": idx,
            "video_id": meta.get("id"),
            "title": meta.get("title"),
            "url": meta.get("url"),
            "duration_string": meta.get("duration_string"),
            "status": status,
            "analysis_word_count": meta.get("analysis_word_count"),
            "error": meta.get("error"),
            "audit_note": str(ACCESS_AUDIT) if idx == 121 and ACCESS_AUDIT.exists() else None,
        })
        continue

    md = md_path.read_text(encoding="utf-8", errors="ignore")
    sections = extract_sections(md)
    full_text = "\n\n".join(sections.values())
    query_themes = detect_query_themes(full_text)
    initial_theme = str(meta.get("initial_theme") or "outros_a_classificar_por_transcricao")
    record = {
        "index": idx,
        "video_id": meta.get("id"),
        "title": meta.get("title"),
        "url": meta.get("url"),
        "duration_seconds": meta.get("duration_seconds"),
        "duration_string": meta.get("duration_string"),
        "initial_theme": initial_theme,
        "initial_theme_label": THEME_LABELS.get(initial_theme, initial_theme),
        "query_themes": query_themes,
        "word_count": meta.get("analysis_word_count"),
        "sections_available": sorted(sections.keys()),
        "tese_central": sections.get("tese_central", ""),
        "resumo_operacional": sections.get("resumo_operacional", ""),
        "alertas_contraindicacoes": sections.get("alertas_contraindicacoes", ""),
        "limites_clinicos": sections.get("limites_clinicos", ""),
        "topicos_base_ia": sections.get("topicos_base_ia", ""),
        "frases_memoraveis": sections.get("frases_memoraveis", ""),
        "search_terms": extract_terms(full_text),
        "has_safety_content": has_safety_content(sections.get("alertas_contraindicacoes", "") + "\n" + sections.get("limites_clinicos", "")),
        "source_markdown": str(md_path.relative_to(ROOT.parent.parent)),
    }
    records.append(record)

    for section_key, section_text in sections.items():
        if word_count(section_text) < 25:
            continue
        chunk = {
            "chunk_id": make_chunk_id(idx, str(meta.get("id")), section_key),
            "source": "dr_dayan_public_youtube_analysis",
            "video_index": idx,
            "video_id": meta.get("id"),
            "title": meta.get("title"),
            "url": meta.get("url"),
            "duration_string": meta.get("duration_string"),
            "initial_theme": initial_theme,
            "initial_theme_label": THEME_LABELS.get(initial_theme, initial_theme),
            "query_themes": query_themes,
            "section": section_key,
            "text": section_text,
            "word_count": word_count(section_text),
            "safety_relevant": section_key in {"alertas_contraindicacoes", "limites_clinicos", "resumo_operacional"} or has_safety_content(section_text),
        }
        chunks.append(chunk)

records.sort(key=lambda r: r["index"])
chunks.sort(key=lambda c: (c["video_index"], c["section"]))
failures.sort(key=lambda r: r["index"])

theme_index: Dict[str, Dict[str, Any]] = {}
by_theme: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
for r in records:
    by_theme[r["initial_theme"]].append(r)
for theme, items in sorted(by_theme.items()):
    counter = Counter(term for r in items for term in r["search_terms"])
    qcounter = Counter(q for r in items for q in r["query_themes"])
    theme_index[theme] = {
        "label": THEME_LABELS.get(theme, theme),
        "video_count": len(items),
        "total_words": sum(int(r["word_count"] or 0) for r in items),
        "top_search_terms": [term for term, _ in counter.most_common(20)],
        "query_theme_counts": dict(qcounter.most_common()),
        "videos": [
            {
                "index": r["index"],
                "video_id": r["video_id"],
                "title": r["title"],
                "url": r["url"],
                "duration_string": r["duration_string"],
                "word_count": r["word_count"],
                "tese_preview": first_sentence(r["tese_central"]),
            }
            for r in items
        ],
    }

query_theme_index: Dict[str, Dict[str, Any]] = {}
for qtheme in sorted(QUERY_THEMES):
    items = [r for r in records if qtheme in r["query_themes"]]
    if not items:
        continue
    query_theme_index[qtheme] = {
        "video_count": len(items),
        "videos": [
            {
                "index": r["index"],
                "video_id": r["video_id"],
                "title": r["title"],
                "url": r["url"],
                "initial_theme_label": r["initial_theme_label"],
                "tese_preview": first_sentence(r["tese_central"]),
            }
            for r in items[:80]
        ],
    }

stats = {
    "valid_videos": len(records),
    "excluded_or_failed_videos": len(failures),
    "chunks": len(chunks),
    "total_words": sum(int(r["word_count"] or 0) for r in records),
    "average_words_per_valid_video": round(sum(int(r["word_count"] or 0) for r in records) / max(1, len(records)), 1),
    "safety_relevant_chunks": sum(1 for c in chunks if c["safety_relevant"]),
    "themes": {theme: data["video_count"] for theme, data in theme_index.items()},
    "query_themes": {theme: data["video_count"] for theme, data in query_theme_index.items()},
}

(OUT / "dayan_video_index.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "dayan_theme_index.json").write_text(json.dumps(theme_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "dayan_query_theme_index.json").write_text(json.dumps(query_theme_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "dayan_failed_or_excluded.json").write_text(json.dumps(failures, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "dayan_corpus_stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
with (OUT / "dayan_knowledge_chunks.jsonl").open("w", encoding="utf-8") as fh:
    for chunk in chunks:
        fh.write(json.dumps(chunk, ensure_ascii=False) + "\n")

lines: List[str] = []
lines.extend([
    "# Consolidação temática do corpus Dr. Dayan",
    "",
    "Autor: **Manus AI**.",
    "",
    "Este documento consolida as análises profundas geradas a partir dos vídeos públicos do Dr. Dayan Siebra para uso interno no DOUTORELO. A consolidação preserva rastreabilidade por vídeo, URL e seção semântica, sem transformar conteúdo educativo em prescrição clínica.",
    "",
    "> O corpus consolidado deve ser usado como base de educação em saúde e triagem conversacional, sempre com limites clínicos claros, recomendação de avaliação profissional quando houver risco e prioridade para alertas/contraindicações extraídos das próprias análises.",
    "",
    "## Resumo executivo",
    "",
    "| Métrica | Valor |",
    "|---|---:|",
    f"| Vídeos com análise válida | {stats['valid_videos']} |",
    f"| Vídeos excluídos ou falhos | {stats['excluded_or_failed_videos']} |",
    f"| Palavras úteis consolidadas | {stats['total_words']:,} |".replace(",", "."),
    f"| Média de palavras por vídeo válido | {stats['average_words_per_valid_video']} |",
    f"| Chunks pesquisáveis | {stats['chunks']} |",
    f"| Chunks com relevância de segurança clínica | {stats['safety_relevant_chunks']} |",
    "",
    "## Distribuição por tema inicial",
    "",
    "| Tema | Vídeos | Palavras | Termos frequentes |",
    "|---|---:|---:|---|",
])
for theme, data in sorted(theme_index.items(), key=lambda kv: (-kv[1]["video_count"], kv[1]["label"])):
    terms = ", ".join(data["top_search_terms"][:8]) or "—"
    lines.append(f"| {data['label']} | {data['video_count']} | {data['total_words']:,} | {terms} |".replace(",", "."))

lines.extend([
    "",
    "## Índices temáticos de recuperação",
    "",
    "| Índice de consulta | Vídeos relacionados |",
    "|---|---:|",
])
for theme, data in sorted(query_theme_index.items(), key=lambda kv: (-kv[1]["video_count"], kv[0])):
    lines.append(f"| `{theme}` | {data['video_count']} |")

lines.extend([
    "",
    "## Lacunas e exclusões rastreáveis",
    "",
    "| # | ID | Título | Motivo |",
    "|---:|---|---|---|",
])
if failures:
    for item in failures:
        title = str(item.get("title") or "").replace("|", "\\|")
        reason = "análise curta/falha ou acesso indisponível após reparo"
        if item.get("audit_note"):
            reason += f"; ver `{Path(item['audit_note']).name}`"
        lines.append(f"| {item.get('index')} | `{item.get('video_id')}` | {title} | {reason} |")
else:
    lines.append("| — | — | — | Nenhuma lacuna crítica identificada. |")

lines.extend([
    "",
    "## Arquivos gerados",
    "",
    "| Arquivo | Finalidade |",
    "|---|---|",
    "| `dayan_video_index.json` | Índice por vídeo com tese, resumo operacional, alertas e metadados. |",
    "| `dayan_knowledge_chunks.jsonl` | Chunks pesquisáveis por seção semântica para integração ao backend. |",
    "| `dayan_theme_index.json` | Agrupamento por tema inicial do manifesto. |",
    "| `dayan_query_theme_index.json` | Agrupamento por temas de busca detectados por palavras-chave. |",
    "| `dayan_failed_or_excluded.json` | Registro de lacunas/falhas sem inferência de conteúdo. |",
    "| `dayan_corpus_stats.json` | Métricas resumidas do corpus consolidado. |",
    "",
])

(OUT / "dayan_corpus_consolidated.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(json.dumps({"out_dir": str(OUT), **stats}, ensure_ascii=False, indent=2))
