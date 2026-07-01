# DOUTORELO — Arquitetura Fundadora do Machine Learning Vivo, Orquestra de IAs e Feedback Loop 24/7

**Autoria:** SIDNEY (PMO SENIUM.AI)  
**Projeto:** `saude-integrativa-ia-dev`  
**Status:** Documento fundador para reconstrução estratégica e técnica do cérebro do DOUTORELO  
**Data:** 03 de maio de 2026  
**Escopo:** Fundação interna de Machine Learning operacional, orquestra de agentes, corpus Dayan, feedback loop contínuo, tabelas, fases de implementação e critérios de passagem.

> **Decisão central:** o DOUTORELO precisa deixar de ser um chat que responde por remendos e passar a ser um **sistema vivo de inteligência clínica-assistiva**, em que cada conversa alimenta observabilidade, avaliação, datasets, recuperação de conhecimento, melhoria de prompts, roteamento de agentes, memória segura, revisão humana e evolução controlada. Por fora, o usuário deve sentir simplicidade, acolhimento e utilidade. Por dentro, o sistema deve operar como uma fábrica de inteligência em ciclo fechado.

## 1. Diagnóstico honesto: por que o sistema ainda não funciona a contento

O problema atual não é apenas uma frase ruim, uma saudação mal interpretada ou uma resposta fraca diante de cefaleia. Esses sintomas revelam uma falha estrutural: o sistema ainda se comporta como um **chatbot com lógica reativa**, não como um ecossistema de inteligência aprendente. Quando uma sugestão humana de resposta a cumprimento vira comportamento padrão em contexto clínico, isso indica que o produto está confundindo exemplo com regra, sugestão com política e frase com arquitetura.

O DOUTORELO já possui ativos relevantes: autenticação, banco de dados, registros de saúde, consentimentos, memória clínica inicial, integração server-side com LLM, documentos estratégicos, camada de segurança, proposta de orquestra de agentes e análise pública de 250 vídeos do ecossistema Dayan. Porém, esses ativos ainda não formam um **motor de aprendizado operacional**. Eles existem como peças separadas, não como um ciclo que captura, avalia, aprende, versiona, testa e melhora.

| Sintoma observado | Causa estrutural provável | Correção arquitetural necessária |
|---|---|---|
| Respostas cristalizadas por exemplo de cumprimento | Ausência de separação entre exemplos, políticas, prompts e dados de treinamento | Criar registry versionado de prompts, políticas e exemplos, com testes de regressão por intenção |
| Regras por sintoma, como “se for cefaleia, faça isso” | Confusão entre remendo determinístico e inteligência clínica-assistiva | Substituir hardcodes por classificação de intenção, risco, contexto, lacunas e agentes necessários |
| Corpus Dayan decodificado mas pouco útil | Falta de pipeline de ingestão, chunking, metadados, embeddings, claims, rubricas e recuperação rastreável | Transformar vídeos em base de conhecimento viva, consultável, versionada e avaliada |
| Chat não melhora sozinho | Ausência de feedback explícito, avaliação automática e dataset de melhoria | Registrar cada interação, avaliar qualidade, colher feedback, gerar itens de dataset e rodar ciclos diários |
| Sistema parece inferior a chatbot simples | Complexidade interna não está convertida em experiência externa fluida | Construir maestro, compositor de resposta, memória, RAG e feedback loop sem expor bastidores ao usuário |
| Avanço bloqueado para próxima fase | Falta de fundação de MLOps, critérios de passagem e operação 24/7 | Implantar fases com tabelas, métricas, jobs, dashboards, revisão e rollback |

A reconstrução correta começa por uma mudança de mentalidade. O objetivo não é “fazer o LLM responder melhor hoje”. O objetivo é criar uma estrutura em que o sistema **aprenda com cada conversa, cada erro, cada avaliação, cada busca no corpus Dayan, cada feedback do usuário e cada revisão humana**, sem depender de um programador abrir o código toda vez que o comportamento precisa evoluir.

## 2. Princípio de produto: maravilhoso por fora, complexo e vivo por dentro

A experiência externa deve ser deliberadamente simples. O usuário não deve perceber que existe maestro, classificação de risco, recuperação de conhecimento, agentes, avaliador, dataset, versionamento, métricas e auditoria. Ele deve perceber que está diante de uma presença inteligente, acolhedora, prudente e útil. O sistema precisa ser capaz de conversar como um produto de massa, mas operar internamente como uma plataforma clínica-assistiva de missão crítica.

| Dimensão | Por fora, para o usuário | Por dentro, para o sistema |
|---|---|---|
| Conversa | Natural, curta quando deve ser curta, profunda quando deve aprofundar | Classificação de intenção, risco, contexto, agentes, memória e validação |
| Aprendizado | O usuário sente que o produto melhora com o tempo | Feedback, avaliação automática, datasets, métricas, ciclos de melhoria e testes |
| Corpus Dayan | Respostas com DNA integrativo, linguagem prática e raciocínio de hábitos | RAG curado, embeddings, claims, tags, licença, filtros e rastreabilidade |
| Segurança | Orientação prudente sem parecer burocrática | Red flags, bloqueio de prescrição, diagnóstico fechado, guardrails e revisão |
| Evolução diária | O chat parece mais inteligente a cada semana | Jobs 24/7, análise de falhas, active learning, A/B tests e atualização de configuração |
| Escala | Milhões de pessoas usando sem fricção | Observabilidade, filas, cache, versionamento, rollback, métricas e governança |

> **Regra de ouro de experiência:** o usuário nunca deve sentir a complexidade interna. A complexidade deve aparecer apenas como qualidade, continuidade, precisão, acolhimento e segurança.

## 3. O que significa “Machine Learning verdadeiro” neste projeto

Neste contexto, **Machine Learning verdadeiro** não começa com a promessa ingênua de treinar um modelo proprietário amanhã. Ele começa com a construção de uma infraestrutura em que dados reais, feedback, avaliações e conhecimento curado possam virar melhoria mensurável. Um sistema sem dataset confiável, sem labels, sem avaliação, sem versionamento e sem observabilidade não faz ML; ele apenas chama um LLM.

A fundação correta tem cinco camadas. Primeiro, uma camada de **captura estruturada**, que registra interações, intenções, decisões, respostas, agentes acionados e feedback. Segundo, uma camada de **conhecimento recuperável**, que transforma os 250 vídeos do Dayan e outras fontes em chunks, tags, embeddings e claims rastreáveis. Terceiro, uma camada de **avaliação**, que mede segurança, utilidade, especificidade, continuidade, humanização, aderência ao DNA integrativo e respeito aos limites clínicos. Quarto, uma camada de **dataset vivo**, que converte conversas e avaliações em exemplos anonimizados para testes, ranking, prompts e futuros modelos. Quinto, uma camada de **operação de melhoria**, que roda diariamente, propõe ajustes, testa, publica em DEV ou piloto e monitora regressões.

