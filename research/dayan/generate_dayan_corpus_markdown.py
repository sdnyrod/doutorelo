#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

PROJECT = Path('/home/ubuntu/saude-integrativa-ia-dev')
BASE = PROJECT / 'research/dayan/corpus/consolidated'
OUT_DIR = PROJECT / 'docs'
OUT_FILE = OUT_DIR / 'dayan_corpus_completo.md'

SECTION_ORDER = [
    ('tese_central', 'Tese central'),
    ('resumo_operacional', 'Resumo operacional para a IA'),
    ('alertas_contraindicacoes', 'Alertas e contraindicações'),
    ('limites_clinicos', 'Limites clínicos'),
    ('conceitos_definicoes', 'Conceitos e definições'),
    ('recomendacoes', 'Recomendações educativas'),
    ('sequencia_argumentos', 'Sequência de argumentos'),
    ('topicos_base_ia', 'Tópicos para base de IA'),
    ('frases_memoraveis', 'Frases memoráveis'),
    ('metaforas_analogias', 'Metáforas e analogias'),
]

THEME_LABELS = {
    'beleza_pele_cabelo_envelhecimento': 'Beleza, pele, cabelo e envelhecimento',
    'circulacao_cardio_vascular': 'Circulação, cardiologia e vascular',
    'emagrecimento_metabolismo': 'Emagrecimento e metabolismo',
    'habitos_rotina_estilo_de_vida': 'Hábitos, rotina e estilo de vida',
    'hormonios_libido_sexualidade': 'Hormônios, libido e sexualidade',
    'inflamacao_detox': 'Inflamação e detox',
    'nutricao_alimentos_bebidas': 'Nutrição, alimentos e bebidas',
    'outros_a_classificar_por_transcricao': 'Outros ou a classificar',
    'prevencao_alertas_risco': 'Prevenção, alertas e risco',
    'sono_energia_cognicao': 'Sono, energia e cognição',
    'suplementos_vitaminas_compostos': 'Suplementos, vitaminas e compostos',
}

QUERY_LABELS = {
    'agua_hidratacao': 'Água e hidratação',
    'cancer_prevencao': 'Câncer e prevenção',
    'diabetes_glicemia': 'Diabetes e glicemia',
    'emagrecimento_obesidade': 'Emagrecimento e obesidade',
    'figado_desintoxicacao': 'Fígado e desintoxicação',
    'hipertensao_coracao': 'Hipertensão e coração',
    'hormonios_energia': 'Hormônios e energia',
    'inflamacao_dor': 'Inflamação e dor',
    'intestino_estomago': 'Intestino e estômago',
    'medicamentos_alertas': 'Medicamentos e alertas',
    'sono_ansiedade_cerebro': 'Sono, ansiedade e cérebro',
    'suplementos_chas': 'Suplementos e chás',
}


def load_json(name: str) -> Any:
    return json.loads((BASE / name).read_text(encoding='utf-8'))


def load_chunks() -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    with (BASE / 'dayan_knowledge_chunks.jsonl').open(encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r'[^a-z0-9áéíóúâêôãõçüñ\s-]', '', value)
    value = re.sub(r'\s+', '-', value.strip())
    return value[:90] or 'item'


def md_escape_table(value: Any) -> str:
    text = str(value if value is not None else '')
    text = text.replace('\n', '<br>')
    text = text.replace('|', '\\|')
    return text


def safe_text(value: Any) -> str:
    if value is None:
        return ''
    text = str(value).strip()
    return text


def query_theme_text(themes: list[str]) -> str:
    if not themes:
        return 'Não classificado'
    return ', '.join(f'`{t}`' for t in themes)


def label_theme(theme: str) -> str:
    return THEME_LABELS.get(theme, theme.replace('_', ' ').capitalize())


