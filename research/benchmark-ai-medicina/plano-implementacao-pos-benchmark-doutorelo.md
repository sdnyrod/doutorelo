# Plano de implementação pós-benchmark para o DOUTORELO

## Sumário executivo

Minha recomendação é **não transformar o DOUTORELO em uma casca em cima de Claude ou ChatGPT**. O caminho mais forte é criar uma arquitetura própria de **AI Care Journey Core**, onde o DOUTORELO controla a jornada clínica, a memória longitudinal, o RAG, os limites de segurança, a avaliação, os logs, o feedback loop, a governança e a experiência mobile. Claude, ChatGPT ou outros modelos devem ser tratados como **motores substituíveis dentro de uma camada de orquestração**, não como o produto em si.

O benchmark mostrou que os líderes globais vencem porque o chat é apenas a interface visível de um ecossistema mais profundo. Ant AQ/Afu mostra distribuição, utilidade diária, registros digitais e serviços conectados. Ping An mostra rede médica, hospitais, farmácias e cuidado longitudinal. JD Health mostra o conceito de **Personal Medical Butler**, que pré-avalia, orienta percurso e prepara atendimento. ChatGPT Health e Claude mostram a importância de privacidade, conectores de dados, avaliação clínica, isolamento de memórias e workflows estruturados.[1] [2] [3] [4]

> **Decisão central:** o DOUTORELO deve ser implementado como um **copiloto governado de jornada de saúde integrativa**, e não como um chatbot genérico. A pergunta correta não é “Claude ou ChatGPT?”, mas “qual camada de orquestração, segurança e avaliação permitirá trocar de modelo sem perder governança clínica?”.

## Resposta direta sobre Claude ou ChatGPT

Eu não recomendo escolher agora um único fornecedor como dependência estrutural. Recomendo uma estratégia em três níveis: usar inicialmente a infraestrutura LLM server-side já disponível no projeto para acelerar, criar uma camada interna de abstração de modelos desde o início, e depois testar Claude, ChatGPT e eventualmente modelos especializados por meio de uma bateria própria de avaliação clínica antes de decidir produção.

| Alternativa | Onde parece mais forte | Risco se virar dependência central | Recomendação para o DOUTORELO |
|---|---:|---:|---|
| **ChatGPT / OpenAI API** | Experiência conversacional, fluidez, multimodalidade, expectativa do consumidor, ecossistema de saúde pessoal | O produto pode parecer genérico se não houver jornada própria, RAG próprio e governança própria | Usar como candidato forte para conversas com paciente, explicação de exames, linguagem acolhedora e síntese educativa, desde que passe na avaliação interna |
| **Claude / Anthropic API** | Raciocínio cuidadoso, análise documental, workflows clínico-administrativos, conectores e tarefas estruturadas | Pode ser menos “produto de consumidor” se usado sem camada de UX própria; também não resolve sozinho governança clínica | Usar como candidato forte para análise de documentos, revisão de evidências, sumários clínicos, segunda leitura e tarefas internas de segurança |
| **Infraestrutura LLM já disponível no projeto** | Velocidade de implementação, menor fricção operacional, integração server-side existente, sem pedir chaves agora | Pode limitar comparação fina entre modelos se não houver camada de avaliação e adapters | Usar como motor inicial para construir o núcleo, desde que a arquitetura já nasça preparada para trocar modelos |
| **Estratégia multi-modelo** | Robustez, comparação, fallback, avaliação cruzada em casos sensíveis | Custo, latência, complexidade e falsa sensação de segurança se não houver métricas clínicas | Implementar como arquitetura, mas ativar progressivamente: um modelo primário, um avaliador de segurança e fallback humano |

A estratégia mais madura é **provider-agnostic by design**. O DOUTORELO deve ter uma interface interna como `invokeClinicalModel()`, com adapters para o provedor atual, OpenAI, Anthropic e futuros modelos. O produto não deve chamar “ChatGPT” ou “Claude” diretamente no fluxo de negócio. Ele deve chamar um **orquestrador clínico** que decide qual modelo usar, com qual prompt, qual versão, qual política de segurança, qual base RAG, qual schema de resposta e qual fallback.

## O que deve ser implementado primeiro

A primeira implementação pós-benchmark deve transformar a Fase 3 em uma fase chamada **AI Care Journey Core**. Essa fase não deve tentar resolver toda a medicina integrativa nem todo o marketplace. Ela deve criar o núcleo que tornará todas as próximas camadas confiáveis.