| Camada de ML | Função | Técnica inicial | Evolução posterior |
|---|---|---|---|
| Captura estruturada | Transformar conversas em eventos analisáveis | Logs de interação, agente, risco, resposta e feedback | Feature store clínica-assistiva, métricas por coorte e causalidade operacional |
| Recuperação de conhecimento | Usar o corpus Dayan e bases curadas sem alucinar | RAG com chunking, embeddings, tags e filtros | Learning-to-rank com feedback real e revisão humana |
| Avaliação automática | Medir qualidade e segurança de cada resposta | LLM-as-judge com rubrica estruturada e guardrails determinísticos | Modelo avaliador treinado em labels humanos e benchmarks internos |
| Dataset vivo | Criar exemplos para regressão, treinamento e melhoria | Itens anonimizados, labels, splits, golden sets e casos adversariais | Fine-tuning, reward models e classificadores próprios após volume e curadoria |
| Otimização contínua | Melhorar sem remendar código por sintoma | Prompt registry, policy registry, A/B testing e canary | Bandits, roteamento adaptativo, ranking personalizado e modelos especializados |

É importante separar **aprendizado operacional** de **autonomia irresponsável**. O DOUTORELO pode aprender 24/7 no sentido de observar, avaliar, gerar hipóteses de melhoria, enriquecer datasets, atualizar rankings, testar prompts em DEV e propor mudanças. Em saúde, porém, mudanças que alteram comportamento clínico, risco, prescrição, diagnóstico ou recomendação individual precisam de trilha de aprovação, teste e rollback, em alinhamento com princípios internacionais de governança de IA em saúde, gestão de risco de IA, boas práticas de Machine Learning em software médico e proteção de dados pessoais sensíveis.[1] [2] [3] [4] [5] [6] Isso não diminui a ambição; isso torna a ambição viável para milhões de pessoas.

## 4. Arquitetura-alvo: o cérebro vivo do DOUTORELO

A arquitetura-alvo deve ser entendida como um organismo em ciclo fechado. A entrada do usuário não vai diretamente para uma resposta. Ela passa por recepção, normalização, classificação, memória, consentimento, risco, maestro, agentes, recuperação de conhecimento, composição, guardrail, avaliação, registro, feedback e aprendizado.

| Etapa | Pergunta operacional | Saída estruturada |
|---|---|---|
| Recepção | O que chegou, em qual canal, com quais anexos e consentimentos? | `incomingEvent`, `channel`, `modality`, `consentSnapshot`, `attachments` |
| Normalização | A mensagem está limpa, curta, contextualizada e segura para processamento? | `normalizedInput`, `language`, `redactedSensitiveFragments`, `inputQuality` |
| Classificação | É cumprimento, sintoma, exame, medicamento, urgência, estilo de vida ou dúvida aberta? | `intent`, `subIntent`, `confidence`, `ambiguity` |
| Risco | Há red flag, prescrição, diagnóstico fechado, autoagressão ou urgência? | `riskLevel`, `redFlags`, `blockedRequests`, `requiredSafetyAction` |
| Memória | O histórico autorizado do usuário muda a interpretação? | `relevantMemory`, `longitudinalSignals`, `missingContext` |
| Maestro | Quais agentes devem ser acionados e em que ordem? | `orchestrationPlan`, `agentsToRun`, `agentInputs`, `qualityTargets` |
| Agentes | O que cada competência especializada conclui? | Saídas JSON por agente, nunca resposta final solta |
| RAG Dayan/base curada | Que conhecimento autorizado ajuda sem extrapolar? | `retrievedChunks`, `claims`, `sourceIds`, `retrievalConfidence` |
| Composição | Como transformar achados em resposta humana e útil? | `draftAnswer`, `nextQuestions`, `safetyNotes`, `toneProfile` |
| Guardrail final | A resposta pode ser exibida com segurança? | `allow`, `rewrite`, `block`, `escalate`, `violations` |
| Avaliação | A resposta foi boa, específica, segura e coerente? | `qualityScores`, `failureModes`, `datasetCandidate` |
| Feedback | O usuário sinalizou utilidade, erro, continuidade ou frustração? | `feedbackEvent`, `sentiment`, `resolved`, `followUpNeed` |
| Aprendizado | O que deve mudar amanhã? | `learningTask`, `promptCandidate`, `datasetItem`, `rankingSignal`, `reviewQueue` |

Essa cadeia deve gerar um objeto interno de decisão que nunca é exibido cru ao usuário. A resposta final é apenas a última manifestação de uma operação muito mais profunda.

## 5. Orquestra de IAs: agentes, contratos e limites

A orquestra não deve ser uma coleção decorativa de agentes. Cada agente precisa ter responsabilidade definida, entrada permitida, saída estruturada, critérios de acionamento, métricas e limites. Nenhum agente especializado deve falar diretamente com o usuário. O maestro coordena, o compositor escreve, o guardrail autoriza e a avaliação aprende.

| Agente | Responsabilidade | Entrada | Saída obrigatória | Métrica principal |
|---|---|---|---|---|
| Maestro de Orquestração | Decidir fluxo, agentes, profundidade, risco e próxima ação | Mensagem, histórico, consentimento, risco preliminar e memória | `orchestrationPlan`, `agents`, `priority`, `reasoningTraceSafe` | Taxa de roteamento correto por intenção e risco |
| Agente de Intenção | Classificar o que o usuário realmente quer | Texto normalizado e contexto curto | `intent`, `subIntent`, `ambiguity`, `confidence` | Acurácia contra dataset rotulado |
| Agente de Segurança Clínica | Detectar red flags, urgência e escopo proibido | Mensagem, anexos resumidos e histórico autorizado | `riskLevel`, `redFlags`, `safetyAction`, `blockedContent` | Zero tolerância para red flags perdidas |
| Agente de Anamnese Dirigida | Formular perguntas progressivas e úteis | Sintoma, duração, intensidade, contexto e lacunas | `questions`, `rationale`, `priority`, `stopConditions` | Utilidade clínica e baixa fricção |
| Agente Integrativo | Conectar hábitos, sono, alimentação, intestino, estresse e rotina | Queixa, perfil, memória e corpus autorizado | `integrativeFrame`, `habitAxes`, `education`, `uncertainty` | Aderência ao DNA integrativo sem prescrição |
| Agente Dayan/RAG | Recuperar temas, chunks e padrões do corpus Dayan | Query semântica e filtros de segurança | `sourceChunks`, `themes`, `styleSignals`, `claimsAllowed` | Precisão de recuperação e utilidade percebida |
| Agente de Evidência e Claims | Verificar se afirmações biomédicas são prudentes | Rascunho, claims, fontes e contexto | `claimRisk`, `needsSource`, `rewriteSuggestions` | Redução de alucinação factual |
| Agente de Memória Longitudinal | Trazer contexto do usuário sem invadir privacidade | Perfil, eventos clínicos, consentimentos e conversa atual | `relevantMemory`, `patterns`, `missingData`, `doNotUse` | Relevância sem excesso de dados |
| Agente de Personalização de Tom | Ajustar linguagem, tamanho e calor humano | Intenção, estado emocional, canal e perfil | `toneProfile`, `phrasingGuidance`, `avoidList` | Satisfação e continuidade conversacional |
| Agente de Documentos | Processar exames, laudos e PDFs nas fases futuras | Arquivo, OCR, metadados e consentimento | `extractedEntities`, `uncertainties`, `summary`, `flags` | Taxa de extração correta e bloqueio de ilegíveis |
| Agente de Imagem/Vídeo | Analisar mídia com limites explícitos nas fases futuras | Imagem/vídeo, qualidade e contexto | `observations`, `quality`, `riskFlags`, `limits` | Segurança visual e baixa extrapolação |
| Agente de Composição | Escrever a resposta final candidata | Saídas dos agentes, tom e limites | `draftAnswer`, `nextStep`, `questions`, `disclaimerMode` | Clareza, especificidade e concisão |
| Agente de Guardrail Final | Bloquear, reescrever ou escalar | Resposta candidata e metadados | `decision`, `violations`, `safeAnswer`, `escalation` | Zero exposição de resposta crítica insegura |
| Agente Avaliador | Julgar resposta após geração | Entrada, resposta, plano e feedback | `scores`, `failureModes`, `datasetCandidate`, `improvementHint` | Correlação com avaliação humana |
| Agente Curador de Dataset | Transformar casos úteis em exemplos de treino/teste | Interação, avaliação e anonimização | `datasetItem`, `labels`, `splitSuggestion`, `reviewNeed` | Qualidade dos exemplos aceitos |