def label_query(theme: str) -> str:
    return QUERY_LABELS.get(theme, theme.replace('_', ' ').capitalize())


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stats = load_json('dayan_corpus_stats.json')
    video_index = load_json('dayan_video_index.json')
    theme_index = load_json('dayan_theme_index.json')
    query_theme_index = load_json('dayan_query_theme_index.json')
    failed = load_json('dayan_failed_or_excluded.json')
    chunks = load_chunks()

    if isinstance(video_index, dict):
        videos = list(video_index.values())
    else:
        videos = list(video_index)
    videos.sort(key=lambda x: int(x.get('index', 0)))

    chunks_by_video: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for chunk in chunks:
        chunks_by_video[int(chunk.get('video_index', 0))].append(chunk)
    for video_chunks in chunks_by_video.values():
        video_chunks.sort(key=lambda c: (str(c.get('section', '')), str(c.get('chunk_id', ''))))

    lines: list[str] = []
    lines.append('# Corpus Dayan Completo — DOUTORELO')
    lines.append('')
    lines.append('Autor: **Manus AI**.')
    lines.append('')
    lines.append(f'Gerado em: **{datetime.now().strftime("%Y-%m-%d %H:%M")}**.')
    lines.append('')
    lines.append('Este documento consolida o conteúdo atualmente disponível no **corpus Dayan** usado como base proprietária de conhecimento educacional e integrativo do DOUTORELO. O material foi organizado a partir dos arquivos internos de análise dos vídeos públicos do Dr. Dayan Siebra, preservando rastreabilidade por vídeo, URL, tema, seção semântica e chunks pesquisáveis.')
    lines.append('')
    lines.append('> **Nota clínica e operacional:** este corpus não deve ser tratado como prescrição, diagnóstico, protocolo médico individual ou substituto de avaliação profissional. Ele é uma base educativa e de recuperação de conhecimento para orientar respostas da IA com limites, cautelas e rastreabilidade.')
    lines.append('')
    lines.append('## Sumário executivo')
    lines.append('')
    lines.append('| Métrica | Valor |')
    lines.append('|---|---:|')
    lines.append(f"| Vídeos com análise válida | {stats.get('valid_videos')} |")
    lines.append(f"| Vídeos excluídos ou falhos | {stats.get('excluded_or_failed_videos')} |")
    lines.append(f"| Chunks pesquisáveis | {stats.get('chunks')} |")
    lines.append(f"| Palavras úteis consolidadas | {int(stats.get('total_words', 0)):,}. |".replace(',', '.'))
    lines.append(f"| Média de palavras por vídeo válido | {stats.get('average_words_per_valid_video')} |")
    lines.append(f"| Chunks com relevância de segurança clínica | {stats.get('safety_relevant_chunks')} |")
    lines.append('')
    lines.append('A leitura estratégica é que o corpus Dayan é uma base forte para **DNA editorial integrativo, educação em saúde, alertas e organização de raciocínio**, mas não substitui uma ontologia médica ampla de doenças, fármacos, exames e diretrizes oficiais. Portanto, seu uso correto é como camada proprietária de contexto, não como base única de decisão clínica.')
    lines.append('')

    lines.append('## Distribuição por tema inicial')
    lines.append('')
    lines.append('| Tema | Vídeos | Chunks relacionados |')
    lines.append('|---|---:|---:|')
    for theme, count in sorted(stats.get('themes', {}).items(), key=lambda kv: kv[1], reverse=True):
        chunk_count = sum(1 for c in chunks if c.get('initial_theme') == theme)
        lines.append(f'| {md_escape_table(label_theme(theme))}<br>`{theme}` | {count} | {chunk_count} |')
    lines.append('')

    lines.append('## Índices de consulta usados na recuperação')
    lines.append('')
    lines.append('| Índice de consulta | Vídeos relacionados | Descrição operacional |')
    lines.append('|---|---:|---|')
    for theme, count in sorted(stats.get('query_themes', {}).items(), key=lambda kv: kv[1], reverse=True):
        lines.append(f'| `{theme}` | {count} | {md_escape_table(label_query(theme))} |')
    lines.append('')

    lines.append('## Índice geral dos vídeos')
    lines.append('')
    lines.append('| # | Vídeo | Tema inicial | Palavras | Chunks | Segurança |')
    lines.append('|---:|---|---|---:|---:|---:|')
    for video in videos:
        idx = int(video.get('index', 0))
        video_chunks = chunks_by_video.get(idx, [])
        safety_count = sum(1 for c in video_chunks if c.get('safety_relevant'))
        title = safe_text(video.get('title'))
        url = safe_text(video.get('url'))
        anchor = f'video-{idx:03d}-{slug(title)}'
        lines.append(f"| {idx} | [{md_escape_table(title)}](#{anchor})<br>[YouTube]({url}) | {md_escape_table(video.get('initial_theme_label') or label_theme(video.get('initial_theme', '')))} | {video.get('word_count', video.get('analysis_word_count', ''))} | {len(video_chunks)} | {safety_count} |")
    lines.append('')

    if failed:
        lines.append('## Lacunas, falhas e exclusões')
        lines.append('')
        lines.append('| # | ID | Título | Motivo |')
        lines.append('|---:|---|---|---|')
        items = failed if isinstance(failed, list) else list(failed.values())
        for item in items:
            lines.append(f"| {md_escape_table(item.get('index', ''))} | `{md_escape_table(item.get('id', item.get('video_id', '')))}` | {md_escape_table(item.get('title', ''))} | {md_escape_table(item.get('reason', item.get('motivo', item.get('error', 'Não especificado'))))} |")
        lines.append('')

    lines.append('## Como ler os conteúdos por vídeo')
    lines.append('')
    lines.append('Cada vídeo abaixo está organizado por **tese central**, **resumo operacional**, **alertas**, **limites clínicos**, **conceitos**, **recomendações**, **argumentos**, **tópicos para a base de IA**, **frases memoráveis** e **metáforas** quando esses campos existem. A lista de chunks no final de cada vídeo mostra como o conteúdo foi fragmentado para recuperação pela IA.')
    lines.append('')

    for video in videos:
        idx = int(video.get('index', 0))
        title = safe_text(video.get('title')) or f'Vídeo {idx}'
        url = safe_text(video.get('url'))
        video_chunks = chunks_by_video.get(idx, [])
        lines.append(f'## Vídeo {idx:03d} — {title}')
        lines.append('')
        lines.append('| Campo | Valor |')
        lines.append('|---|---|')
        lines.append(f"| ID | `{md_escape_table(video.get('video_id', video.get('id', '')))}` |")
        lines.append(f"| URL | {f'[{md_escape_table(url)}]({url})' if url else ''} |")
        lines.append(f"| Duração | {md_escape_table(video.get('duration_string', ''))} |")
        lines.append(f"| Tema inicial | {md_escape_table(video.get('initial_theme_label') or label_theme(video.get('initial_theme', '')))}<br>`{md_escape_table(video.get('initial_theme', ''))}` |")
        lines.append(f"| Temas de consulta | {md_escape_table(query_theme_text(video.get('query_themes', [])))} |")
        lines.append(f"| Palavras | {md_escape_table(video.get('word_count', video.get('analysis_word_count', '')))} |")
        lines.append(f"| Chunks | {len(video_chunks)} |")
        lines.append(f"| Chunks com relevância de segurança | {sum(1 for c in video_chunks if c.get('safety_relevant'))} |")
        lines.append('')

        for key, label in SECTION_ORDER:
            text = safe_text(video.get(key))
            if text:
                lines.append(f'### {label}')
                lines.append('')
                lines.append(text)
                lines.append('')

        if video_chunks:
            lines.append('### Chunks pesquisáveis deste vídeo')
            lines.append('')
            lines.append('| Chunk ID | Seção | Palavras | Segurança |')
            lines.append('|---|---|---:|---:|')
            for chunk in video_chunks:
                lines.append(f"| `{md_escape_table(chunk.get('chunk_id', ''))}` | `{md_escape_table(chunk.get('section', ''))}` | {md_escape_table(chunk.get('word_count', ''))} | {'Sim' if chunk.get('safety_relevant') else 'Não'} |")
            lines.append('')

    lines.append('## Catálogo bruto de chunks')
    lines.append('')
    lines.append('Esta seção lista todos os chunks pesquisáveis em formato de catálogo para auditoria. O conteúdo textual completo de cada chunk já está representado nas seções por vídeo acima; aqui a finalidade é rastrear identificadores, seções, temas e flags de segurança.')
    lines.append('')
    lines.append('| Chunk ID | Vídeo | Seção | Tema inicial | Temas de consulta | Palavras | Segurança |')
    lines.append('|---|---:|---|---|---|---:|---:|')
    for chunk in chunks:
        lines.append(f"| `{md_escape_table(chunk.get('chunk_id', ''))}` | {md_escape_table(chunk.get('video_index', ''))} | `{md_escape_table(chunk.get('section', ''))}` | `{md_escape_table(chunk.get('initial_theme', ''))}` | {md_escape_table(', '.join(chunk.get('query_themes', [])))} | {md_escape_table(chunk.get('word_count', ''))} | {'Sim' if chunk.get('safety_relevant') else 'Não'} |")
    lines.append('')

    lines.append('## Referências internas')
    lines.append('')
    lines.append('| Arquivo interno | Finalidade |')
    lines.append('|---|---|')
    lines.append('| `research/dayan/corpus/consolidated/dayan_video_index.json` | Índice por vídeo com tese, resumo operacional, alertas, limites e demais seções semânticas. |')
    lines.append('| `research/dayan/corpus/consolidated/dayan_knowledge_chunks.jsonl` | Chunks pesquisáveis usados pelo mecanismo de recuperação. |')
    lines.append('| `research/dayan/corpus/consolidated/dayan_theme_index.json` | Agrupamento por tema inicial. |')
    lines.append('| `research/dayan/corpus/consolidated/dayan_query_theme_index.json` | Agrupamento por temas de consulta. |')
    lines.append('| `research/dayan/corpus/consolidated/dayan_corpus_stats.json` | Estatísticas consolidadas do corpus. |')
    lines.append('| `research/dayan/corpus/consolidated/dayan_failed_or_excluded.json` | Lacunas, falhas e exclusões rastreáveis. |')
    lines.append('')

    OUT_FILE.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(str(OUT_FILE))
    print(f'videos={len(videos)} chunks={len(chunks)} lines={len(lines)} bytes={OUT_FILE.stat().st_size}')


if __name__ == '__main__':
    main()
