import csv
from pathlib import Path

out_dir = Path('/home/ubuntu/saude-integrativa-ia-dev/docs')

candidates = [
    # name, territory, distinctiveness, semantic_fit, phonetics_pt, globality, expandability, ai_balance, trust, risk, notes
    ('Eloya','Elo/conexão humana',8.5,7.5,8.0,8.0,8.0,6.5,7.5,7.5,'Preserva o território de elo sem “doutor”; baixo conflito direto em saúde nos primeiros resultados.'),
    ('Coraia','Coração/cuidado + IA',8.0,8.5,8.0,7.0,8.0,8.5,8.0,6.5,'Excelente ponte entre cuidado e IA; atenção a famílias CORA/Coria em saúde/tech.'),
    ('Mavya','Neologismo premium expansível',8.5,6.5,8.0,8.0,8.5,6.0,7.0,7.5,'Muito distintivo e flexível; exige construção narrativa para saúde.'),
    ('Elunai','Luz/elo/luna/inteligência',8.0,7.5,7.5,7.5,8.0,7.5,7.0,7.0,'Neologismo com boa estética, risco conhecido menor, mas precisa significado proprietário.'),
    ('Nalia','Cuidado humano premium',7.5,7.0,8.5,8.0,7.5,5.5,7.5,7.0,'Humano e acolhedor; menos forte em IA/ecossistema.'),
    ('Sovira','Transformação vital',8.0,7.5,8.0,7.5,8.0,6.0,7.0,7.0,'Boa transformação, menos intuitivo; requer narrativa.'),
    ('Orialis','Origem/orientação/luz',7.5,7.5,7.0,7.0,7.5,6.0,7.0,7.0,'Elegante, mas pronúncia pode variar.'),
    ('Halora','Proteção/brilho/cuidado',7.5,7.0,8.0,7.0,7.5,5.5,7.0,6.5,'Acolhedor; cuidado com conotação religiosa de halo.'),
    ('Auvia','Aura + via',7.5,7.5,7.5,7.0,7.5,6.0,7.0,6.5,'Bom caminho de cuidado; risco moderado por similaridade em tech.'),
    ('Luxara','Luz premium',7.0,6.5,7.5,7.5,7.0,4.5,6.5,6.0,'Premium, mas mais cosmético/luxo do que saúde integrada.'),
    ('Zelora','Zelo + aurora',7.0,7.5,7.5,6.5,7.0,5.0,7.0,5.5,'Bom em português, mas já há uso comercial relevante e menor globalidade.'),
    ('Elyra','Elo/Lyra/humano',7.0,6.5,8.0,7.5,7.0,5.0,7.0,5.5,'Boa sonoridade; Lyra é usado em saúde mental/tech.'),
    ('Lumora','Luz/clareza',7.0,7.0,8.0,7.5,7.0,5.5,7.0,4.5,'Forte estética, mas checagem indicou risco relevante em classes sensíveis.'),
    ('Nuvora','Nuvem/aurora digital',7.0,7.0,8.0,7.0,7.0,6.0,7.0,4.0,'Boa sonoridade, mas risco direto por uso corporativo em saúde.'),
    ('Alvora','Alvorada/renovação',7.0,7.5,8.0,7.0,7.0,5.5,7.0,3.5,'Descartar como principal por Alvora Health.'),
    ('Viora','Vida/orientação',7.0,8.0,8.5,7.0,7.0,6.0,8.0,3.0,'Descartar como principal por Viora Health e proximidade direta.'),
    ('Auralis','Aura premium/IA',7.0,6.5,7.0,7.0,7.0,6.0,6.5,4.0,'Uso em IA e possível associação a áudio; risco alto.'),
    ('Nexora','Nexus/aurora',7.5,7.5,7.5,7.0,8.0,6.5,7.0,3.0,'Descartar como principal por conflitos em suplementos/saúde.'),
    ('Veyra','Verdade/clareza',8.0,7.0,8.0,7.5,7.5,6.0,7.0,3.0,'Uso relevante em wellness/respiratório; risco alto.'),
    ('Oriva','Origem/vida',7.5,7.5,8.0,7.0,7.5,6.0,7.0,3.0,'Descartar como principal por Oriva Health.'),
    ('Synora','Sinapse/orquestração',7.0,7.0,7.5,7.0,7.5,7.0,6.5,3.0,'Risco por software/marketplace/agendamento.'),
    ('Aivora','IA + aurora',7.0,8.0,7.5,7.0,7.5,9.0,6.5,2.5,'Descartar como principal por uso já associado a IA médica e automação.'),
    ('Cuidya','Cuidado + IA',7.0,8.5,8.0,5.5,7.0,8.5,8.0,2.5,'Muito claro em português, mas alto risco fonético com Caidya no setor clínico.'),
    ('Almaia','Alma + IA',7.0,8.0,8.0,7.0,7.0,7.0,8.0,4.0,'Emocional, mas risco por Alamya Health, home health e clínica.'),
    ('Elovia','Elo + vida/via',7.0,8.0,8.0,7.0,7.0,6.5,7.5,4.0,'Boa semântica, mas já há usos em sleep/wellness/ecommerce/health.'),
    ('Zentra','Centro/orquestração',7.5,7.5,7.5,7.5,8.0,6.5,7.0,4.5,'Forte, mas já aparece em wellness, saúde e outros setores.'),
    ('Carelo','Care + elo',6.5,8.0,8.0,6.5,7.0,5.0,7.5,3.0,'Proximidade indesejada com Carelon, grande empresa de serviços de saúde.'),
]

