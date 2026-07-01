from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from statistics import mean, median

ROOT = Path('/home/ubuntu/saude-integrativa-ia-dev')
ANALYSES = ROOT / 'research/dayan/corpus/video_analyses'
OUT_DIR = ROOT / 'research/dayan/corpus'

json_files = sorted(ANALYSES.glob('*.json'))
md_files = sorted(ANALYSES.glob('*.md'))
records = []
for path in json_files:
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
        data['_json_path'] = str(path.relative_to(ROOT))
        af = data.get('analysis_file')
        if af:
            analysis_path = ROOT / af
        else:
            analysis_path = ANALYSES / (path.stem + '.md')
        data['_analysis_exists'] = analysis_path.exists()
        data['_analysis_path'] = str(analysis_path.relative_to(ROOT)) if analysis_path.exists() else str(analysis_path)
        if analysis_path.exists():
            text = analysis_path.read_text(encoding='utf-8', errors='replace')
            data['_actual_words'] = len(re.findall(r'\w+', text, flags=re.UNICODE))
            data['_actual_chars'] = len(text)
            data['_heading_count'] = len(re.findall(r'^#{1,6}\s+', text, flags=re.MULTILINE))
            data['_has_alerta'] = bool(re.search(r'alert|risco|limite|contraindica|cuidado|seguran', text, re.I))
            data['_has_recomend'] = bool(re.search(r'recomend|orienta|conduta|protocolo|passo|prática', text, re.I))
            data['_has_resumo'] = bool(re.search(r'resumo|síntese|operacional|executivo', text, re.I))
            data['_first_line'] = text.strip().splitlines()[0] if text.strip() else ''
        else:
            data['_actual_words'] = 0
            data['_actual_chars'] = 0
            data['_heading_count'] = 0
            data['_has_alerta'] = False
            data['_has_recomend'] = False
            data['_has_resumo'] = False
            data['_first_line'] = ''
        records.append(data)
    except Exception as exc:
        records.append({'_json_path': str(path.relative_to(ROOT)), 'status': 'json_error', 'error': str(exc), 'index': None, 'id': path.stem})

indices = sorted([r.get('index') for r in records if isinstance(r.get('index'), int)])
expected = set(range(1, 251))
present = set(indices)
missing_indices = sorted(expected - present)
duplicate_indices = sorted([idx for idx, cnt in Counter(indices).items() if cnt > 1])
status_counts = Counter(r.get('status', 'unknown') for r in records)
word_counts = [int(r.get('analysis_word_count') or r.get('_actual_words') or 0) for r in records]
actual_word_counts = [int(r.get('_actual_words') or 0) for r in records]

failed = [r for r in records if r.get('status') != 'completed']
very_short = [r for r in records if int(r.get('analysis_word_count') or r.get('_actual_words') or 0) < 800]
short = [r for r in records if 800 <= int(r.get('analysis_word_count') or r.get('_actual_words') or 0) < 1000]
missing_md = [r for r in records if not r.get('_analysis_exists')]
weak_structure = [r for r in records if r.get('status') == 'completed' and (r.get('_heading_count') or 0) < 3]
missing_safety_terms = [r for r in records if r.get('status') == 'completed' and not r.get('_has_alerta')]

records_by_theme = Counter(r.get('initial_theme') or 'sem_tema' for r in records)

summary = {
    'json_records': len(json_files),
    'markdown_analyses': len(md_files),
    'indices_present': len(present),
    'missing_indices': missing_indices,
    'duplicate_indices': duplicate_indices,
    'status_counts': dict(status_counts),
    'metadata_word_total': sum(word_counts),
    'actual_word_total': sum(actual_word_counts),
    'average_words': round(mean(word_counts), 1) if word_counts else 0,
    'median_words': round(median(word_counts), 1) if word_counts else 0,
    'min_words': min(word_counts) if word_counts else 0,
    'max_words': max(word_counts) if word_counts else 0,
    'failed_count': len(failed),
    'very_short_count_under_800': len(very_short),
    'short_count_800_to_999': len(short),
    'missing_md_count': len(missing_md),
    'weak_structure_count': len(weak_structure),
    'missing_safety_terms_count': len(missing_safety_terms),
    'theme_counts': dict(records_by_theme),
}

# Sort lists for report
failed_sorted = sorted(failed, key=lambda r: (r.get('index') or 9999))
very_short_sorted = sorted(very_short, key=lambda r: int(r.get('analysis_word_count') or r.get('_actual_words') or 0))
short_sorted = sorted(short, key=lambda r: int(r.get('analysis_word_count') or r.get('_actual_words') or 0))

out_json = OUT_DIR / 'corpus_audit_report.json'
out_json.write_text(json.dumps({'summary': summary, 'records': records}, ensure_ascii=False, indent=2), encoding='utf-8')

