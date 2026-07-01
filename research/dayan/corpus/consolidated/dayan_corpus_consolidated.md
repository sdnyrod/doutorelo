# Consolidação temática do corpus Dr. Dayan

Autor: **Manus AI**.

Este documento consolida as análises profundas geradas a partir dos vídeos públicos do Dr. Dayan Siebra para uso interno no DOUTORELO. A consolidação preserva rastreabilidade por vídeo, URL e seção semântica, sem transformar conteúdo educativo em prescrição clínica.

> O corpus consolidado deve ser usado como base de educação em saúde e triagem conversacional, sempre com limites clínicos claros, recomendação de avaliação profissional quando houver risco e prioridade para alertas/contraindicações extraídos das próprias análises.

## Resumo executivo

| Métrica | Valor |
|---|---:|
| Vídeos com análise válida | 249 |
| Vídeos excluídos ou falhos | 1 |
| Palavras úteis consolidadas | 304.022 |
| Média de palavras por vídeo válido | 1221.0 |
| Chunks pesquisáveis | 2405 |
| Chunks com relevância de segurança clínica | 1539 |

## Distribuição por tema inicial

| Tema | Vídeos | Palavras | Termos frequentes |
|---|---:|---:|---|
| Outros ou a classificar | 92 | 112.549 | suplemento. intestino. diabetes. chá. ansiedade. câncer. emagrecimento. obesidade |
| Nutrição. alimentos e bebidas | 56 | 67.920 | chá. intestino. fígado. suplemento. diabetes. câncer. emagrecimento. colesterol |
| emagrecimento_metabolismo | 32 | 38.819 | emagrecimento. intestino. suplemento. diabetes. chá. obesidade. ansiedade. câncer |
| prevencao_alertas_risco | 26 | 31.925 | câncer. suplemento. diabetes. ansiedade. obesidade. intestino. hipertensão. chá |
| suplementos_vitaminas_compostos | 16 | 20.164 | suplemento. intestino. chá. fígado. emagrecimento. câncer. ansiedade. menopausa |
| circulacao_cardio_vascular | 8 | 9.890 | colesterol. diabetes. obesidade. hipertensão. suplemento. magnésio. fígado. pressão alta |
| sono_energia_cognicao | 6 | 7.175 | ansiedade. suplemento. insônia. magnésio. diabetes. câncer. vitamina d. tireoide |
| inflamacao_detox | 5 | 5.757 | chá. diabetes. fígado. detox. inflamação silenciosa. câncer. colesterol. metais pesados |
| beleza_pele_cabelo_envelhecimento | 3 | 3.914 | suplemento. câncer. vitamina d. obesidade. saúde intestinal. intestino. fígado. tireoide |
| hormonios_libido_sexualidade | 3 | 3.604 | menopausa. testosterona. suplemento. ansiedade. chá. insônia. obesidade. diabetes |
| habitos_rotina_estilo_de_vida | 2 | 2.305 | emagrecimento. diabetes. colesterol. hipertensão. ansiedade. insônia. suplemento |

## Índices temáticos de recuperação

| Índice de consulta | Vídeos relacionados |
|---|---:|
| `inflamacao_dor` | 242 |
| `agua_hidratacao` | 236 |
| `suplementos_chas` | 227 |
| `diabetes_glicemia` | 153 |
| `sono_ansiedade_cerebro` | 153 |
| `hormonios_energia` | 145 |
| `medicamentos_alertas` | 145 |
| `intestino_estomago` | 143 |
| `hipertensao_coracao` | 133 |
| `emagrecimento_obesidade` | 122 |
| `cancer_prevencao` | 77 |
| `figado_desintoxicacao` | 76 |

## Lacunas e exclusões rastreáveis

| # | ID | Título | Motivo |
|---:|---|---|---|
| 121 | `c7swyVubuHM` | Projeto Renovação: [Gravação]: Resumo de Todas as Aulas | análise curta/falha ou acesso indisponível após reparo; ver `video_121_access_audit.md` |

## Arquivos gerados

| Arquivo | Finalidade |
|---|---|
| `dayan_video_index.json` | Índice por vídeo com tese, resumo operacional, alertas e metadados. |
| `dayan_knowledge_chunks.jsonl` | Chunks pesquisáveis por seção semântica para integração ao backend. |
| `dayan_theme_index.json` | Agrupamento por tema inicial do manifesto. |
| `dayan_query_theme_index.json` | Agrupamento por temas de busca detectados por palavras-chave. |
| `dayan_failed_or_excluded.json` | Registro de lacunas/falhas sem inferência de conteúdo. |
| `dayan_corpus_stats.json` | Métricas resumidas do corpus consolidado. |

