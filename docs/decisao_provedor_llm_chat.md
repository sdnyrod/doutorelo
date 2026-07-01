# Decisão técnica — provedor LLM principal do chat Saúde Integrativa IA

**Autor:** Manus AI  
**Data:** 04 de maio de 2026  
**Status:** recomendação estratégica para aprovação antes de implementação

## Recomendação executiva

A recomendação é usar **Claude Sonnet 4.6 como motor principal do chat público**. A razão é direta: o produto não precisa apenas de um modelo que obedeça JSON; ele precisa de uma IA que converse bem em português, mantenha contexto longo, use o corpus Dayan sem perder o fio da pergunta, responda de forma humana e útil, e aceite uma arquitetura com supervisão sem ficar defensiva demais.

A documentação da Anthropic descreve o **Claude Sonnet 4.6** como o modelo com a melhor combinação de velocidade e inteligência, com **janela de contexto de 1 milhão de tokens**, latência rápida, multilingual capabilities, vision, preço de **US$ 3 por milhão de tokens de entrada** e **US$ 15 por milhão de tokens de saída**.[^1] A mesma documentação destaca que Claude 4 é forte em raciocínio, tarefas multilíngues, long-context handling, honestidade e respostas engajantes/human-like.[^1]

O **GPT continua sendo excelente**, principalmente para orquestração estruturada. A documentação da OpenAI afirma que Structured Outputs garantem aderência ao JSON Schema fornecido, com type-safety, recusas detectáveis programaticamente e menos necessidade de prompting defensivo.[^2] Porém, a vantagem exclusiva do GPT nessa área diminuiu, porque a Anthropic agora também oferece **Structured Outputs** e **strict tool use** com validação de schema para Claude Opus 4.7, Opus 4.6, Sonnet 4.6, Sonnet 4.5 e Haiku 4.5.[^3]

> **Decisão recomendada:** Claude Sonnet 4.6 deve ser o cérebro conversacional principal. GPT deve permanecer como alternativa técnica ou fallback, especialmente se algum módulo específico exigir JSON Schema extremamente rígido ou integração mais simples com o stack existente.

## Comparação aplicada ao produto

| Critério | Claude Sonnet 4.6 | GPT atual | Decisão prática |
|---|---:|---:|---|
| Conversa humana em português | Muito forte; documentação destaca interações engajantes e human-like.[^1] | Muito forte; modelos atuais também suportam capacidades multilíngues.[^4] | Vantagem leve para Claude pelo estilo conversacional natural e menos “mecânico”. |
| Contexto Dayan e RAG | Contexto de 1M tokens no Sonnet 4.6.[^1] | Modelos atuais são fortes, mas a página consultada destaca família GPT-5.x sem dar a mesma ênfase operacional ao 1M tokens.[^4] | Vantagem clara para Claude no uso intensivo de corpus e continuidade. |
| Saída estruturada e orquestração | Structured outputs e strict tool use disponíveis para Sonnet 4.6.[^3] | Structured Outputs com JSON Schema é recurso maduro e muito forte.[^2] | Empate funcional, com vantagem operacional histórica para GPT em contratos rígidos. |
| Custo-benefício | Sonnet 4.6: US$ 3/MTok input e US$ 15/MTok output.[^1] | Depende do modelo GPT escolhido; gpt-5.5 é flagship e variantes mini/nano otimizam custo/latência.[^4] | Claude Sonnet 4.6 é bom equilíbrio para chat premium sem ir direto para Opus. |
| Supervisão por IA mestre | Adequado para segunda chamada revisora, com schema estruturado e tool use.[^3] | Muito adequado para supervisão estruturada com JSON Schema.[^2] | Qualquer um funciona; manter Claude reduz fricção e divergência de estilo. |
| Risco de respostas fora de contexto | Menor quando o contexto é longo e bem injetado; ainda exige RAG e avaliação. | Também bom, mas a arquitetura atual já falhou por taxonomia/fallback, não por “falta de modelo”. | O modelo ajuda, mas a correção real é arquitetural: taxonomia + RAG + menos fallback. |

## Papel recomendado de cada modelo

O desenho mais coerente é usar **Claude Sonnet 4.6** para a resposta principal ao usuário e também para a supervisão inicial da IA mestre. Isso reduz divergência de tom entre gerador e supervisor, simplifica a implementação e preserva a experiência humana. Em casos críticos, longos, ambíguos ou de auditoria interna, **Claude Opus 4.7** pode ser usado como supervisor premium, porque a Anthropic o posiciona como o modelo mais capaz para tarefas complexas, embora com custo e latência maiores.[^1]