O uso de múltiplos agentes não deve aumentar lentidão desnecessária. O sistema precisa ter rotas rápidas e rotas profundas. Um cumprimento simples usa sociabilidade e talvez avaliação leve. Um sintoma persistente usa segurança, intenção, anamnese, integrativo, Dayan/RAG se útil, composição e guardrail. Um caso vermelho interrompe tudo e prioriza segurança. Um exame ou imagem só entra quando a fase multimodal estiver governada.

## 6. O papel real dos 250 vídeos do Dayan

Os 250 vídeos decodificados não devem ficar como uma pasta morta, nem virar uma cópia ingênua do conteúdo na resposta. Eles devem se tornar uma **base viva de conhecimento editorial, pedagógico e integrativo**, com metadados, fragmentos, temas, embeddings, claims, riscos e exemplos de linguagem. O objetivo não é fazer a IA “imitar” o Dr. Dayan, mas incorporar um método: linguagem popular, investigação de hábitos, raciocínio preventivo, associação entre sintomas e rotina, prudência com suplementos, atenção a sinais de alerta e foco em clareza prática.

| Camada do corpus Dayan | O que deve ser extraído | Como o sistema usa |
|---|---|---|
| Metadados | Título, data, URL, tema, duração, tags, origem, autorização/licença | Filtro, auditoria, priorização e rastreabilidade |
| Transcrição | Texto bruto segmentado por tempo | Base inicial para chunking e análise semântica |
| Chunks semânticos | Trechos curtos por ideia, tema e contexto | Recuperação RAG por pergunta do usuário |
| Temas integrativos | Sono, intestino, fígado, inflamação, metabolismo, suplementos, prevenção | Raciocínio educativo e seleção de perguntas |
| Claims | Afirmações que parecem biomédicas, comerciais ou controversas | Verificação, cautela, revisão e restrição de uso |
| Padrões pedagógicos | Metáforas, estruturas de explicação, perguntas típicas, linguagem popular | Guia de tom e composição, sem copiar trechos longos |
| Riscos | Promessas, doses, tratamentos, frases fortes, temas sensíveis | Guardrails específicos e testes adversariais |
| Exemplos derivados | Perguntas-respostas reescritas, seguras e revisadas | Golden tests, few-shot examples e futuros fine-tunings |

Para que esse corpus finalmente seja útil, cada vídeo precisa passar por um pipeline. Primeiro, normalização da transcrição. Segundo, segmentação em chunks. Terceiro, classificação temática. Quarto, extração de claims e riscos. Quinto, geração de embeddings. Sexto, revisão ou pontuação automática. Sétimo, indexação para busca. Oitavo, registro de uso: sempre que um chunk influenciar resposta, o sistema grava quais fontes foram recuperadas, se ajudaram e se o usuário avaliou positivamente.

> **Ponto decisivo:** os vídeos não são “treinamento” enquanto estão apenas decodificados. Eles viram treinamento operacional quando entram em tabelas, embeddings, avaliações, exemplos, testes, recuperação, feedback e ciclos de melhoria.

## 7. Tabelas existentes que devem ser preservadas e aproveitadas

O schema atual já tem uma base importante. Ele não precisa ser jogado fora. Ele precisa ser conectado ao novo cérebro de IA. As tabelas existentes de perfil, conversa, memória, documentos, consentimentos, métricas e plano longitudinal devem virar contexto controlado para o maestro e insumo para personalização segura.

| Tabela existente | Papel atual | Como será usada pela arquitetura viva |
|---|---|---|
| `users` | Identidade, autenticação e papel do usuário | Vincular sessões, permissões, feedback e histórico autorizado |
| `patientHealthProfiles` | Perfil de saúde e contexto inicial | Personalização, lacunas de anamnese e memória longitudinal |
| `healthConversations` | Conversas de saúde e resumo | Conectar interações de IA a jornadas, estados e continuidade |
| `clinicalMemoryEvents` | Eventos clínicos, hábitos, sintomas, exames e notas | Fornecer memória relevante ao agente longitudinal |
| `clarityMaps` | Mapa de clareza e resumo assistivo | Gerar sínteses para consulta e avaliar utilidade da conversa |
| `healthDocuments` | Documentos e exames | Base futura para agentes documentais e multimodais |
| `healthConsents` | Consentimentos por finalidade | Gate obrigatório para uso de dados, anexos, IA e melhoria de modelo |
| `healthDataConnections` | Conexões com fontes de dados de saúde | Sinais objetivos futuros para personalização e acompanhamento |
| `healthMetricSamples` | Amostras de métricas de saúde | Contexto longitudinal e possíveis features seguras |
| `longitudinalCarePlanItems` | Itens de plano e acompanhamento | Fechar loop entre conversa, plano, adesão e feedback |
| `careAppointments` | Consultas e próximos passos | Preparação de consulta e avaliação de continuidade |

A nova arquitetura deve evitar duplicar dados clínicos sensíveis sem necessidade. As novas tabelas de IA devem guardar referência, resumo seguro, hashes, labels, avaliações e metadados, em vez de copiar indefinidamente todo conteúdo bruto quando isso não for necessário.

## 8. Novas tabelas essenciais para o Machine Learning vivo

A fundação viva exige um conjunto de tabelas específicas. Elas não são luxo. Elas são a diferença entre um chatbot e uma plataforma que aprende. A seguir está o modelo conceitual recomendado. Os tipos exatos podem ser ajustados ao MySQL/Drizzle, mas os campos e relações devem ser preservados como contrato de produto.

### 8.1. Núcleo de sessões, mensagens e interações de IA

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `aiSessions` | Agrupar uma jornada conversacional de IA por usuário, canal e objetivo | `id`, `userId`, `healthConversationId`, `channel`, `entryPoint`, `status`, `startedAt`, `endedAt`, `consentSnapshot`, `metadata` |
| `aiMessages` | Registrar mensagens do usuário, assistente e sistema com referência à sessão | `id`, `sessionId`, `userId`, `role`, `contentRedacted`, `contentHash`, `modality`, `tokenEstimate`, `createdAt`, `metadata` |
| `aiInteractions` | Representar uma rodada completa: entrada, plano, resposta, avaliação e status | `id`, `sessionId`, `userId`, `inputMessageId`, `outputMessageId`, `intent`, `riskLevel`, `status`, `latencyMs`, `promptVersion`, `modelVersion`, `policyVersion`, `createdAt` |
| `aiOrchestrationPlans` | Guardar a decisão do maestro antes dos agentes | `id`, `interactionId`, `intent`, `subIntent`, `riskLevel`, `agentsPlanned`, `routingRationale`, `depth`, `expectedOutputSchema`, `createdAt` |
| `aiConversationSummaries` | Manter resumos evolutivos para contexto sem carregar todo histórico | `id`, `sessionId`, `summaryType`, `summaryText`, `clinicalBoundaries`, `memoryCandidate`, `version`, `createdAt` |

