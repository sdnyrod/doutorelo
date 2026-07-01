import json
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

ROOT = Path('/home/ubuntu/saude-integrativa-ia-dev/research/benchmark-ai-medicina')
INPUT = Path('/home/ubuntu/benchmark_ai_medicina_global.json')

with INPUT.open('r', encoding='utf-8') as f:
    raw = json.load(f)

platforms = []
for item in raw['results']:
    out = item['output']
    platforms.append({
        'plataforma': out['platform'],
        'regiao': out['country_region'],
        'posicionamento': out['one_sentence_positioning'],
        'fontes': out['key_sources'],
    })

# Escala qualitativa de 1 a 5 baseada nas fichas pesquisadas.
# 1 = fraco/incipiente; 3 = competitivo; 5 = líder global ou muito avançado.
scores = [
    {'plataforma': 'Ant AQ / Ant Afu', 'escala_ecossistema': 5, 'resolutividade_chat': 5, 'integracoes_dados_servicos': 5, 'governanca_clinica': 3, 'monetizacao': 4, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'Ping An Health / Ping An Good Doctor / Xin Yi', 'escala_ecossistema': 5, 'resolutividade_chat': 5, 'integracoes_dados_servicos': 5, 'governanca_clinica': 4, 'monetizacao': 5, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'JD Health', 'escala_ecossistema': 5, 'resolutividade_chat': 4, 'integracoes_dados_servicos': 5, 'governanca_clinica': 4, 'monetizacao': 5, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'WeDoctor / Guahao', 'escala_ecossistema': 4, 'resolutividade_chat': 4, 'integracoes_dados_servicos': 5, 'governanca_clinica': 3, 'monetizacao': 4, 'aplicabilidade_doutorelo': 4},
    {'plataforma': 'Alibaba Health / AliHealth', 'escala_ecossistema': 5, 'resolutividade_chat': 4, 'integracoes_dados_servicos': 5, 'governanca_clinica': 3, 'monetizacao': 5, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'ChatGPT Health - OpenAI', 'escala_ecossistema': 5, 'resolutividade_chat': 4, 'integracoes_dados_servicos': 4, 'governanca_clinica': 5, 'monetizacao': 4, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'Claude for Healthcare / Claude health connectors — Anthropic', 'escala_ecossistema': 4, 'resolutividade_chat': 3, 'integracoes_dados_servicos': 5, 'governanca_clinica': 5, 'monetizacao': 5, 'aplicabilidade_doutorelo': 5},
    {'plataforma': 'Ada Health', 'escala_ecossistema': 4, 'resolutividade_chat': 4, 'integracoes_dados_servicos': 3, 'governanca_clinica': 5, 'monetizacao': 4, 'aplicabilidade_doutorelo': 4},
    {'plataforma': 'K Health', 'escala_ecossistema': 4, 'resolutividade_chat': 5, 'integracoes_dados_servicos': 4, 'governanca_clinica': 5, 'monetizacao': 4, 'aplicabilidade_doutorelo': 5},
]

df_scores = pd.DataFrame(scores)
df_scores['pontuacao_total'] = df_scores[[
    'escala_ecossistema', 'resolutividade_chat', 'integracoes_dados_servicos',
    'governanca_clinica', 'monetizacao', 'aplicabilidade_doutorelo'
]].sum(axis=1)
df_scores = df_scores.sort_values('pontuacao_total', ascending=False)

ROOT.mkdir(parents=True, exist_ok=True)
df_scores.to_csv(ROOT / 'matriz_pontuacao_benchmark.csv', index=False)

# Tabela markdown simplificada.
md = '# Matriz de pontuação qualitativa do benchmark\n\n'
md += 'Pontuação qualitativa de 1 a 5 baseada nas fichas de pesquisa. A nota não mede qualidade clínica absoluta; mede força competitiva observável e relevância estratégica para o DOUTORELO.\n\n'
md += df_scores.to_markdown(index=False)
md += '\n'
(ROOT / 'matriz_pontuacao_benchmark.md').write_text(md, encoding='utf-8')

plt.figure(figsize=(13, 7.5))
heat = df_scores.set_index('plataforma')[[
    'escala_ecossistema', 'resolutividade_chat', 'integracoes_dados_servicos',
    'governanca_clinica', 'monetizacao', 'aplicabilidade_doutorelo'
]]
labels = {
    'escala_ecossistema': 'Escala\n/ecossistema',
    'resolutividade_chat': 'Chat\nresolutivo',
    'integracoes_dados_servicos': 'Integrações\ndados/serviços',
    'governanca_clinica': 'Governança\nclínica',
    'monetizacao': 'Monetização',
    'aplicabilidade_doutorelo': 'Aplicabilidade\nDOUTORELO',
}
heat = heat.rename(columns=labels)
sns.set_theme(style='whitegrid', font='DejaVu Sans')
ax = sns.heatmap(
    heat,
    annot=True,
    cmap='YlGnBu',
    vmin=1,
    vmax=5,
    linewidths=0.6,
    linecolor='white',
    cbar_kws={'label': 'Pontuação qualitativa (1–5)'}
)
ax.set_title('Benchmark global de IA medicinal: força competitiva por dimensão', fontsize=16, pad=18, weight='bold')
ax.set_xlabel('Dimensão avaliada')
ax.set_ylabel('Plataforma')
plt.xticks(rotation=0, ha='center')
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(ROOT / 'heatmap_benchmark_ia_medicinal.png', dpi=220, bbox_inches='tight')
plt.close()

summary = df_scores[['plataforma', 'pontuacao_total']].copy()
summary.to_csv(ROOT / 'ranking_benchmark.csv', index=False)
print('Arquivos gerados:')
print(ROOT / 'matriz_pontuacao_benchmark.csv')
print(ROOT / 'matriz_pontuacao_benchmark.md')
print(ROOT / 'ranking_benchmark.csv')
print(ROOT / 'heatmap_benchmark_ia_medicinal.png')
