import csv
import unicodedata
from pathlib import Path

BASE = Path('/home/ubuntu/saude-integrativa-ia-dev/docs')
INPUT = BASE / 'naming-round2-candidates.csv'
OUT_CSV = BASE / 'naming-round2-scorecard.csv'
OUT_MD = BASE / 'naming-round2-scorecard.md'

# Pesos da segunda rodada: estética e adoção humana valem mais que engenhosidade verbal.
WEIGHTS = {
    'beleza_sonora': 1.35,
    'facilidade_popular': 1.25,
    'credibilidade_profissional': 1.20,
    'plataforma_ampla': 1.10,
    'calor_humano': 1.10,
    'distintividade': 0.90,
    'risco_preliminar': 1.10,  # quanto maior, menor risco percebido
}

# Pontuação editorial calibrada manualmente após a pesquisa e o feedback do usuário.
# Escala 1-10. A coluna risco_preliminar mede viabilidade inicial, não disponibilidade jurídica.
manual_scores = {
    'Ampara':       (9.2, 9.5, 8.8, 8.8, 9.6, 7.0, 6.8),
    'Aflora':       (9.4, 9.0, 7.8, 8.2, 9.0, 7.2, 6.4),
    'Inteira':      (8.7, 9.0, 8.6, 9.0, 8.8, 6.8, 6.4),
    'Alumia':       (9.2, 8.4, 8.1, 8.5, 8.8, 7.7, 7.0),
    'Alevia':       (9.0, 8.7, 8.0, 8.1, 9.0, 7.4, 7.0),
    'Viara':        (8.8, 8.8, 8.0, 8.6, 8.3, 7.4, 7.0),
    'Liva':         (9.1, 8.8, 7.8, 8.2, 8.4, 7.1, 6.4),
    'Norte':        (8.0, 9.5, 9.2, 9.2, 7.6, 6.3, 6.0),
    'Savia':        (8.5, 8.2, 8.8, 8.3, 8.1, 7.0, 6.7),
    'Zelo':         (8.2, 9.7, 9.0, 8.0, 9.4, 4.8, 5.4),
    'Zelos':        (8.1, 8.6, 9.1, 8.2, 8.5, 6.4, 6.2),
    'Serena':       (9.5, 9.4, 7.6, 7.4, 9.1, 4.8, 5.0),
    'Clareia':      (8.5, 9.3, 8.1, 8.3, 8.6, 6.2, 6.0),
    'CasaViva':     (8.7, 9.2, 7.8, 8.7, 9.3, 6.0, 5.8),
    'Morada':       (8.7, 9.2, 7.6, 8.0, 9.2, 5.9, 5.8),
    'Vivera':       (8.8, 8.8, 7.9, 8.4, 8.4, 6.0, 5.8),
    'Auren':        (8.6, 7.8, 8.2, 8.4, 7.9, 7.8, 7.2),
    'Ponte':        (7.4, 9.8, 8.5, 9.5, 8.1, 5.1, 5.4),
    'Vereda':       (8.2, 8.6, 7.8, 8.1, 8.3, 6.3, 6.2),
    'Humania':      (7.8, 8.2, 8.1, 8.9, 8.7, 6.8, 6.3),
    'Pleni':        (8.2, 8.0, 8.0, 8.4, 7.7, 7.4, 6.8),
    'Unna':         (8.2, 8.3, 8.0, 8.8, 7.8, 7.0, 6.5),
    'AlmaViva':     (8.5, 8.7, 7.4, 8.0, 9.2, 5.5, 5.2),
    'Lume':         (8.8, 9.0, 7.9, 7.8, 8.7, 5.0, 5.2),
    'Lúmia':        (8.9, 8.0, 8.0, 8.1, 8.5, 6.5, 6.2),
    'Aurea':        (8.7, 8.0, 8.4, 8.0, 7.7, 5.8, 5.4),
    'Vitala':       (8.2, 8.5, 7.8, 8.5, 8.0, 6.5, 6.0),
    'Sereno':       (8.2, 9.0, 8.0, 7.5, 8.7, 5.2, 5.2),
    'Candeia':      (8.0, 8.0, 7.4, 7.6, 8.8, 7.0, 6.5),
}

