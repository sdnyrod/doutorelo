import json
import re
from collections import Counter, defaultdict
from pathlib import Path

base = Path('/home/ubuntu/saude-integrativa-ia-dev/research/dayan')
input_path = base / 'dayan_youtube_videos_top250.ndjson'
records = []
with input_path.open('r', encoding='utf-8') as f:
    for line in f:
        line=line.strip()
        if not line:
            continue
        try:
            item=json.loads(line)
        except json.JSONDecodeError:
            continue
        records.append({
            'index': item.get('playlist_index'),
            'id': item.get('id'),
            'title': item.get('title') or '',
            'duration': item.get('duration'),
            'duration_string': item.get('duration_string') or '',
            'url': item.get('url') or item.get('webpage_url') or '',
        })

vocab = {
    'emagrecimento_metabolismo': ['emagrec', 'perder peso', 'desinchar', 'metabol', 'gordura', 'barriga', 'obes', 'jejum'],
    'inflamacao_desintoxicacao': ['inflam', 'desinflam', 'detox', 'desintox', 'toxina', 'limpar', 'fígado', 'figado'],
    'nutricao_alimentos': ['alimento', 'comida', 'chá', 'cha', 'suco', 'bebida', 'água', 'agua', 'alho', 'azeite', 'ovo', 'carne', 'açúcar', 'acucar', 'farinha'],
    'suplementos_vitaminas': ['vitamina', 'creatina', 'magnésio', 'magnesio', 'colágeno', 'colageno', 'omega', 'própolis', 'propolis', 'suplement'],
    'beleza_pele_cabelos': ['pele', 'cabelo', 'unha', 'ruga', 'flacidez', 'beleza', 'rosto', 'envelhec'],
    'cardiovascular_circulacao': ['circula', 'vascular', 'pressão', 'pressao', 'coração', 'coracao', 'infarto', 'veia', 'varizes'],
    'hormonios_sexualidade': ['horm', 'libido', 'testosterona', 'menopausa', 'sexo', 'sexual'],
    'sono_energia_cognicao': ['sono', 'cansaço', 'cansaco', 'energia', 'memória', 'memoria', 'cérebro', 'cerebro', 'ansiedade'],
    'prevencao_risco': ['câncer', 'cancer', 'hepatite', 'preven', 'risco', 'sintoma', 'alerta'],
    'estilo_de_vida': ['hábito', 'habito', 'estilo de vida', 'exercício', 'exercicio', 'rotina', 'saúde após', 'depois dos'],
}

stop = set('a o as os de da do das dos e para pra por com sem em no na nos nas um uma uns umas seu sua seus suas que voce você como quando onde porque isso este esta esse essa depois antes mais menos melhor pior pode fazer jamais deve ter ser vai foi sao são dr dayan siebra'.split())
word_counter = Counter()
theme_counts = Counter()
examples = defaultdict(list)

for r in records:
    title_norm = r['title'].lower()
    title_norm = title_norm.replace('á','a').replace('à','a').replace('â','a').replace('ã','a').replace('é','e').replace('ê','e').replace('í','i').replace('ó','o').replace('ô','o').replace('õ','o').replace('ú','u').replace('ç','c')
    for word in re.findall(r'[a-zA-ZÀ-ÿ0-9]{3,}', title_norm):
        if word not in stop:
            word_counter[word] += 1
    matched = False
    for theme, keys in vocab.items():
        if any(k.lower() in title_norm for k in keys):
            theme_counts[theme] += 1
            matched = True
            if len(examples[theme]) < 12:
                examples[theme].append(r)
    if not matched:
        theme_counts['outros_nao_classificados'] += 1
        if len(examples['outros_nao_classificados']) < 12:
            examples['outros_nao_classificados'].append(r)

# CSV de vídeos
csv_path = base / 'dayan_youtube_videos_top250.csv'
with csv_path.open('w', encoding='utf-8') as f:
    f.write('index,id,duration_seconds,duration_string,title,url\n')
    for r in records:
        title = '"' + r['title'].replace('"','""') + '"'
        f.write(f"{r['index']},{r['id']},{r['duration'] or ''},{r['duration_string']},{title},{r['url']}\n")

