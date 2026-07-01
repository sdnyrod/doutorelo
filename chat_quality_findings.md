# Achados de qualidade do chat DEV

A análise do caso real informado pelo usuário e das buscas controladas nos logs mostrou que a instrumentação atual não preserva de forma legível o corpo completo das mensagens do chat em todos os eventos de rede. Portanto, o caso do screenshot deve ser tratado como regressão primária, pois ele representa a saída pública efetivamente observada no DEV.

## Problemas críticos encontrados

| Problema | Evidência | Impacto | Correção exigida |
|---|---|---|---|
| Vazamento de bastidores | Resposta pública mencionou “base Dayan”, “corpus Dayan”, categorias internas e raciocínio de uso de base. | Quebra a experiência clínica e expõe arquitetura interna ao paciente. | Guardrail público deve bloquear termos internos antes da resposta chegar ao usuário. |
| Verbosidade excessiva | Resposta em múltiplos parágrafos longos após o usuário informar intensidade e sono ruim. | Experiência inferior a uma IA moderna e aparência de formulário. | Limitar resposta pública a poucas linhas, com no máximo 2 ou 3 perguntas essenciais. |
| Continuidade fraca | O chat voltou a pedir amplo conjunto de dados em vez de avançar com o contexto já informado. | Sensação de recomeço da anamnese a cada rodada. | O prompt deve priorizar continuidade e não repetir perguntas amplas já implícitas. |
| Tom artificial | Frases como “vou usar a lente integrativa” e “repertório educativo rastreável”. | Soa técnico e institucional, não humano. | Resposta final deve ser natural, específica e sem metalinguagem. |

## Critério de aceitação para regressão

A resposta pública do chat não pode conter termos como “Dayan”, “base”, “corpus”, “agente”, “maestro”, “orquestra”, “guardrail”, “prompt”, “schema”, “JSON”, “bastidor”, “lente integrativa”, “repertório educativo rastreável” ou nomes de categorias internas. Em sintomas comuns sem red flag, a resposta deve caber em poucas frases, perguntar no máximo três pontos essenciais, e não deve parecer formulário.