# Penalizações automáticas para riscos percebidos nos campos textuais.
def strip_accents(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

def heuristic_scores(row):
    name = row['nome']
    n = strip_accents(name).lower()
    length = len(n.replace(' ', ''))
    vowels = sum(1 for c in n if c in 'aeiou')
    vowel_ratio = vowels / max(1, sum(1 for c in n if c.isalpha()))
    open_end = 1 if n[-1:] in 'aeio' else 0
    syllable_like = sum(1 for c in n if c in 'aeiou')
    beauty = 6.2 + min(1.3, vowel_ratio * 2.0) + open_end * 0.6 - max(0, length-9)*0.15
    popular = 8.5 if length <= 6 else 7.5 if length <= 9 else 6.8
    if any(ch in name for ch in ['á','é','í','ó','ú','â','ê','ô','ã','õ','ç']):
        popular -= 0.4
    professional = 7.0
    platform = 7.0
    warmth = 7.0
    distinctive = 6.5 if length <= 8 else 6.2
    risk = 6.0
    risk_text = row['risco_inicial'].lower()
    if 'uso alto' in risk_text or 'altíssimo' in risk_text or 'famosa' in risk_text:
        risk -= 1.4
    if 'genérico' in risk_text or 'descritivo' in risk_text:
        distinctive -= 1.0
        risk -= 0.6
    if 'infantil' in risk_text or 'místico' in risk_text or 'religioso' in risk_text:
        professional -= 0.7
    return tuple(round(max(1, min(10, x)), 1) for x in (beauty, popular, professional, platform, warmth, distinctive, risk))

def weighted_total(scores):
    keys = list(WEIGHTS.keys())
    return sum(scores[i] * WEIGHTS[keys[i]] for i in range(len(keys))) / sum(WEIGHTS.values())

rows = []
with INPUT.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if None in row:
            row['risco_inicial'] = (row.get('risco_inicial') or '') + ' ' + ' '.join(row.pop(None))
        scores = manual_scores.get(row['nome'], heuristic_scores(row))
        total = weighted_total(scores)
        rows.append({
            **row,
            'beleza_sonora': scores[0],
            'facilidade_popular': scores[1],
            'credibilidade_profissional': scores[2],
            'plataforma_ampla': scores[3],
            'calor_humano': scores[4],
            'distintividade': scores[5],
            'risco_preliminar': scores[6],
            'score_total': round(total, 2),
        })

rows.sort(key=lambda r: r['score_total'], reverse=True)

fieldnames = list(rows[0].keys())
with OUT_CSV.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

with OUT_MD.open('w', encoding='utf-8') as f:
    f.write('# Scorecard de Naming — Rodada 2\n\n')
    f.write('Esta matriz não decide juridicamente a marca. Ela separa, de forma auditável, nomes com melhor equilíbrio entre beleza sonora, adoção popular, credibilidade profissional, amplitude de plataforma, calor humano, distintividade e risco preliminar.\n\n')
    f.write('| Rank | Nome | Score | Beleza | Popular | Profissional | Plataforma | Calor | Distintividade | Risco | Observação |\n')
    f.write('|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n')
    for i, r in enumerate(rows[:35], start=1):
        f.write(f"| {i} | **{r['nome']}** | {r['score_total']} | {r['beleza_sonora']} | {r['facilidade_popular']} | {r['credibilidade_profissional']} | {r['plataforma_ampla']} | {r['calor_humano']} | {r['distintividade']} | {r['risco_preliminar']} | {r['por_que_entra_na_rodada']} |\n")

print(f'Generated {OUT_CSV} and {OUT_MD} with {len(rows)} candidates.')