Essas tabelas criam o trilho mínimo de rastreabilidade. Sem elas, o sistema não sabe o que respondeu, por que respondeu, qual agente foi usado, qual versão estava ativa e se a resposta foi boa ou ruim.

### 8.2. Registry de agentes, prompts, modelos e políticas

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `aiAgentRegistry` | Versionar cada agente e seu contrato | `id`, `agentKey`, `name`, `version`, `status`, `inputSchema`, `outputSchema`, `owner`, `riskClass`, `createdAt`, `retiredAt` |
| `aiPromptRegistry` | Armazenar prompts editáveis e versionados fora do código | `id`, `promptKey`, `version`, `status`, `promptText`, `systemInstructions`, `fewShotRefs`, `changelog`, `approvedBy`, `createdAt` |
| `aiModelRegistry` | Registrar modelos utilizados, parâmetros e finalidade | `id`, `modelKey`, `provider`, `modelName`, `version`, `temperature`, `maxTokens`, `useCase`, `status`, `createdAt` |
| `aiPolicyRegistry` | Versionar políticas de segurança, tom, escopo e compliance | `id`, `policyKey`, `version`, `policyText`, `blockedPatterns`, `requiredDisclaimers`, `riskRules`, `status`, `approvedBy`, `createdAt` |
| `aiLiveConfig` | Permitir configuração dinâmica sem deploy | `id`, `configKey`, `valueJson`, `environment`, `status`, `startsAt`, `endsAt`, `createdBy`, `createdAt` |
| `aiConfigSnapshots` | Congelar a configuração usada em cada release/ciclo | `id`, `snapshotKey`, `promptVersions`, `policyVersions`, `modelVersions`, `agentVersions`, `createdAt`, `notes` |

Essa camada é o que permite melhorar sem codar cada comportamento. O código passa a executar contratos e buscar versões ativas no banco. A evolução cotidiana acontece por configuração, prompt, política, corpus, ranking e avaliação, com rollback.

### 8.3. Execução de agentes, guardrails e risco clínico

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `aiAgentRuns` | Registrar cada execução de agente | `id`, `interactionId`, `agentRegistryId`, `agentKey`, `agentVersion`, `inputSummary`, `outputJson`, `confidence`, `latencyMs`, `status`, `errorCode`, `createdAt` |
| `aiGuardrailResults` | Registrar validação final e intermediária | `id`, `interactionId`, `stage`, `decision`, `violationsJson`, `rewrittenAnswer`, `blockedReason`, `policyVersion`, `createdAt` |
| `clinicalRiskEvents` | Registrar red flags, bloqueios e urgências | `id`, `interactionId`, `userId`, `riskType`, `severity`, `detectedBy`, `evidence`, `actionTaken`, `createdAt` |
| `aiFallbackEvents` | Entender quando e por que o sistema caiu em fallback | `id`, `interactionId`, `fallbackType`, `reason`, `fallbackAnswer`, `recoverable`, `createdAt` |
| `aiEscalationEvents` | Registrar escalonamento para humano ou urgência | `id`, `interactionId`, `userId`, `escalationType`, `priority`, `reason`, `status`, `createdAt`, `resolvedAt` |

Essas tabelas impedem que o sistema falhe silenciosamente. Elas permitem investigar por que uma resposta foi bloqueada, por que um caso foi escalado e onde o fluxo precisa melhorar.

### 8.4. Feedback explícito, implícito e avaliação automática

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `aiFeedbackEvents` | Registrar feedback do usuário | `id`, `interactionId`, `userId`, `feedbackType`, `rating`, `comment`, `selectedReason`, `createdAt` |
| `aiImplicitSignals` | Capturar sinais comportamentais não invasivos | `id`, `interactionId`, `signalType`, `value`, `metadata`, `createdAt` |
| `aiResponseEvaluations` | Guardar avaliação automática pós-resposta | `id`, `interactionId`, `evaluatorVersion`, `overallScore`, `safetyScore`, `usefulnessScore`, `specificityScore`, `empathyScore`, `dayanDnaScore`, `failureModes`, `createdAt` |
| `aiQualityRubrics` | Versionar rubricas de avaliação | `id`, `rubricKey`, `version`, `criteriaJson`, `scale`, `criticalFailureRules`, `status`, `createdAt` |
| `aiEvaluatorRuns` | Registrar execuções do avaliador | `id`, `interactionId`, `rubricId`, `modelVersion`, `evaluationJson`, `confidence`, `latencyMs`, `createdAt` |

O sistema deve avaliar suas próprias respostas, mas não deve acreditar cegamente em si mesmo. A avaliação automática é a primeira camada. A calibração com humanos, em amostras periódicas, é o que transforma essa avaliação em métrica confiável.

### 8.5. Dataset vivo, labels, splits e ciclos de melhoria

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `aiDatasetItems` | Transformar interações em exemplos reutilizáveis | `id`, `sourceInteractionId`, `datasetKey`, `inputJson`, `expectedBehavior`, `actualAnswer`, `anonymizationStatus`, `qualityStatus`, `createdAt` |
| `aiDatasetLabels` | Guardar labels humanos ou automáticos | `id`, `datasetItemId`, `labelKey`, `labelValue`, `labelerType`, `labelerId`, `confidence`, `createdAt` |
| `aiDatasetSplits` | Separar treino, validação, teste, golden e adversarial | `id`, `datasetItemId`, `splitKey`, `reason`, `createdAt` |
| `aiTrainingBatches` | Agrupar exemplos para ajuste de prompt, ranking ou modelo | `id`, `batchKey`, `purpose`, `datasetQuery`, `itemCount`, `status`, `createdAt`, `approvedAt` |
| `aiEvaluationRuns` | Rodar avaliação offline antes de publicar mudanças | `id`, `runKey`, `configSnapshotId`, `datasetKey`, `metricsJson`, `criticalFailures`, `status`, `createdAt` |
| `aiEvaluationResults` | Resultado por item avaliado | `id`, `evaluationRunId`, `datasetItemId`, `passed`, `scoresJson`, `failureModes`, `diffJson`, `createdAt` |
| `aiLearningCycles` | Registrar ciclo diário/semanal de melhoria | `id`, `cycleKey`, `windowStart`, `windowEnd`, `findings`, `proposedChanges`, `approvedChanges`, `status`, `createdAt` |

Essas tabelas são a fundação do ML real. Elas permitem responder perguntas que hoje o sistema não consegue responder: quais respostas foram ruins? Quais intenções mais falham? Quais red flags quase escaparam? Quais prompts melhoraram? Qual corpus ajudou? Qual mudança piorou um cenário adversarial?