md = []
md.append('# Matriz temática inicial — Canal público Dayan Siebra no YouTube\n')
md.append(f'Amostra analisada: **{len(records)} vídeos públicos recentes** extraídos da aba de vídeos do canal `@DayanSiebra`, sem baixar os vídeos completos.\n')
md.append('## Distribuição temática por títulos\n')
md.append('| Tema | Ocorrências na amostra | Leitura para a IA DOUTORELO |')
md.append('|---|---:|---|')
labels = {
    'emagrecimento_metabolismo': 'Emagrecimento e metabolismo',
    'inflamacao_desintoxicacao': 'Inflamação e desintoxicação',
    'nutricao_alimentos': 'Nutrição, alimentos e bebidas',
    'suplementos_vitaminas': 'Suplementos, vitaminas e compostos naturais',
    'beleza_pele_cabelos': 'Beleza, pele, cabelo e envelhecimento',
    'cardiovascular_circulacao': 'Circulação, vascular e cardiovascular',
    'hormonios_sexualidade': 'Hormônios, libido e sexualidade',
    'sono_energia_cognicao': 'Sono, energia, cognição e sintomas funcionais',
    'prevencao_risco': 'Prevenção, sintomas de alerta e risco',
    'estilo_de_vida': 'Estilo de vida, hábitos e rotina',
    'outros_nao_classificados': 'Outros ou não classificados por título',
}
reading = {
    'emagrecimento_metabolismo': 'A IA deve investigar rotina, alimentação, sono, inflamação percebida, idade e histórico antes de educar sobre emagrecimento; não deve prometer perda rápida.',
    'inflamacao_desintoxicacao': 'A IA deve traduzir o termo popular “desinflamar/desintoxicar” em educação sobre hábitos, fígado, alimentação, sono, álcool e avaliação médica quando necessário.',
    'nutricao_alimentos': 'A IA deve oferecer educação alimentar acessível, contextual e prudente, evitando prescrição rígida e respeitando contraindicações.',
    'suplementos_vitaminas': 'A IA deve tratar suplementos com checagem de medicamentos, condições clínicas, dose indefinida e recomendação de profissional quando houver risco.',
    'beleza_pele_cabelos': 'A IA pode conectar estética a saúde metabólica, nutrição e envelhecimento, sem prometer reversão ou tratamento individual.',
    'cardiovascular_circulacao': 'A IA deve ativar red flags para dor no peito, falta de ar, sinais neurológicos, trombose, hipertensão grave e sintomas vasculares agudos.',
    'hormonios_sexualidade': 'A IA deve abordar com linguagem simples, coletar contexto e evitar reposição hormonal, diagnóstico ou promessa de melhora sexual.',
    'sono_energia_cognicao': 'A IA deve organizar sintomas funcionais, rotina e possíveis fatores de estilo de vida, encaminhando sinais graves ou persistentes.',
    'prevencao_risco': 'A IA deve explicar prevenção e sinais de alerta sem alarmismo e sem substituir rastreios ou consulta médica.',
    'estilo_de_vida': 'A IA deve transformar explicações em hábitos graduais, rastreáveis e personalizados pelo usuário.',
    'outros_nao_classificados': 'Os títulos fora dos vocabulários precisam ser revisitados por transcrição e análise semântica.',
}
for theme, count in theme_counts.most_common():
    md.append(f"| {labels.get(theme, theme)} | {count} | {reading.get(theme, '')} |")

md.append('\n## Palavras recorrentes em títulos\n')
md.append('| Termo | Frequência |')
md.append('|---|---:|')
for word, count in word_counter.most_common(50):
    md.append(f'| {word} | {count} |')

md.append('\n## Exemplos por tema\n')
for theme, recs in examples.items():
    md.append(f"\n### {labels.get(theme, theme)}\n")
    md.append('| Índice | Título | Duração | URL |')
    md.append('|---:|---|---:|---|')
    for r in recs:
        md.append(f"| {r['index']} | {r['title'].replace('|','/')} | {r['duration_string']} | {r['url']} |")

(base / 'dayan_youtube_thematic_matrix.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
print(f'Analisados {len(records)} registros.')
print('Arquivos gerados:')
print(csv_path)
print(base / 'dayan_youtube_thematic_matrix.md')