weights = {
    'distinctiveness': 0.18,
    'semantic_fit': 0.18,
    'phonetics_pt': 0.12,
    'globality': 0.10,
    'expandability': 0.14,
    'ai_balance': 0.10,
    'trust': 0.10,
    'risk': 0.08,
}

rows = []
for c in candidates:
    name, territory, distinctiveness, semantic_fit, phonetics_pt, globality, expandability, ai_balance, trust, risk, notes = c
    score = (
        distinctiveness*weights['distinctiveness'] +
        semantic_fit*weights['semantic_fit'] +
        phonetics_pt*weights['phonetics_pt'] +
        globality*weights['globality'] +
        expandability*weights['expandability'] +
        ai_balance*weights['ai_balance'] +
        trust*weights['trust'] +
        risk*weights['risk']
    )
    if risk <= 3.5:
        recommendation = 'Descartar como principal'
    elif score >= 7.55 and risk >= 6.5:
        recommendation = 'Shortlist principal'
    elif score >= 7.0 and risk >= 5.5:
        recommendation = 'Shortlist secundária'
    else:
        recommendation = 'Reserva / baixo encaixe'
    rows.append({
        'name': name,
        'territory': territory,
        'distinctiveness': distinctiveness,
        'semantic_fit': semantic_fit,
        'phonetics_pt': phonetics_pt,
        'globality': globality,
        'expandability': expandability,
        'ai_balance': ai_balance,
        'trust': trust,
        'risk_score': risk,
        'weighted_score': round(score, 2),
        'recommendation': recommendation,
        'notes': notes,
    })

rows.sort(key=lambda r: (r['recommendation'] != 'Shortlist principal', -r['weighted_score'], -r['risk_score']))

csv_path = out_dir / 'naming-scorecard.csv'
with csv_path.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

md_path = out_dir / 'naming-scorecard.md'
with md_path.open('w', encoding='utf-8') as f:
    f.write('# Scorecard consolidado de naming\n\n')
    f.write('A pontuação pondera diferenciação, aderência semântica, fonética em português, globalidade, elasticidade de portfólio, equilíbrio de IA, confiança em saúde e risco preliminar. O score de risco é qualitativo e não substitui busca jurídica de marca.\n\n')
    f.write('| Rank | Nome | Território | Score | Recomendação | Nota de risco/estratégia |\n')
    f.write('|---:|---|---|---:|---|---|\n')
    for idx, r in enumerate(rows, 1):
        f.write(f"| {idx} | {r['name']} | {r['territory']} | {r['weighted_score']:.2f} | {r['recommendation']} | {r['notes']} |\n")

print(csv_path)
print(md_path)