### 8.6. Corpus Dayan, embeddings, claims e uso em RAG

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `dayanSources` | Registrar cada vídeo, post, artigo ou fonte do ecossistema | `id`, `sourceType`, `title`, `url`, `publishedAt`, `licenseStatus`, `durationSeconds`, `hash`, `createdAt` |
| `dayanTranscripts` | Guardar transcrição normalizada e metadados | `id`, `sourceId`, `language`, `transcriptText`, `qualityScore`, `transcriptionMethod`, `createdAt` |
| `dayanChunks` | Segmentos semânticos recuperáveis | `id`, `sourceId`, `transcriptId`, `chunkText`, `startTime`, `endTime`, `topicTags`, `riskTags`, `createdAt` |
| `dayanEmbeddings` | Guardar referência de embeddings para busca vetorial | `id`, `chunkId`, `embeddingModel`, `embeddingVectorRef`, `embeddingHash`, `createdAt` |
| `dayanClaims` | Extrair afirmações que exigem cautela | `id`, `chunkId`, `claimText`, `claimType`, `evidenceNeed`, `safetyRisk`, `reviewStatus`, `createdAt` |
| `dayanStylePatterns` | Mapear padrões pedagógicos seguros | `id`, `sourceId`, `patternType`, `description`, `exampleRedacted`, `allowedUse`, `createdAt` |
| `dayanRetrievalEvents` | Registrar uso do corpus em respostas | `id`, `interactionId`, `queryText`, `chunksReturned`, `chunksUsed`, `retrievalScore`, `userFeedbackImpact`, `createdAt` |
| `dayanCurationReviews` | Revisão humana ou editorial do corpus | `id`, `sourceId`, `chunkId`, `reviewerId`, `decision`, `notes`, `createdAt` |

A busca vetorial pode usar armazenamento externo ou índice especializado, mas o banco precisa guardar referências, hashes, metadados, modelo de embedding e rastreabilidade. O ponto essencial é que cada resposta inspirada pelo corpus Dayan precisa saber **o que foi recuperado, por que foi usado, se era permitido e se funcionou**.

### 8.7. Revisão humana, incidentes e governança

| Tabela | Finalidade | Campos principais recomendados |
|---|---|---|
| `humanReviewQueue` | Fila de casos para revisão clínica, editorial ou técnica | `id`, `interactionId`, `reviewType`, `priority`, `reason`, `status`, `assignedTo`, `createdAt` |
| `humanReviewDecisions` | Registrar decisão e correção humana | `id`, `queueId`, `decision`, `correctedAnswer`, `labelsJson`, `notes`, `reviewedBy`, `createdAt` |
| `aiIncidentReports` | Registrar incidentes de segurança, alucinação ou experiência | `id`, `interactionId`, `incidentType`, `severity`, `description`, `rootCause`, `status`, `createdAt` |
| `aiChangeApprovals` | Aprovar mudanças de prompt, política, agente ou modelo | `id`, `changeType`, `targetKey`, `fromVersion`, `toVersion`, `riskClass`, `approvedBy`, `createdAt` |
| `aiRollbacks` | Registrar reversão de mudança | `id`, `targetType`, `fromVersion`, `toVersion`, `reason`, `triggeredBy`, `createdAt` |

A governança não serve para travar o produto. Ela serve para permitir escala com segurança. Um sistema que vai alcançar milhões de pessoas precisa saber reverter, explicar, auditar e aprender com incidentes, especialmente porque sistemas de IA aplicados a saúde e dados sensíveis exigem rastreabilidade, supervisão proporcional ao risco e mecanismos de mitigação contínua.[1] [2] [6] [7]

## 9. Feedback loop 24/7: como o chat melhora todos os dias

O loop vivo deve rodar em duas velocidades. A primeira velocidade acontece **em tempo real**, a cada conversa: o sistema classifica, responde, avalia, registra feedback e atualiza sinais de qualidade. A segunda velocidade acontece **em ciclos programados**, por exemplo diariamente: o sistema agrega falhas, identifica padrões, monta datasets, propõe mudanças, roda avaliações offline e publica melhorias seguras em ambiente controlado.

| Momento | O que acontece | Resultado |
|---|---|---|
| Durante a conversa | Registro de intenção, agentes, resposta, guardrail e feedback | Interação auditável e sinal de aprendizado |
| Minutos depois | Avaliação automática de qualidade e segurança | Scores, falhas e candidatos a dataset |
| Diariamente | Agregação de falhas, clusters de temas e ranking de problemas | Relatório de melhoria e fila de curadoria |
| Diariamente/semanalmente | Geração de novos testes e exemplos a partir de falhas reais | Dataset vivo e golden/adversarial set atualizado |
| Após avaliação | Proposta de ajuste em prompt, política, exemplos, ranking ou RAG | Mudança candidata, não necessariamente publicada |
| Antes de publicar | Rodada offline contra datasets críticos | Aprovação, bloqueio ou revisão humana |
| Publicação controlada | Canary, A/B test ou DEV-only | Métricas comparativas e rollback possível |
| Pós-publicação | Monitoramento de drift, falha crítica e satisfação | Aprendizado contínuo e segurança operacional |

Esse loop deve ser implementado como tarefa agendada externa ao runtime do site, porque ambientes web escaláveis podem hibernar ou reiniciar. A tarefa agendada deve chamar endpoints próprios do projeto, gerar relatórios e alimentar tabelas de melhoria. O site deve fornecer endpoints seguros para receber os artefatos prontos do ciclo, não tentar rodar toda a inteligência em background dentro da instância web.

## 10. Aprendizado sem depender de código novo a cada sintoma

A frase “sem depender de mais códigos” precisa ser traduzida tecnicamente com precisão. O sistema ainda precisa de código para novas capacidades estruturais, segurança, tabelas, agentes e integrações. Porém, depois que a fundação estiver pronta, a maioria das melhorias de comportamento não deve exigir edição de código. Elas devem acontecer por dados, configuração, prompts, políticas, exemplos, ranking e datasets.

| O que hoje vira código | Como deve virar operação viva |
|---|---|
| “Se o usuário falar cefaleia, responder X” | Dataset de sintomas persistentes, classificador de intenção, agente de anamnese e rubrica de qualidade |
| “Trocar frase de saudação” | Prompt registry, tone policy, testes de intenção social e versão publicada por configuração |
| “Usar vídeos do Dayan” | RAG com chunks, embeddings, tags, claims, filtros e tracking de recuperação |
| “Corrigir resposta ruim” | Feedback event, avaliação automática, dataset item, teste de regressão e ajuste versionado |
| “Melhorar tom” | Agente de personalização, rubrica de empatia, exemplos aprovados e A/B testing |
| “Evitar prescrição” | Guardrail policy, detector pós-resposta, dataset adversarial e bloqueio crítico |

Esse é o ponto de virada. O código deixa de conter respostas. O código passa a conter **mecanismos**: orquestrar, buscar, avaliar, registrar, testar, versionar e publicar. A inteligência passa a viver nos dados governados e nas versões controladas.

## 11. Fluxo completo de uma mensagem clínica no novo sistema

Quando o usuário diz “faz 3 dias que acordo com dor de cabeça”, o sistema não deve procurar uma regra de cefaleia. Ele deve entender que há uma queixa clínica persistente, matinal, com lacunas de gravidade e contexto. O maestro deve acionar agentes apropriados e o sistema deve produzir resposta proporcional.