| Prioridade | Módulo | O que implementar | Por que isso alinha com o benchmark |
|---:|---|---|---|
| 1 | **Intake estruturado mobile-first** | Um fluxo conversacional que coleta queixa, duração, intensidade, sinais de alerta, contexto, medicações, objetivos e restrições | JD Health e Ada mostram que triagem séria começa por estrutura, não por pergunta livre |
| 2 | **Motor de segurança clínica** | Classificador de red flags, escopo permitido, incerteza, recusa de diagnóstico/prescrição e regras de encaminhamento | O padrão ocidental é governança, limites e humano no circuito |
| 3 | **Orquestrador LLM com schema estrito** | Camada server-side que chama o modelo, valida JSON, aplica guardrails e nunca expõe resposta bruta sem validação | Evita que o produto dependa do estilo imprevisível de um único modelo |
| 4 | **RAG auditável** | Base de conhecimento versionada, chunks, citações, rastreabilidade, revisão e política de fontes | O diferencial do DOUTORELO será verticalidade e confiança, não generalidade |
| 5 | **Memória longitudinal** | Perfil de saúde, preferências, histórico de triagens, metas, evolução e próximos passos | Ant, Ping An e ChatGPT Health mostram que saúde vencedora é contínua, não sessão isolada |
| 6 | **Sumário para humano** | Resumo estruturado para médico, terapeuta, suporte ou equipe interna, sem inventar diagnóstico | K Health e JD mostram que IA deve preparar o cuidado humano |
| 7 | **Painel de avaliação contínua** | Casos de teste, piores respostas, feedback do usuário, revisão interna, métricas de segurança e qualidade | O produto precisa melhorar todo dia sem perder controle clínico |

## Arquitetura recomendada

A arquitetura deve separar claramente **experiência**, **orquestração**, **modelo**, **conhecimento**, **segurança** e **avaliação**. Essa separação é o que permite usar Claude, ChatGPT ou qualquer outro modelo sem reescrever o produto.

| Camada | Responsabilidade | Exemplo de implementação |
|---|---|---|
| **UX mobile** | Interface de chat, intake, timeline, próximos passos, confiança visível e consentimentos | React mobile-first com estados de risco, incerteza, fallback e explicabilidade |
| **Care Journey Orchestrator** | Decide o próximo passo da jornada: perguntar mais, responder, educar, escalar, gerar sumário, sugerir acompanhamento | Serviço server-side com estados de sessão e regras de transição |
| **Clinical Safety Layer** | Bloqueia diagnóstico/prescrição, detecta urgência, exige incerteza explícita, aplica disclaimers e fallback humano | Regras determinísticas + classificador LLM validado + testes automatizados |
| **Model Gateway** | Abstrai provedores de IA e registra modelo, prompt, versão, latência, custo, resultado e falhas | Adapter para provedor atual agora; adapters para OpenAI/Anthropic depois |
| **RAG Layer** | Recupera evidências do corpus validado, gera citações e evita resposta fora de fonte | `knowledge_documents`, `knowledge_chunks`, embeddings, versões e revisão |
| **Longitudinal Memory** | Guarda histórico estruturado e preferências com consentimento LGPD | Perfil de saúde, metas, eventos, sintomas recorrentes e evolução |
| **Evaluation & Governance** | Mede qualidade, segurança, red flags, alucinação, fallback, satisfação e revisão humana | Suite Vitest + dataset clínico sintético + painel interno |

## Estratégia de modelos em produção

Minha recomendação operacional é começar com **um modelo primário controlado pela infraestrutura já disponível**, mas escrever o código como se amanhã fôssemos trocar para Claude, ChatGPT ou outro provedor. Em seguida, rodar uma avaliação comparativa com casos reais/sintéticos do DOUTORELO, e só então decidir se vale pagar, integrar e promover OpenAI ou Anthropic a provedores de produção.

| Etapa | Estratégia | Critério de sucesso |
|---|---|---|
| **MVP técnico** | Usar o helper LLM server-side já existente, com schema rígido, guardrails e fallback | Fluxo funciona, respostas são estruturadas, segurança não depende do modelo |
| **Avaliação offline** | Rodar os mesmos casos contra provedor atual, OpenAI e Anthropic por adapter | Melhor equilíbrio entre segurança, qualidade, custo e latência |
| **Piloto controlado** | Ativar OpenAI ou Anthropic para uma parcela de fluxos, com logs e revisão | Reduzir falhas sem aumentar risco, custo ou latência excessiva |
| **Multi-modelo seletivo** | Usar segundo modelo apenas para casos de alto risco, baixa confiança ou revisão interna | Mais segurança sem duplicar custo de todas as conversas |