O GPT deve ficar como **fallback técnico**, não como primeira escolha do chat. Ele faz sentido quando houver indisponibilidade do Claude, quando a integração da plataforma exigir um formato OpenAI-compatible mais direto, ou quando um módulo isolado precisar de schema rígido com altíssima previsibilidade. A documentação da OpenAI sustenta esse ponto ao enfatizar que Structured Outputs garantem aderência ao JSON Schema e facilitam integração type-safe.[^2]

## Arquitetura confirmada com contexto Dayan e IA mestre

A arquitetura recomendada não é reconstruir o chat. O caminho correto é corrigir o motor existente e trocar o centro de gravidade: a IA deve responder livremente nos casos verdes, enquanto o sistema aplica segurança apenas quando houver risco real.

| Camada | Responsabilidade | Observação de implementação |
|---|---|---|
| Entrada do usuário | Receber pergunta pública, histórico recente e metadados mínimos. | Sem redirecionar para login; manter `homeChat.send` público. |
| Classificação leve | Identificar se é conversa social, dúvida geral, sintoma, urgência, prescrição/dose ou diagnóstico fechado. | Corrigir a taxonomia atual: separar nutrição geral de sintomas digestivos. |
| RAG Dayan | Buscar trechos relevantes do corpus Dayan e injetar como contexto. | Todas as respostas úteis devem receber contexto Dayan quando houver material aplicável. |
| IA principal | Gerar resposta humana, útil, contextual, em português, sem começar com “ENTENDI” e sem disclaimer excessivo. | Modelo recomendado: Claude Sonnet 4.6. |
| IA mestre supervisora | Revisar alinhamento ao contexto, utilidade, tom, segurança e ausência de prescrição indevida. | Não deve bloquear por perfeccionismo; deve corrigir apenas risco real, desalinhamento grave ou resposta inútil. |
| Resposta final | Entregar mensagem ao usuário com tom cordial e prático. | Evitar fallback genérico; fallback só para erro real, urgência ou limite clínico. |

A supervisão da IA mestre deve atuar como **editor clínico e conversacional**, não como freio permanente. O problema atual não é falta de barreira; é excesso de barreira e fallback temático mal calibrado. A pergunta sobre unha, cabelo e suplementos foi desviada para refluxo porque a taxonomia tratou `alimentacao` como se fosse sempre desconforto digestivo. Isso precisa ser corrigido pontualmente, sem reconstrução.

## Estratégia de implementação após aprovação

A implementação deve ser incremental. Primeiro, configurar a chave do provedor escolhido com variável segura. Depois, introduzir um `modelGateway` simples para permitir `primaryProvider = claude` e `fallbackProvider = gpt`, sem espalhar lógica de fornecedor pelo motor. Em seguida, ajustar a taxonomia do classificador, reduzir fallbacks, tornar o validador permissivo por padrão e adicionar testes comportamentais com perguntas reais.

A estratégia de fallback entre provedores deve funcionar assim: Claude Sonnet 4.6 responde primeiro; se houver erro de API, timeout ou resposta inválida, o sistema tenta GPT com o mesmo contrato de resposta; se ambos falharem, só então entra fallback determinístico curto e honesto. O fallback não deve inventar assunto, não deve assumir refluxo para qualquer tema de alimentação e não deve substituir a IA quando a pergunta é segura.

## Decisão final proposta

A decisão técnica recomendada é:

| Papel | Modelo recomendado | Justificativa |
|---|---|---|
| Motor principal do chat | **Claude Sonnet 4.6** | Melhor equilíbrio entre contexto longo, naturalidade, português, velocidade, custo e interação human-like. |
| Supervisor IA mestre inicial | **Claude Sonnet 4.6** | Mantém consistência de tom e reduz custo operacional. |
| Supervisor premium opcional | **Claude Opus 4.7** | Usar apenas em auditoria, casos complexos ou revisão de alta exigência. |
| Fallback técnico | **GPT atual via API disponível** | Excelente para schema rígido, tool/function calling e redundância operacional. |

Minha recomendação honesta é não escolher GPT como motor principal deste produto agora. GPT é tecnicamente muito forte, mas o coração do Saúde Integrativa IA é **experiência conversacional com contexto longo e identidade editorial Dayan**. Para isso, **Claude Sonnet 4.6 é a escolha mais coerente**. A implementação correta, porém, não será apenas “trocar modelo”: será liberar a IA para responder, reduzir o bloqueio defensivo, corrigir a taxonomia e fazer toda resposta passar por contexto Dayan e supervisão mestre permissiva, objetiva e segura.

## Referências

[^1]: [Anthropic — Models overview / Claude API Docs](https://platform.claude.com/docs/en/about-claude/models/overview)
[^2]: [OpenAI — Structured model outputs / OpenAI API](https://developers.openai.com/api/docs/guides/structured-outputs)
[^3]: [Anthropic — Structured outputs / Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
[^4]: [OpenAI — Models / OpenAI API](https://developers.openai.com/api/docs/models)