| Passo | Decisão interna | Exemplo de saída |
|---|---|---|
| Intenção | Sintoma persistente | `intent = symptom_triage`, `subIntent = headache_morning` |
| Risco inicial | Amarelo até excluir red flags | `riskLevel = yellow_watchful`, `redFlagsToScreen = [...]` |
| Agentes | Segurança, anamnese, integrativo, Dayan/RAG se útil, composição, guardrail | `agentsPlanned = [clinical_safety, anamnesis, integrative, dayan_rag, composer, final_guardrail]` |
| Memória | Buscar histórico autorizado de pressão, sono, enxaqueca, medicação, métricas | `relevantMemory = sleepPattern, bloodPressure, priorHeadacheEvents` |
| Dayan/RAG | Recuperar chunks sobre sono, hidratação, pressão, rotina, sem prometer causa | `themes = [sono, hidratação, pressão, alimentação, tela]` |
| Resposta | Acolher, alertar sinais graves, perguntar contexto e orientar próximo passo | Resposta humana, sem “Boa.” e sem diagnóstico |
| Avaliação | Medir se fez triagem, se não prescreveu, se foi útil e específica | `safetyScore`, `specificityScore`, `failureModes` |
| Dataset | Se foi boa ou ruim, transformar em exemplo rotulado | `datasetCandidate = true`, `labels = symptom_persistent, morning_headache, yellow` |

A diferença fundamental é que o sistema aprende com o caso. Se muitos usuários perguntam sobre cefaleia matinal e avaliam mal respostas genéricas, o ciclo diário detecta o cluster, gera novos exemplos, mede lacunas, melhora o prompt do agente de anamnese, ajusta recuperação Dayan e adiciona testes de regressão. Não é o programador que escreve “cefaleia = texto X”. É o sistema que aprende padrões de intenção, lacunas e qualidade.

## 12. Fases de implementação com detalhamento operacional

A execução precisa ser incremental, mas não improvisada. Cada fase deve gerar valor real e preparar a próxima. A ordem abaixo evita repetir o erro de construir aparência antes do cérebro.

### Fase 0 — Pausa de remendos e alinhamento arquitetural

Esta fase congela a lógica de “corrigir caso por caso” e aprova a arquitetura viva. O entregável é este documento, seguido de decisão explícita sobre a reconstrução do motor. O critério de passagem é parar de tratar frases ruins como bugs isolados e assumir que o produto precisa de fundação de inteligência.

| Entregável | Critério de aceite |
|---|---|
| Documento fundador aprovado | Arquitetura, tabelas, fases e loop vivo entendidos e aceitos |
| Lista de hardcodes a remover | Mapeamento de regras por sintoma, saudações cristalizadas e fallbacks ruins |
| Política de não remendo | Nenhum novo comportamento clínico é implementado como `if sintoma então resposta fixa` |

### Fase 1 — Schema da fundação viva

Nesta fase, o banco ganha as tabelas centrais de sessões, mensagens, interações, orquestração, agentes, prompts, políticas, feedback, avaliações e corpus Dayan. Essa fase não precisa resolver toda a IA, mas precisa criar o chão onde a IA poderá aprender.

| Grupo de tabelas | Tabelas prioritárias |
|---|---|
| Interações | `aiSessions`, `aiMessages`, `aiInteractions`, `aiOrchestrationPlans` |
| Registry | `aiAgentRegistry`, `aiPromptRegistry`, `aiModelRegistry`, `aiPolicyRegistry`, `aiLiveConfig` |
| Execução | `aiAgentRuns`, `aiGuardrailResults`, `clinicalRiskEvents`, `aiFallbackEvents` |
| Feedback e avaliação | `aiFeedbackEvents`, `aiResponseEvaluations`, `aiQualityRubrics`, `aiEvaluatorRuns` |
| Corpus Dayan | `dayanSources`, `dayanTranscripts`, `dayanChunks`, `dayanEmbeddings`, `dayanClaims` |

O critério de passagem é simples: toda resposta do chat precisa poder gerar uma trilha mínima de auditoria, mesmo que os agentes ainda estejam em versão inicial.

### Fase 2 — Ingestão real dos 250 vídeos do Dayan

Esta fase transforma os vídeos decodificados em ativos operacionais. O trabalho não é “subir transcrições”. O trabalho é preparar conhecimento utilizável por IA: chunks semânticos, tags, embeddings, claims, riscos e padrões pedagógicos.

| Etapa | Descrição | Resultado |
|---|---|---|
| Normalização | Limpar transcrições, remover ruído, padronizar idioma e metadados | Transcrições consistentes |
| Chunking | Dividir por ideias, temas e tempo | Trechos recuperáveis |
| Tagging | Classificar por tema integrativo, risco e modalidade | Busca filtrável |
| Claim extraction | Identificar afirmações biomédicas ou comerciais sensíveis | Revisão e guardrail |
| Embeddings | Gerar vetores ou referências vetoriais | Busca semântica |
| Curadoria | Aprovar, restringir ou bloquear chunks | Corpus seguro |
| Golden examples | Criar exemplos derivados e seguros | Testes e prompts melhores |

O critério de passagem é o sistema conseguir recuperar trechos relevantes para perguntas comuns e registrar o que foi recuperado, sem copiar trechos longos nem atribuir orientação pessoal indevida.

### Fase 3 — Maestro textual mínimo

Nesta fase nasce o maestro de orquestração textual. Ele não precisa chamar todos os agentes ainda, mas precisa produzir um plano estruturado para cada interação: intenção, risco, profundidade, agentes necessários, memória permitida e critérios de resposta.

| Contrato do maestro | Campos obrigatórios |
|---|---|
| Intenção | `intent`, `subIntent`, `confidence`, `ambiguity` |
| Risco | `riskLevel`, `redFlags`, `blockedRequests`, `safetyAction` |
| Agentes | `agentsToRun`, `agentOrder`, `skipReasons` |
| Contexto | `memoryNeeded`, `dayanRetrievalNeeded`, `missingContext` |
| Qualidade | `answerDepth`, `tone`, `mustAsk`, `mustAvoid` |

O critério de passagem é o maestro separar corretamente cumprimento, dúvida aberta, sintoma, urgência, prescrição, diagnóstico fechado e conversa emocional.

### Fase 4 — Agentes textuais especializados

Nesta fase, as responsabilidades saem de um bloco único e viram agentes. O sistema deve implementar, no mínimo, intenção, segurança clínica, anamnese, integrativo, Dayan/RAG, composição e guardrail final.

| Agente inicial | Critério de aceite |
|---|---|
| Intenção | Classifica corretamente cenários sociais, clínicos, urgentes e ambíguos |
| Segurança | Nunca suaviza red flags críticas nos testes |
| Anamnese | Faz poucas perguntas boas, não questionário infinito |
| Integrativo | Conecta hábitos sem diagnosticar nem prescrever |
| Dayan/RAG | Recupera chunks úteis, seguros e rastreáveis |
| Composição | Escreve resposta humana e proporcional |
| Guardrail | Bloqueia diagnóstico fechado, dose, prescrição e promessa |

O critério de passagem é que nenhum agente responda diretamente ao usuário. Todas as saídas devem ser JSON estruturado e passar por composição e guardrail.

### Fase 5 — Feedback explícito e avaliador automático

Nesta fase, o chat começa a aprender operacionalmente. Cada resposta deve permitir feedback simples, e cada resposta clínica deve ser avaliada automaticamente por rubrica.

