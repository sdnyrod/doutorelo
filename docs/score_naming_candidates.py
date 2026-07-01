import csv
import re
from pathlib import Path

BASE = Path('/home/ubuntu/saude-integrativa-ia-dev/docs')
INPUT = BASE / 'naming-candidates.csv'
OUTPUT = BASE / 'naming-candidates-scored.csv'
MD_OUTPUT = BASE / 'naming-candidates-ranked.md'

# Pesos do scorecard definido no mapeamento semântico.
WEIGHTS = {
    'memorabilidade': 15,
    'sonoridade_pt_en': 15,
    'sofisticacao_premium': 15,
    'confianca_saude': 15,
    'elasticidade': 15,
    'diferenciacao': 10,
    'compatibilidade_visual': 10,
    'risco_semantico': 5,
}

BANNED_CORES = ['doctor', 'doutor', 'health', 'saude', 'saúde', 'clinic', 'med', 'shop', 'market']
HARD_RISK_TERMS = ['alto risco', 'covid', 'avara', 'ovelha', 'nivea', 'seguros']
COMMON_LOW_DEFENSE = ['palavra comum', 'muito comum', 'saturado', 'saturada', 'descritivo', 'descritiva', 'baixa defesa']
TECH_COLD = ['b2b', 'software', 'técnico', 'corporativo', 'data é literal']
AI_EXPLICIT = ['ia explícito', 'ai fica evidente', 'ia final']
VISUAL_GOOD_TERRITORIES = ['Luz e bioluminescência', 'Vitalidade integrativa', 'Neologismo curto']
PREMIUM_TOKENS = ['aura', 'aurora', 'lumen', 'luz', 'premium', 'vital', 'vida', 'zelo', 'campo', 'origem', 'navegação', 'refúgio']

# Ajustes manuais qualitativos, sempre transparentes: alguns nomes têm problemas conhecidos de associação genérica ou força excepcional.
MANUAL = {
    'Lumora': {'premium': 1, 'visual': 1, 'elasticidade': 1},
    'Auralis': {'premium': 1, 'visual': 1},
    'Nuvora': {'premium': 1, 'visual': 1, 'elasticidade': 1},
    'Alvora': {'premium': 1, 'visual': 1, 'memorabilidade': 1},
    'Viora': {'premium': 1, 'memorabilidade': 1, 'elasticidade': 1},
    'Eliva': {'memorabilidade': 1, 'confianca': 1},
    'Virena': {'confianca': 1, 'premium': 1},
    'Nexora': {'elasticidade': 1, 'visual': 1},
    'Synora': {'elasticidade': 1},
    'Veyra': {'memorabilidade': 1, 'premium': 1, 'diferenciacao': 1},
    'Orbia': {'elasticidade': 1, 'visual': 1},
    'Elara': {'memorabilidade': 1, 'confianca': 1},
    'Caira': {'confianca': 1, 'memorabilidade': 1},
    'Nalia': {'confianca': 1, 'memorabilidade': 1},
    'Orya': {'diferenciacao': 1, 'premium': 1, 'visual': 1},
    'Oriva': {'memorabilidade': 1, 'elasticidade': 1},
    'Zelora': {'confianca': 1, 'premium': 1, 'visual': 1},
    'Arcora': {'elasticidade': 1, 'visual': 1},
    'Atlora': {'elasticidade': 1, 'visual': 1},
    'Navea': {'visual': 1, 'memorabilidade': 1},
    'Serena': {'diferenciacao': -2},
    'Aviva': {'risco': -3, 'diferenciacao': -2},
    'Avara': {'risco': -5, 'confianca': -3},
    'Ovela': {'risco': -4, 'confianca': -2},
    'Coviva': {'risco': -4, 'confianca': -3},
    'Navea': {'risco': -2, 'visual': 1, 'memorabilidade': 1},
}

def clamp(x, lo=1, hi=10):
    return max(lo, min(hi, x))