A estratégia multi-modelo não significa chamar todos os modelos em toda mensagem. Isso seria caro, lento e desnecessário. O melhor desenho é usar **roteamento inteligente**: um modelo primário responde, uma camada de segurança verifica, e casos sensíveis são escalados para segundo modelo, regra determinística ou humano.

## Como implementar sem perder velocidade

A implementação deve começar por corrigir a estabilidade técnica existente e depois seguir por entregas incrementais. Há um erro antigo identificado em `server/routers.ts`, portanto qualquer retomada de código deve começar por estabilizar o servidor. Depois disso, o núcleo de IA deve ser implementado em módulos pequenos, testáveis e reversíveis.

| Sprint | Entrega | Resultado esperado |
|---:|---|---|
| **Sprint 0** | Corrigir erro de build em `server/routers.ts`, rodar testes e estabilizar ambiente | Base técnica confiável para retomar desenvolvimento |
| **Sprint 1** | Criar tabelas de sessões, turns de IA, safety events, feedback e model runs | Todo uso de IA passa a ser auditável |
| **Sprint 2** | Criar `clinicalModelGateway` e `careJourneyOrchestrator` server-side | O produto deixa de depender de chamadas soltas de LLM |
| **Sprint 3** | Implementar intake estruturado e resposta clínica segura com JSON Schema | Chat vira triagem governada, não conversa aberta |
| **Sprint 4** | Implementar RAG auditável com fontes versionadas e citações | Respostas passam a ter base verificável |
| **Sprint 5** | Criar memória longitudinal e sumário para humano | DOUTORELO começa a operar como copiloto de cuidado |
| **Sprint 6** | Criar painel interno de avaliação e feedback loop | Qualidade passa a melhorar continuamente |
| **Sprint 7** | Adicionar adapters OpenAI/Anthropic para avaliação comparativa | Decisão sobre Claude/ChatGPT passa a ser baseada em evidência |

## O que não fazer

O maior erro seria integrar ChatGPT ou Claude diretamente no frontend ou no fluxo principal e chamar isso de “IA médica avançada”. Isso criaria um produto dependente de fornecedor, difícil de auditar e vulnerável a respostas inconsistentes. Outro erro seria tentar construir marketplace, telemedicina, wearables e prontuário completo antes de consolidar o núcleo de segurança, memória e avaliação.

| Não fazer | Por que evitar | Alternativa correta |
|---|---|---|
| Chamar OpenAI/Anthropic diretamente do frontend | Exposição de credenciais e perda de governança | Chamadas server-side por gateway próprio |
| Permitir chat livre sem intake | Aumenta risco clínico e reduz qualidade | Chat guiado por estado de jornada |
| Usar modelo como fonte de verdade | LLM pode alucinar ou extrapolar | RAG auditável + regras + avaliação |
| Prometer diagnóstico ou tratamento | Risco ético, regulatório e clínico | Educação, orientação, preparação e encaminhamento |
| Usar multi-modelo em tudo | Custo e latência sem ganho proporcional | Multi-modelo seletivo por risco e confiança |

## Decisão recomendada

A decisão que eu tomaria agora é: **não contratar nem acoplar Claude ou ChatGPT como fundação única neste momento**. Primeiro, implementar o **AI Care Journey Core** com uma camada de modelo abstrata. Em seguida, testar Claude e ChatGPT em uma avaliação própria do DOUTORELO, com os mesmos casos, mesmas rubricas e mesmas métricas. Se um deles vencer claramente em segurança, qualidade, custo e latência, ele vira provedor primário ou secundário. Se não vencer, o DOUTORELO continua livre para usar o melhor provedor disponível.

> **Recomendação final:** construir primeiro a inteligência proprietária do DOUTORELO — jornada, segurança, RAG, memória, avaliação e governança — e só depois escolher o melhor motor LLM. Claude e ChatGPT devem ser integrados como **opções de motor**, não como a alma do produto.

## Referências

[1]: https://www.antgroup.com/en/news-media/press-releases/1771812000000 "Ant Group — AQ, an AI-powered Healthcare App, Surpasses 100 Million Users During Chinese New Year"

[2]: https://openai.com/index/introducing-chatgpt-health/ "OpenAI — Introducing ChatGPT Health"

[3]: https://www.anthropic.com/news/healthcare-life-sciences "Anthropic — Claude for Healthcare and Life Sciences"

[4]: https://jdcorporateblog.com/jd-health-introduces-groundbreaking-llm-powered-suite-for-comprehensive-online-and-in-hospital-healthcare-scenarios/ "JD Corporate Blog — JD Health Introduces Groundbreaking LLM-Powered Suite"