| Elemento | Implementação recomendada |
|---|---|
| Feedback rápido | Botões discretos: ajudou, não ajudou, perigoso, confuso, quero continuar |
| Feedback textual | Campo opcional para explicar o problema |
| Avaliação automática | Rubrica com segurança, utilidade, especificidade, empatia, continuidade e DNA integrativo |
| Falhas críticas | Diagnóstico, prescrição, omissão de urgência, promessa, falsa certeza, fonte inventada |
| Dataset candidate | Respostas ruins, boas e ambíguas viram candidatos a dataset |

O critério de passagem é o sistema produzir métricas diárias de qualidade e conseguir apontar os principais motivos de falha.

### Fase 6 — Dataset vivo e golden tests

Esta fase converte conversas reais anonimizadas e casos sintéticos em datasets. O objetivo é que cada bug importante vire teste, cada resposta excelente vire exemplo e cada área sensível tenha conjunto adversarial.

| Dataset | Conteúdo | Uso |
|---|---|---|
| `golden_social` | Cumprimentos, dúvidas abertas e continuidade | Evitar anamnese indevida |
| `golden_symptoms` | Sintomas comuns, persistentes e ambíguos | Melhorar anamnese e utilidade |
| `golden_red_flags` | Urgências e sinais graves | Bloqueio crítico obrigatório |
| `golden_prescription` | Pedidos de dose, remédio e suplemento | Bloqueio prescritivo |
| `golden_dayan_dna` | Perguntas integrativas comuns | Aderência ao DNA sem imitação |
| `adversarial_clinical` | Casos contraditórios, emocionais e incompletos | Robustez e segurança |

O critério de passagem é toda mudança relevante de prompt, política, agente ou corpus rodar contra esses datasets antes de ser publicada.

### Fase 7 — Configuração dinâmica e melhoria sem deploy

Nesta fase, prompts, políticas, pesos de roteamento, thresholds, rubricas e versões de agente passam a ser controlados por registry e `aiLiveConfig`. O produto deixa de exigir alteração de código para ajustes comportamentais comuns.

| Configuração dinâmica | Exemplo |
|---|---|
| Threshold de risco | Quando encaminhar caso amarelo para pergunta adicional ou alerta |
| Prompt de tom | Ajustar calor humano, concisão e profundidade |
| Rubrica de avaliação | Alterar peso de especificidade ou empatia |
| Ranking Dayan | Priorizar chunks com melhor feedback |
| Política de fallback | Trocar fallback genérico por fallback contextual seguro |
| A/B test | Comparar duas estratégias de anamnese sem mexer no código |

O critério de passagem é conseguir publicar uma melhoria de tom ou recuperação em DEV via configuração versionada, com avaliação e rollback.

### Fase 8 — Ciclo diário 24/7 de aprendizado operacional

Nesta fase, uma rotina agendada analisa as últimas interações, encontra padrões, gera relatório, cria itens de dataset, propõe mudanças e dispara avaliações. Isso é o coração do “chat live”.

| Job diário | O que faz |
|---|---|
| `daily_quality_digest` | Agrega scores, feedbacks, falhas e temas mais problemáticos |
| `dataset_candidate_builder` | Converte interações úteis em candidatos anonimizados |
| `dayan_retrieval_tuner` | Mede quais chunks foram úteis e ajusta ranking |
| `prompt_candidate_generator` | Propõe ajustes de prompt para falhas recorrentes |
| `offline_eval_runner` | Testa mudanças candidatas contra golden/adversarial sets |
| `human_review_sampler` | Seleciona amostra para revisão humana e calibração |
| `drift_monitor` | Detecta piora em segurança, tom, prescrição ou satisfação |

O critério de passagem é o sistema gerar um relatório diário acionável, com propostas e evidências, sem precisar que o usuário descubra manualmente cada falha.

### Fase 9 — Experimentos, canary e A/B testing

Nesta fase, melhorias são testadas de forma controlada. O sistema não troca comportamento para todos sem medir impacto. Ele usa canary em DEV/piloto, A/B test por segmentos e rollback automático quando métricas críticas pioram.

| Métrica de experimento | Regra de decisão |
|---|---|
| Red flags perdidas | Qualquer piora bloqueia publicação |
| Prescrição indevida | Qualquer ocorrência crítica bloqueia publicação |
| Utilidade percebida | Precisa melhorar sem piorar segurança |
| Continuidade | Mais usuários seguem a conversa com qualidade |
| Fallback ruim | Deve cair ou ficar estável |
| Latência | Não pode degradar a experiência mobile significativamente |

O critério de passagem é provar que uma mudança melhora o produto em dados, não em impressão subjetiva.

### Fase 10 — Modelos supervisionados próprios

Somente depois de acumular dataset suficiente e revisado, o DOUTORELO deve treinar classificadores próprios para intenção, risco, roteamento, qualidade e ranking. Isso reduz dependência de prompt e melhora consistência.

| Modelo futuro | Dados necessários | Benefício |
|---|---|---|
| Classificador de intenção | Interações rotuladas por intenção e subintenção | Roteamento mais estável e barato |
| Classificador de risco | Casos rotulados com red flags e severidade | Segurança mais consistente |
| Ranking de corpus Dayan | Consultas, chunks recuperados, feedback e utilidade | RAG mais preciso |
| Avaliador de qualidade | Respostas avaliadas por rubrica humana e automática | Métrica mais confiável |
| Detector de alucinação clínica | Casos com falhas de fabricação, omissão, causalidade e certeza | Menos respostas perigosas |

O critério de passagem é que modelos próprios superem baseline de LLM/prompt em datasets congelados e não aumentem risco clínico.

### Fase 11 — Multimodal governado

Após o texto estar maduro, entram documentos, exames, imagens, vídeo e áudio. Multimodalidade antes de governança aumenta risco. Multimodalidade depois da fundação cria vantagem competitiva real.

| Modalidade | Pré-requisito | Saída segura |
|---|---|---|
| PDF de exame | Upload, storage, OCR, consentimento e extração | Resumo educativo, lacunas e perguntas para profissional |
| Foto de exame | Avaliação de qualidade e OCR | Pedido de nova imagem se ilegível e resumo cauteloso |
| Imagem clínica | Consentimento, qualidade e limites | Descrição observacional e sinais de atenção, sem diagnóstico |
| Vídeo | Processamento seguro e análise temporal limitada | Observações e orientação de avaliação quando necessário |
| Áudio | Transcrição, confirmação e triagem | Conversa natural com registro textual revisável |

O critério de passagem é cada modalidade ter testes, consentimento, logs, guardrails e revisão humana quando necessário.

### Fase 12 — Escala, governança e operação clínica-assistiva ampla

A última fase é escalar com responsabilidade. Milhões de pessoas exigem dashboards, incidentes, suporte, revisão, privacidade, performance, custo controlado e métricas de segurança.

| Pilar de escala | Requisito |
|---|---|
| Observabilidade | Dashboards de qualidade, risco, latência, custo e satisfação |
| Governança | Registro de mudanças, aprovações, auditoria e rollback |
| Operação clínica | Filas de revisão, incidentes, protocolos e responsáveis |
| Performance | Cache, filas, streaming, rotas rápidas e otimização mobile |
| Segurança de dados | Consentimento, minimização, retenção e controle de acesso |
| Aprendizado contínuo | Ciclos diários, semanais e mensais com métricas comparáveis |

## 13. Métricas que realmente importam

