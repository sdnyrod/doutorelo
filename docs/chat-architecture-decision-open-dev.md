# Decisão técnica: chat público em modo DEV aberto

**Autor:** Manus AI  
**Data:** 2026-05-03  
**Projeto:** Saúde Integrativa IA DEV  
**Escopo:** motor conversacional público, roteamento clínico, validação final, fallback e regressões automatizadas.

## Síntese executiva

Esta decisão substitui a orientação anterior de **congelar imediatamente o núcleo conversacional** por uma diretriz operacional mais adequada ao estado real do projeto: o ambiente atual é **DEV/teste**, não produção clínica. Portanto, a estratégia correta neste momento é **liberar primeiro o potencial generativo do LLM em casos verdes**, observar a qualidade real da experiência e reintroduzir freios finos apenas depois de avaliar comportamento, retenção, utilidade e segurança mínima.

> Diretriz aprovada pelo usuário: “Estamos em ambiente de testes, não em produção. Temos que liberar, e depois frear.”

A consequência prática é que o chat não deve se comportar como um formulário defensivo nem terminar respostas verdes com advertência médica automática. O motor deve entregar hipóteses plausíveis, perguntas específicas e próximos passos gerais de baixo risco, mantendo apenas três barreiras mínimas: **não ignorar urgência evidente**, **não fornecer dose/prescrição específica** e **não declarar diagnóstico fechado como certeza**.

## Contexto da falha anterior

A estratégia anterior acumulou camadas de segurança, corpus, roteamento, validação e fallback até que o sistema começou a apresentar sintomas típicos de excesso de governança prematura: respostas públicas longas, tom artificial, exposição de bastidores e perguntas repetitivas. Isso prejudicava a percepção de inteligência do produto justamente na área mais importante para aquisição e retenção: a primeira conversa livre.

| Problema observado | Impacto no usuário | Resposta técnica adotada |
|---|---|---|
| Respostas com bastidores internos, como termos de corpus, agentes, maestro ou guardrail | Quebra de confiança e aparência de sistema mal acabado | Validador final mantém bloqueio de vazamento de bastidores e fallback público seguro |
| Respostas longas e com aparência de formulário | Reduz aderência, especialmente em mobile e tráfego de redes sociais | Contrato público continua limitado por concisão e no máximo três perguntas de seguimento |
| Advertência médica automática em casos verdes | Faz a IA parecer fraca, burocrática e pouco útil em DEV | Remoção da advertência automática; segurança só aparece quando há risco real ou fronteira crítica |
| Repetição de idade, peso, altura, sono, intestino e estresse apesar de histórico já informado | Dá sensação de que o sistema não escuta | Refinamento das perguntas determinísticas pelo histórico e instrução explícita ao LLM para não recomeçar a anamnese |

## Decisão arquitetural atual

A arquitetura continua modular, mas o centro de gravidade muda. O **LLM forte** passa a ser o núcleo generativo normal dos casos verdes. As regras determinísticas deixam de tentar responder à conversa e passam a servir como infraestrutura: classificar risco, organizar contexto, limitar vazamentos, proteger fronteiras críticas e oferecer fallback quando o LLM falha.

| Camada | Papel correto em DEV aberto | O que não deve fazer |
|---|---|---|
| Classificador de risco | Detectar urgência evidente, pedido de dose/prescrição e diagnóstico fechado | Transformar toda conversa verde em caso jurídico-defensivo |
| Roteador | Definir modo de resposta, tamanho e presença de nota obrigatória somente quando necessária | Impor disclaimer automático em todo caso clínico |
| Gerador LLM | Produzir resposta humana, específica, útil e contextual | Expor prompt, schema, guardrail, corpus, agentes ou bastidores |
| Validador final | Bloquear vazamento de bastidores, prescrição/dose e diagnóstico definitivo | Penalizar hipóteses clínicas abertas e perguntas úteis |
| Fallback | Responder de modo útil se o LLM falhar ou vazar termos internos | Dominar a experiência normal do usuário |

## Adaptação dos padrões Crew CWM