def score_row(row):
    name = row['name'].strip()
    lower = name.lower()
    risk = row['preliminary_risk'].lower()
    rationale = row['rationale'].lower()
    territory = row['territory']
    length = len(name)
    vowels = sum(1 for c in lower if c in 'aeiouy')
    vowel_ratio = vowels / max(1, length)
    has_bad_core = any(t in lower for t in BANNED_CORES)
    has_hard_risk = any(t in risk for t in HARD_RISK_TERMS)
    low_defense = any(t in risk for t in COMMON_LOW_DEFENSE)
    cold = any(t in risk for t in TECH_COLD)
    ai_explicit = any(t in risk for t in AI_EXPLICIT)
    repeats = len(set(lower)) / max(1, length)

    memorabilidade = 7
    if 4 <= length <= 7:
        memorabilidade += 2
    elif length <= 9:
        memorabilidade += 1
    else:
        memorabilidade -= 1
    if repeats < 0.65:
        memorabilidade -= 1
    if any(ch in lower for ch in ['y', 'v', 'x', 'z']):
        memorabilidade += 0.5

    sonoridade = 7
    if 0.38 <= vowel_ratio <= 0.62:
        sonoridade += 1.5
    if re.search(r'(q[^u]|vr|lv|sh|ck)', lower):
        sonoridade -= 1
    if length <= 7:
        sonoridade += 0.5

    premium = 6
    if any(tok in rationale for tok in PREMIUM_TOKENS):
        premium += 1.5
    if territory in VISUAL_GOOD_TERRITORIES:
        premium += 1
    if low_defense:
        premium -= 1
    if cold:
        premium -= 0.5

    confianca = 7
    if any(tok in lower for tok in ['cura', 'cur', 'med']):
        confianca -= 1
    if any(tok in rationale for tok in ['cuidado', 'vida', 'zelo', 'amparo', 'vital']):
        confianca += 1
    if has_hard_risk:
        confianca -= 2
    if ai_explicit:
        confianca -= 0.5

    elasticidade = 7
    if any(tok in rationale for tok in ['ecossistema', 'plataforma', 'rede', 'jornada', 'orquestra', 'navegação', 'campo']):
        elasticidade += 1.5
    if any(tok in lower for tok in ['shop', 'market', 'doctor', 'med']):
        elasticidade -= 2
    if name in ['Somae', 'Serena', 'Mirela', 'Ampara']:
        elasticidade -= 1

    diferenciacao = 7
    if has_bad_core:
        diferenciacao -= 2
    if low_defense:
        diferenciacao -= 1.5
    if 4 <= length <= 7 and not has_bad_core:
        diferenciacao += 1
    if name in ['Serena', 'Aviva', 'Soluna', 'Navia', 'Orientia', 'Orienta']:
        diferenciacao -= 1.5

    visual = 7
    if territory in VISUAL_GOOD_TERRITORIES:
        visual += 1.5
    if any(tok in rationale for tok in ['luminosa', 'aurora', 'aura', 'futurista', 'campo', 'nave', 'atlas']):
        visual += 1
    if cold:
        visual -= 0.5

    risco_semantico = 8
    if has_hard_risk:
        risco_semantico -= 4
    if low_defense:
        risco_semantico -= 1.5
    if ai_explicit:
        risco_semantico -= 1
    if 'exist' in risk or 'usado' in risk or 'usos' in risk:
        risco_semantico -= 1
    if 'pronúncia' in risk or 'grafia' in risk or 'confundido' in risk:
        risco_semantico -= 1

    vals = {
        'memorabilidade': memorabilidade,
        'sonoridade_pt_en': sonoridade,
        'sofisticacao_premium': premium,
        'confianca_saude': confianca,
        'elasticidade': elasticidade,
        'diferenciacao': diferenciacao,
        'compatibilidade_visual': visual,
        'risco_semantico': risco_semantico,
    }

    adj = MANUAL.get(name, {})
    mapping = {
        'premium': 'sofisticacao_premium',
        'visual': 'compatibilidade_visual',
        'elasticidade': 'elasticidade',
        'memorabilidade': 'memorabilidade',
        'confianca': 'confianca_saude',
        'diferenciacao': 'diferenciacao',
        'risco': 'risco_semantico',
    }
    for k, v in adj.items():
        vals[mapping[k]] += v

    vals = {k: clamp(round(v, 1)) for k, v in vals.items()}
    weighted = sum(vals[k] * WEIGHTS[k] for k in WEIGHTS) / 10
    # Total em escala 0-100 pois pesos somam 100 e cada critério vai até 10.
    row_out = dict(row)
    row_out.update(vals)
    row_out['total_100'] = round(weighted, 1)
    return row_out

with INPUT.open(newline='', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

scored = [score_row(r) for r in rows]
scored.sort(key=lambda r: r['total_100'], reverse=True)

fieldnames = list(scored[0].keys())
with OUTPUT.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(scored)

with MD_OUTPUT.open('w', encoding='utf-8') as f:
    f.write('# Ranking Quantitativo de Naming\n\n')
    f.write('Pontuação heurística baseada no scorecard definido. Esta análise não substitui busca jurídica, INPI, classes de marca, domínios e checagem linguística profissional.\n\n')
    f.write('| Rank | Nome | Território | Total | Memor. | Som | Premium | Conf. | Elastic. | Dif. | Visual | Risco |\n')
    f.write('|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n')
    for i, r in enumerate(scored[:35], start=1):
        f.write(f"| {i} | {r['name']} | {r['territory']} | {r['total_100']} | {r['memorabilidade']} | {r['sonoridade_pt_en']} | {r['sofisticacao_premium']} | {r['confianca_saude']} | {r['elasticidade']} | {r['diferenciacao']} | {r['compatibilidade_visual']} | {r['risco_semantico']} |\n")

print(f'Wrote {OUTPUT}')
print(f'Wrote {MD_OUTPUT}')
print('Top 15:')
for r in scored[:15]:
    print(f"{r['name']}: {r['total_100']}")