O DOUTORELO não deve medir apenas número de usuários e mensagens. Um produto de IA em saúde precisa medir qualidade operacional. Se milhões de pessoas vão usar, a pergunta não é “quantas mensagens foram respondidas?”, mas “quantas respostas foram úteis, seguras, específicas, contínuas e melhoraram com o tempo?”.

| Métrica | Definição | Meta inicial |
|---|---|---|
| `critical_safety_pass_rate` | Percentual de red flags e prescrição bloqueados corretamente | 100% em testes críticos |
| `user_helpfulness_rate` | Percentual de respostas marcadas como úteis | Crescente por coorte |
| `specificity_score` | Grau em que a resposta usa contexto real e não generalidade | Crescente semanalmente |
| `continuity_rate` | Percentual de usuários que continuam conversa após resposta útil | Crescente sem aumentar risco |
| `fallback_quality_rate` | Percentual de fallbacks considerados adequados | Alto e com queda de fallback genérico |
| `dayan_retrieval_precision` | Chunks recuperados realmente úteis para a resposta | Crescente com feedback |
| `dataset_growth_quality` | Novos itens aceitos no dataset após curadoria | Crescente, com baixa duplicação |
| `regression_failure_count` | Falhas em golden/adversarial tests | Zero em críticos |
| `drift_alerts` | Alertas de piora de tom, segurança ou prescrição | Investigados em SLA curto |
| `time_to_learning` | Tempo entre falha real e criação de teste/melhoria | Reduzir progressivamente |

## 14. Arquitetura técnica de alto nível

A arquitetura técnica pode ser implementada dentro do stack atual, desde que o backend passe a tratar IA como domínio central. O frontend continua simples e mobile-first. O backend concentra orquestração, segurança, RAG, avaliação e logs. O banco guarda trilhas, registry, datasets e métricas. Jobs agendados executam melhoria contínua.

| Camada técnica | Componentes recomendados |
|---|---|
| Frontend | Chat live, feedback discreto, estados de carregamento, anexos futuros, experiência mobile-first |
| tRPC/API | Procedimentos para enviar mensagem, registrar feedback, listar histórico, obter estado e receber ciclos agendados |
| Orquestração server-side | Maestro, agentes, composer, guardrail, evaluator e registry loader |
| Banco de dados | Tabelas de IA, corpus Dayan, feedback, avaliações, datasets e governança |
| Storage | Arquivos, documentos, mídia, artefatos de avaliação e exports de dataset |
| Jobs agendados | Digest diário, dataset builder, evaluation runner, drift monitor e relatório de melhoria |
| Dashboards internos | Métricas, incidentes, prompts ativos, experimentos, corpus e revisão humana |

O código deve ser organizado por domínio, por exemplo: `server/ai/orchestrator`, `server/ai/agents`, `server/ai/evaluation`, `server/ai/rag`, `server/ai/feedback`, `server/ai/registry` e `server/ai/learning`. Essa separação evita que o motor volte a se concentrar em um arquivo de personalidade ou em uma rota monolítica, e cria condições para auditoria, validação e controle de mudança compatíveis com práticas modernas de gestão de risco em IA.[2] [3]

## 15. Como o produto supera um chatbot de WhatsApp

Um chatbot simples pode parecer melhor no início porque responde rápido, com linguagem natural e sem mostrar suas limitações. O DOUTORELO só vai vencer quando transformar sua ambição em operação concreta. A vantagem não será “ter um prompt melhor”. A vantagem será ter memória, corpus próprio, feedback, avaliação, melhoria contínua, segurança, personalização e governança.

| Chatbot comum | DOUTORELO vivo |
|---|---|
| Responde com base em prompt genérico | Responde por maestro, agentes, memória, corpus e guardrail |
| Não sabe se foi útil | Registra feedback e avaliação por rubrica |
| Repete erro até alguém corrigir código | Converte erro em dataset, teste e proposta de melhoria |
| Usa conhecimento genérico | Usa corpus Dayan curado e bases autorizadas com rastreabilidade |
| Não tem governança clínica | Tem risco, consentimento, auditoria, revisão e rollback |
| Não aprende de forma operacional | Aprende por ciclos diários e métricas comparáveis |

A meta não é parecer inteligente por uma conversa. A meta é ficar mais inteligente a cada dia, com segurança e rastreabilidade.

## 16. Critérios de aceite da reconstrução

A reconstrução só deve ser considerada bem-sucedida quando o sistema demonstrar, em operação, que abandonou a lógica de remendos. Isso precisa aparecer no código, no banco, nos testes, nos dados e na experiência.

| Critério | Evidência esperada |
|---|---|
| Não há resposta clínica por hardcode de sintoma | Sintomas comuns passam por intenção, risco, agentes e composição |
| O chat registra trilha completa | Cada interação tem sessão, mensagem, plano, agentes, guardrail e avaliação |
| O corpus Dayan é recuperável | Perguntas comuns retornam chunks relevantes com metadados e tracking |
| Feedback vira aprendizado | Feedback negativo cria avaliação, dataset candidate e tarefa de melhoria |
| Mudanças são versionadas | Prompt, política, modelo e agente têm registry e snapshot |
| Avaliação bloqueia regressão | Golden/adversarial tests rodam antes de publicar mudanças |
| O sistema melhora sem deploy para cada ajuste | Ajustes de prompt, ranking, rubrica e política podem ser feitos por configuração |
| A experiência externa é simples | Usuário recebe conversa natural, sem bastidores ou excesso técnico |

## 17. Próxima ação recomendada

A próxima ação não deve ser corrigir “cefaleia” ou “boa noite”. A próxima ação deve ser criar a **Fase 1 da fundação viva** no banco e no backend, começando por `aiSessions`, `aiMessages`, `aiInteractions`, `aiOrchestrationPlans`, `aiAgentRegistry`, `aiPromptRegistry`, `aiPolicyRegistry`, `aiFeedbackEvents` e `aiResponseEvaluations`. Em paralelo, deve iniciar a Fase 2 com as tabelas `dayanSources`, `dayanTranscripts`, `dayanChunks`, `dayanEmbeddings` e `dayanRetrievalEvents`.

Depois disso, o chat público deve ser reconectado a um maestro textual mínimo. Somente então faz sentido melhorar a resposta visível. A resposta visível será consequência de um sistema melhor, não de mais uma frase colocada no código.

> **Conclusão:** o DOUTORELO precisa de carinho técnico no sentido mais sério da palavra: atenção à fundação, respeito à complexidade, paciência com fases, rigor com dados, obsessão por qualidade e coragem para parar de remendar. O produto deve nascer de novo como um sistema vivo. Só assim ele poderá servir milhões de pessoas sem virar apenas mais um chatbot bonito e frágil.

## Referências

[1]: https://www.who.int/publications/i/item/9789240029200 "Ethics and governance of artificial intelligence for health — World Health Organization"  
[2]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"  
[3]: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles "Good Machine Learning Practice for Medical Device Development — FDA"  
[4]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software "Clinical Decision Support Software — FDA Guidance"  
[5]: https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/anvisa-regulamenta-softwares-como-dispositivos-medicos "ANVISA — Software como Dispositivo Médico"  
[6]: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/lgpd "Lei Geral de Proteção de Dados Pessoais — ANPD"  
[7]: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai "European Commission — AI Act regulatory framework"
