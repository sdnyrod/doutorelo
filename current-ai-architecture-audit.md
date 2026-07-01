# Auditoria técnica atual da IA do DOUTORELO

Esta auditoria registra o estado atual observado no código do projeto DEV antes de qualquer nova implementação. O objetivo é separar fatos técnicos de ambições estratégicas, evitando novas correções superficiais em prompt ou interface.

## Integração de IA existente

A camada central de LLM está em `server/_core/llm.ts`. A função `invokeLLM` constrói payloads no formato de chat completions e envia requisições server-side para `BUILT_IN_FORGE_API_URL/v1/chat/completions` quando a variável está configurada, ou para `https://forge.manus.im/v1/chat/completions` como fallback. A autenticação usa `BUILT_IN_FORGE_API_KEY`, lida a partir de `server/_core/env.ts`. O código atual define explicitamente `model: "gemini-2.5-flash"` no payload, com `max_tokens` alto e orçamento de thinking pequeno.

Isso significa que os prompts do app não estão sendo enviados por uma chave fornecida manualmente pelo usuário, nem por uma ferramenta MCP do usuário. Eles passam pelo backend do projeto, usando a integração Forge/Manus provisionada no ambiente. A camada central suporta texto, imagem por URL e arquivo por URL, mas o app público atual ainda não implementa uma orquestra multimodal completa para exames, fotos, vídeos e documentos.

## Onde a IA é usada hoje

A busca por `invokeLLM` encontrou chamadas em módulos especializados como `server/ai/clinicalSafety.ts`, `server/ai/clarityJourney.ts`, `server/ai/marketplaceRecommendations.ts`, `server/ai/integrativeClinicalDNA.ts`, `server/ai/intentEngine.ts` e `server/ai/dayanKnowledge.ts`. Em termos arquiteturais, o padrão predominante é: classificação determinística ou geração determinística inicial, enriquecimento opcional por uma única chamada LLM com JSON Schema, validação posterior, filtros de segurança e fallback determinístico em caso de falha.

Esse padrão é melhor que um prompt solto, mas ainda não representa uma arquitetura de missão crítica com maestro central e múltiplas IAs especializadas. Hoje há componentes separados, mas eles não estão plenamente orquestrados como uma sinfonia clínica com papéis, evidência, auditoria, segunda opinião e escalonamento humano formal.

## Chat público da Home

A rota pública `homeChat.send` em `server/routers.ts` chama `buildClinicalSafetyAssessment` de forma determinística para a mensagem atual e depois chama `buildDoutoreloHomeChatAssistantMessage` em `server/personality.ts`. Portanto, a resposta pública visível da Home, no fluxo auditado, não é uma conversa clínica gerada livremente por LLM a cada mensagem. Ela é majoritariamente construída por regras, bancos de aberturas e lógica determinística de personalidade/safety.

A falha observada pelo usuário, como a abertura “Boa.” após uma queixa de dor de cabeça, é coerente com esse desenho: a função de personalidade seleciona aberturas humanas de acompanhamento sem compreender adequadamente que uma queixa clínica não deve ser iniciada com linguagem que soe como aprovação do sintoma. Isso é uma falha de governança conversacional e não apenas uma frase ruim.

## Lacunas críticas

A arquitetura atual possui guardrails e testes, mas ainda carece de uma camada de missão crítica completa. As principais lacunas são: ausência de maestro clínico central; ausência de agentes especializados formalmente versionados por modalidade; ausência de política robusta de interpretação de exames, imagens, vídeos e documentos; ausência de avaliação adversarial ampla; ausência de revisão humana estruturada para cenários de risco; ausência de rastreabilidade integral de cada resposta final; e ausência de critérios claros para diferenciar protótipo DEV, piloto supervisionado e operação em escala.

## Conclusão técnica

O estado atual deve ser tratado como protótipo controlado, não como infraestrutura pronta para milhares de consultas. A base contém elementos úteis, como safety determinístico, LLM estruturado por schema, fallback e corpus Dayan, mas o produto precisa ser redesenhado como ecossistema orquestrado de IAs clínicas antes de exposição ampla. A próxima etapa correta é definir a visão e a arquitetura-alvo, não remendar prompts isolados.