lines = []
lines.append('# Auditoria do corpus bruto Dr. Dayan')
lines.append('')
lines.append('Esta auditoria verifica a cobertura dos 250 vídeos, a presença dos arquivos Markdown, os status reportados pelo pipeline e os principais sinais de qualidade textual antes da consolidação temática.')
lines.append('')
lines.append('| Métrica | Valor |')
lines.append('|---|---:|')
for label, key in [
    ('Registros JSON', 'json_records'),
    ('Análises Markdown individuais', 'markdown_analyses'),
    ('Índices únicos presentes', 'indices_present'),
    ('Total de palavras nos metadados', 'metadata_word_total'),
    ('Total de palavras medido nos Markdown', 'actual_word_total'),
    ('Média de palavras por vídeo', 'average_words'),
    ('Mediana de palavras por vídeo', 'median_words'),
    ('Menor análise em palavras', 'min_words'),
    ('Maior análise em palavras', 'max_words'),
    ('Falhas reportadas', 'failed_count'),
    ('Arquivos muito curtos, abaixo de 800 palavras', 'very_short_count_under_800'),
    ('Arquivos curtos, 800 a 999 palavras', 'short_count_800_to_999'),
    ('Markdown ausentes', 'missing_md_count'),
]:
    lines.append(f'| {label} | {summary[key]} |')
lines.append('')
lines.append('## Status do pipeline')
lines.append('')
lines.append('| Status | Vídeos |')
lines.append('|---|---:|')
for status, count in sorted(status_counts.items()):
    lines.append(f'| {status} | {count} |')
lines.append('')
lines.append('## Cobertura dos índices')
lines.append('')
lines.append(f'Índices ausentes: **{missing_indices if missing_indices else "nenhum"}**.')
lines.append('')
lines.append(f'Índices duplicados: **{duplicate_indices if duplicate_indices else "nenhum"}**.')
lines.append('')
lines.append('## Registros com falha ou baixa densidade')
lines.append('')
if failed_sorted:
    lines.append('| Índice | ID | Status | Palavras | Título | Erro |')
    lines.append('|---:|---|---|---:|---|---|')
    for r in failed_sorted:
        title = str(r.get('title', '')).replace('|', '\\|')
        err = str(r.get('error', '') or '').replace('|', '\\|')[:180]
        lines.append(f"| {r.get('index')} | `{r.get('id')}` | {r.get('status')} | {r.get('analysis_word_count') or r.get('_actual_words') or 0} | {title} | {err} |")
else:
    lines.append('Nenhuma falha reportada nos metadados.')
lines.append('')
if very_short_sorted:
    lines.append('### Arquivos muito curtos ou incompletos')
    lines.append('')
    lines.append('| Índice | ID | Status | Palavras | Título |')
    lines.append('|---:|---|---|---:|---|')
    for r in very_short_sorted:
        title = str(r.get('title', '')).replace('|', '\\|')
        lines.append(f"| {r.get('index')} | `{r.get('id')}` | {r.get('status')} | {r.get('analysis_word_count') or r.get('_actual_words') or 0} | {title} |")
    lines.append('')
if short_sorted:
    lines.append('### Arquivos curtos, porém provavelmente utilizáveis')
    lines.append('')
    lines.append('| Índice | ID | Status | Palavras | Título |')
    lines.append('|---:|---|---|---:|---|')
    for r in short_sorted[:30]:
        title = str(r.get('title', '')).replace('|', '\\|')
        lines.append(f"| {r.get('index')} | `{r.get('id')}` | {r.get('status')} | {r.get('analysis_word_count') or r.get('_actual_words') or 0} | {title} |")
    lines.append('')
lines.append('## Distribuição por tema inicial')
lines.append('')
lines.append('| Tema inicial | Vídeos |')
lines.append('|---|---:|')
for theme, count in records_by_theme.most_common():
    lines.append(f'| {theme} | {count} |')
lines.append('')
lines.append('## Decisão operacional recomendada')
lines.append('')
if failed_sorted:
    lines.append('Antes da consolidação final, recomenda-se reprocessar os registros com status diferente de `completed`, porque eles tendem a conter apenas mensagens de erro ou saídas incompletas. Os arquivos curtos entre 800 e 999 palavras podem ser mantidos inicialmente, mas devem receber menor prioridade de citação na base de conhecimento até revisão manual ou reprocessamento seletivo.')
else:
    lines.append('A cobertura está completa e sem falhas reportadas. A consolidação temática pode começar imediatamente.')
lines.append('')

out_md = OUT_DIR / 'corpus_audit_report.md'
out_md.write_text('\n'.join(lines) + '\n', encoding='utf-8')

print(json.dumps(summary, ensure_ascii=False, indent=2))
print(f'WROTE {out_md}')
print(f'WROTE {out_json}')