O documento metodológico Crew CWM foi tratado como referência de engenharia, não como fonte clínica. Os padrões transferíveis já incorporados ao motor são: wrapper LLM com parsing estruturado, contrato JSON estrito, roteamento pré-LLM, validação pós-LLM, fallback determinístico, detecção de alucinação/vazamento de bastidores e suíte de aceitação. O domínio de construção civil não foi copiado para saúde; apenas os padrões de engenharia de qualidade foram adaptados.

| Padrão transferível | Adaptação para o chat de saúde integrativa |
|---|---|
| Contrato de saída claro | `HomeChatResponse` público preserva resposta final, segurança, convite, recursos revelados e metadados sem expor bastidores |
| Separação entre geração e validação | LLM produz; validador aceita, corrige por fallback ou bloqueia somente violações críticas |
| Testes de aceitação com exemplos bons e ruins | Suítes cobrem vazamento de bastidores, concisão, sintomas digestivos, cefaleia, prescrição, cumprimentos, continuidade e fallback |
| Roteamento antes da geração | Classificação diferencia conversa social, caso verde, urgência, prescrição e exame/contexto sensível |
| Governança sem poluir UX | A governança existe no backend, mas o usuário recebe linguagem natural, não explicação de arquitetura |

## Continuidade conversacional

A partir desta decisão, continuidade é critério de qualidade, não detalhe cosmético. Quando o usuário já informou idade, peso, altura, rotina, intestino, sono, estresse, padrão de dor ou alimentação, o sistema deve usar esse material para avançar. Perguntas repetidas são tratadas como regressão.

A implementação atual adicionou dois mecanismos complementares. Primeiro, o prompt do gerador instrui o LLM a continuar a conversa e não repetir perguntas já respondidas. Segundo, as perguntas determinísticas de seguimento são filtradas contra o histórico do usuário, reduzindo recomeços de anamnese em casos digestivos e outros padrões comuns.

## Critérios de aceite para o estado DEV atual

| Critério | Estado esperado |
|---|---|
| Caso verde comum | Resposta aberta, útil, com hipóteses e ações gerais de baixo risco |
| Disclaimer automático | Ausente em casos verdes |
| Urgência evidente | Mantém orientação de atendimento imediato |
| Dose/prescrição | Não fornece dose, início, troca ou suspensão de medicamento/suplemento |
| Diagnóstico fechado | Não declara certeza diagnóstica; trabalha com hipóteses |
| Bastidores internos | Nunca expõe Dayan, corpus, agente, maestro, LLM, prompt, JSON, schema ou guardrail |
| Continuidade | Não repete dados já fornecidos pelo usuário |
| Fallback | Entra quando há falha do LLM, JSON inválido ou vazamento de bastidor |

## Riscos remanescentes

Esta decisão não declara o chat pronto para produção. Ela apenas afirma que, em DEV, o produto precisa ser testado com mais liberdade para revelar potencial real. Ainda permanecem riscos de linguagem excessivamente confiante, variação de qualidade do LLM, sensibilidade regulatória, ausência de avaliação clínica formal e necessidade de validação com usuários reais.

A mitigação correta neste ciclo não é travar novamente a experiência, mas medir e comparar: exemplos bons, exemplos ruins, transcrições de conversas, taxa de continuidade útil, taxa de fallback, presença de vazamento e reação subjetiva de usuários de teste.

## Decisão operacional

O núcleo conversacional **não fica congelado para DEV**, porque o usuário aprovou explicitamente uma fase de liberação e calibração. No entanto, ele permanece **não autorizado como baseline de produção clínica** até existir validação de aceite com conversas reais, revisão de segurança e decisão de publicação separada.

Em termos práticos, isto encerra a fase de “remendos defensivos” e abre a fase de **calibração experimental controlada**: liberdade útil primeiro, freios finos depois.

## Referências internas

[1]: ../server/ai/chatEngine/llmGenerator.ts "Prompt e wrapper LLM do motor conversacional"  
[2]: ../server/routers.ts "Integração pública do homeChat e perguntas de seguimento"  
[3]: ../server/homeChat.test.ts "Regressões do chat público"  
[4]: ./chat-log-analysis.md "Análise dos logs DEV disponíveis"
