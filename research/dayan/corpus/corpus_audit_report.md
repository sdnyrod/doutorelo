# Auditoria do corpus bruto Dr. Dayan

Esta auditoria verifica a cobertura dos 250 vídeos, a presença dos arquivos Markdown, os status reportados pelo pipeline e os principais sinais de qualidade textual antes da consolidação temática.

| Métrica | Valor |
|---|---:|
| Registros JSON | 250 |
| Análises Markdown individuais | 250 |
| Índices únicos presentes | 250 |
| Total de palavras nos metadados | 304064 |
| Total de palavras medido nos Markdown | 304337 |
| Média de palavras por vídeo | 1216.3 |
| Mediana de palavras por vídeo | 1216.0 |
| Menor análise em palavras | 42 |
| Maior análise em palavras | 1657 |
| Falhas reportadas | 1 |
| Arquivos muito curtos, abaixo de 800 palavras | 1 |
| Arquivos curtos, 800 a 999 palavras | 6 |
| Markdown ausentes | 0 |

## Status do pipeline

| Status | Vídeos |
|---|---:|
| completed | 249 |
| failed | 1 |

## Cobertura dos índices

Índices ausentes: **nenhum**.

Índices duplicados: **nenhum**.

## Registros com falha ou baixa densidade

| Índice | ID | Status | Palavras | Título | Erro |
|---:|---|---|---:|---|---|
| 121 | `c7swyVubuHM` | failed | 42 | Projeto Renovação: [Gravação]: Resumo de Todas as Aulas | Starting video analysis...
Submitting video analysis task...
Task submitted (ID: video-analysis-cc097250-5511-4bea-8af4-eb2ecbd3d7f1)
[8s] Status: Analyzing video content with AI.. |

### Arquivos muito curtos ou incompletos

| Índice | ID | Status | Palavras | Título |
|---:|---|---|---:|---|
| 121 | `c7swyVubuHM` | failed | 42 | Projeto Renovação: [Gravação]: Resumo de Todas as Aulas |

### Arquivos curtos, porém provavelmente utilizáveis

| Índice | ID | Status | Palavras | Título |
|---:|---|---|---:|---|
| 105 | `fAT_rADFmKY` | completed | 937 | A minha casa nova nos ESTADOS UNIDOS 🇺🇸 |
| 246 | `m2dwZtBK0EA` | completed | 937 | The Egg Diet: How to Do It and Lose 7kg in a Few Days \| Dr. Dayan Siebra |
| 233 | `LssJs9iLIVU` | completed | 975 | ABACATE EMAGRECE: BENEFÍCIOS, RECEITA E UMA SURPRESA \| Dr Dayan Siebra |
| 78 | `Umh1khLMjaA` | completed | 979 | SHOULD YOU WASH CHICKEN AND MEAT? |
| 52 | `aAA1HhbKSn0` | completed | 981 | The doctor who almost became a criminal, in search of likes. |
| 158 | `e-Gra_MwRNg` | completed | 997 | BAY LEAF TEA WITH CLOVES \| Dr Dayan Siebra |

## Distribuição por tema inicial

| Tema inicial | Vídeos |
|---|---:|
| outros_a_classificar_por_transcricao | 93 |
| nutricao_alimentos_bebidas | 56 |
| emagrecimento_metabolismo | 32 |
| prevencao_alertas_risco | 26 |
| suplementos_vitaminas_compostos | 16 |
| circulacao_cardio_vascular | 8 |
| sono_energia_cognicao | 6 |
| inflamacao_detox | 5 |
| beleza_pele_cabelo_envelhecimento | 3 |
| hormonios_libido_sexualidade | 3 |
| habitos_rotina_estilo_de_vida | 2 |

## Decisão operacional recomendada

Antes da consolidação final, recomenda-se reprocessar os registros com status diferente de `completed`, porque eles tendem a conter apenas mensagens de erro ou saídas incompletas. Os arquivos curtos entre 800 e 999 palavras podem ser mantidos inicialmente, mas devem receber menor prioridade de citação na base de conhecimento até revisão manual ou reprocessamento seletivo.

