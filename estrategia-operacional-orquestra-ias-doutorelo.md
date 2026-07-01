# Estratégia Operacional da Orquestra de IAs do DOUTORELO

**Autoria:** SIDNEY (PMO SENIUM)  
**Projeto:** DOUTORELO — Saúde Integrativa IA DEV  
**Versão:** 1.0 operacional  
**Status:** Base estratégica e técnica para evolução controlada do chat público, anexos e agentes especializados.

## 1. Objetivo operacional

O DOUTORELO não deve funcionar como um chatbot genérico de saúde. A estratégia operacional correta é tratá-lo como um **ecossistema clínico-assistivo orquestrado por IAs especializadas**, em que um maestro central interpreta a demanda do usuário, classifica risco, seleciona agentes, consolida achados, aplica guardrails e só então libera uma resposta final educativa, contextual e segura.

> **Definição operacional:** a orquestra de IAs do DOUTORELO é o conjunto coordenado de modelos, agentes, heurísticas, corpus interno, regras clínicas e validações que transforma entradas livres do usuário em respostas assistivas, rastreáveis, não diagnósticas e escaláveis.

Essa estratégia separa claramente o que já pode ocorrer no chat público do que só deve ser liberado em fases posteriores com infraestrutura, consentimento, auditoria, validação clínica e, quando necessário, humano no circuito. A primeira implementação real do maestro já está conectada ao chat público por chamada server-side ao LLM para provocações clínicas textuais, mas a operação multimodal completa ainda deve seguir este roteiro antes de exposição ampla.

## 2. Princípios de operação

A orquestra deve obedecer a cinco princípios permanentes. Primeiro, **nenhuma IA especializada responde diretamente ao paciente** sem passar pelo maestro e pelos guardrails finais. Segundo, **a resposta não deve diagnosticar, prescrever, dosar ou prometer resultado**, mesmo quando usa raciocínio clínico assistivo. Terceiro, **sintomas, exames, anexos e relatos devem ser tratados como dados sensíveis**, com uso mínimo necessário, contexto explícito e rastreabilidade. Quarto, **o conhecimento do Dr. Dayan deve funcionar como repertório editorial e integrativo**, não como simulação da pessoa, assinatura médica ou autoridade diagnóstica automática. Quinto, **a experiência deve permanecer humana e progressiva**, evitando despejar anamnese, bastidores internos ou protocolos completos quando o usuário ainda está apenas cumprimentando ou testando o sistema.

| Princípio | Decisão operacional | O que bloqueia |
|---|---|---|
| Maestro obrigatório | Toda demanda clínica passa por classificação, roteamento, consolidação e guardrail final. | Resposta direta de agente isolado ao usuário final. |
| Segurança clínica proporcional | Alerta forte apenas quando houver red flag, risco, prescrição, diagnóstico fechado ou urgência. | Disclaimers repetitivos em interações comuns e omissão de sinais graves. |
| Rastreabilidade | Registrar intenção, risco, agentes acionados, fallback e fontes internas usadas. | Resposta sem auditoria mínima quando a demanda é clínica. |
| DNA integrativo com limite | Usar repertório Dayan como contexto educativo e temático. | Simular Dr. Dayan, prescrever suplemento ou atribuir certeza clínica. |
| Progressão relacional | Cumprimento gera resposta social curta; sintoma gera anamnese dirigida. | Anamnese completa em saudação ou fallback social em sintoma real. |

## 3. Maestro central

O maestro é a camada responsável por converter uma mensagem livre em uma decisão operacional. Ele deve receber a mensagem atual, o histórico recente, anexos disponíveis, consentimentos, estado de autenticação, contexto longitudinal autorizado, contexto Dayan recuperado e flags de segurança. Sua saída deve ser estruturada e auditável, não apenas texto livre.

O contrato mínimo do maestro deve conter: `intent`, `clinicalRiskLevel`, `agentsInvoked`, `redFlagsToScreen`, `anamnesisQuestions`, `integrativeReasoning`, `safetyActions`, `finalAnswer`, `needsHumanReview`, `fallbackUsed` e `auditNotes`. Essa estrutura permite que a interface mostre apenas o que é útil para o usuário, enquanto o backend preserva informação suficiente para depuração, melhoria de qualidade e governança.

| Campo do maestro | Finalidade | Exemplo para cefaleia matinal há três dias |
|---|---|---|
| `intent` | Classificar a provocação principal. | `symptom_triage` |
| `clinicalRiskLevel` | Estimar risco operacional, não diagnóstico. | `yellow_watchful` se houver dor progressiva, vômitos, alteração visual ou pressão alta relatada. |
| `agentsInvoked` | Declarar quais agentes contribuíram. | Segurança clínica, anamnese dirigida, raciocínio integrativo, corpus Dayan e guardrail final. |
| `redFlagsToScreen` | Listar sinais que precisam ser perguntados ou destacados. | Pior dor da vida, febre, rigidez na nuca, alteração neurológica, trauma, vômitos, visão alterada. |
| `anamnesisQuestions` | Guiar a próxima conversa. | Intensidade, localização, horário, sono, hidratação, pressão, visão, medicamentos, histórico. |
| `finalAnswer` | Texto entregue ao usuário. | Resposta acolhedora, útil e sem diagnóstico fechado. |

## 4. Agentes especializados

A arquitetura operacional deve evoluir por agentes com responsabilidade clara. O objetivo não é criar muitos agentes por complexidade estética, mas separar riscos e competências para que cada saída possa ser validada antes da consolidação final.

| Agente | Entrada permitida | Saída esperada | Critério de acionamento | Limites obrigatórios |
|---|---|---|---|---|
| Agente de Sociabilidade | Cumprimentos, agradecimentos, teste de capacidade, conversa aberta. | Resposta curta, humana e disponibilidade. | Mensagem sem demanda clínica concreta. | Não acionar anamnese, Dayan, triagem ou bastidores. |
| Agente de Segurança Clínica | Texto do usuário, histórico recente, anexos declarados e sinais de risco. | Red flags, nível de risco, ação de segurança e necessidade de atendimento. | Qualquer sintoma, urgência, prescrição, dose, diagnóstico ou sofrimento intenso. | Não diagnosticar; escalar quando houver risco. |
| Agente de Anamnese Dirigida | Sintoma, duração, localização, intensidade, contexto e histórico. | Perguntas priorizadas e progressivas. | Relato clínico concreto. | Não transformar primeira resposta em formulário extenso. |
| Agente Integrativo | Rotina, sono, alimentação, hidratação, intestino, estresse, movimento e contexto. | Hipóteses educativas de padrões e fatores associados. | Sintomas comuns, hábitos, prevenção ou dúvidas integrativas. | Não prescrever condutas, suplementos ou doses. |
| Agente Dayan | Query clínica/editorial e contexto permitido. | Temas, trechos e âncoras educativas rastreáveis do corpus. | Perguntas de saúde em que o repertório interno agrega contexto. | Não simular identidade do Dr. Dayan nem usar corpus como diagnóstico. |
| Agente de Exames | PDF, imagem ou texto de exame já autorizado. | Extração, normalização, resumo educativo e lacunas. | Fase multimodal habilitada e consentida. | Não interpretar laudo como diagnóstico final sem validação. |
| Agente de Imagens/Fotos | Imagem clínica, lesão, foto corporal ou registro visual. | Descrição limitada, sinais de atenção e recomendação de avaliação. | Fase visual habilitada e consentida. | Não diagnosticar por imagem; escalar sinais preocupantes. |
| Agente de Documentos | Receitas, laudos, relatórios, prontuários e documentos diversos. | Resumo, entidades clínicas e perguntas úteis. | Upload documental autorizado. | Proteger privacidade e não inventar dado ausente. |
| Agente de Auditoria | Todas as saídas intermediárias e resposta final. | Registro de versão, agentes, flags, fallback e bloqueios. | Toda demanda clínica ou multimodal. | Não expor bastidores ao usuário final. |
| Agente de Guardrail Final | Resposta consolidada. | Aprovação, reescrita segura ou bloqueio. | Antes de qualquer resposta ao usuário. | Bloquear prescrição, dose, diagnóstico fechado e omissão de urgência. |

## 5. Fluxo operacional da resposta

O fluxo deve seguir uma sequência fixa, ainda que alguns agentes sejam pulados quando não se aplicam. A mensagem entra pelo frontend; o backend higieniza e limita o contexto; o maestro classifica intenção e risco; agentes especializados são acionados conforme critérios; o resultado é consolidado; o guardrail final verifica limites clínicos e comerciais; a resposta é entregue com perguntas úteis e caminhos possíveis.

| Etapa | Pergunta operacional | Saída esperada |
|---|---|---|
| Recepção | O que o usuário trouxe e em qual profundidade? | Texto normalizado, histórico curto e anexos declarados. |
| Classificação | É saudação, dúvida aberta, sintoma, exame, prescrição, urgência ou documento? | Intenção principal e subintenção. |
| Risco | Há red flag, urgência, autoagressão, pedido de dose ou diagnóstico fechado? | Nível verde, amarelo, vermelho ou bloqueado. |
| Roteamento | Quais agentes são necessários agora? | Lista de agentes e motivo de acionamento. |
| Consolidação | O que é útil dizer sem exagerar, assustar ou prometer? | Resposta educativa e perguntas de continuidade. |
| Guardrail | A resposta violou diagnóstico, prescrição, dose, certeza indevida ou omitiu risco? | Aprovar, reescrever, bloquear ou escalar. |
| Auditoria | O que precisa ficar registrado para qualidade e governança? | Metadados internos, versão e fallback. |

## 6. Caso padrão: cefaleia matinal há três dias

Quando o usuário diz algo como “faz 3 dias que acordo com dores de cabeça”, o sistema deve tratar como demanda clínica real, não como saudação nem como pergunta genérica. O maestro deve acionar, no mínimo, o agente de segurança clínica, o agente de anamnese dirigida, o agente integrativo, a camada Dayan quando houver contexto temático útil e o guardrail final.

A resposta deve começar reconhecendo o incômodo e a recorrência matinal. Em seguida, deve investigar sinais de alerta: pior dor da vida, dor súbita, febre, rigidez na nuca, vômitos persistentes, desmaio, confusão, fraqueza, alteração de fala, alteração visual, trauma, pressão muito alta, gravidez/puerpério ou imunossupressão. Sem esses sinais, a resposta pode perguntar de forma progressiva sobre intensidade, localização, qualidade da dor, sono, ronco, hidratação, cafeína, álcool, jejum, estresse, tela à noite, medicamentos, pressão arterial, visão e histórico de enxaqueca ou sinusite. O tom deve ser consultivo e objetivo, sem diagnóstico fechado.

| Agente chamado | Contribuição nesse caso | Exemplo de uso na resposta final |
|---|---|---|
| Segurança clínica | Verificar red flags e necessidade de urgência. | “Se vier com fraqueza, confusão, febre, rigidez na nuca, vômitos fortes ou alteração visual, procure atendimento.” |
| Anamnese dirigida | Priorizar perguntas de contexto. | “A dor é pulsátil ou em pressão? De 0 a 10, qual a intensidade? Melhora ao levantar ou piora?” |
| Integrativo | Relacionar sono, hidratação, alimentação, estresse e rotina. | “Como aparece ao acordar, vale olhar sono, ronco, hidratação, jejum, cafeína e pressão.” |
| Dayan | Trazer repertório educativo quando pertinente. | Usar temas internos de sono, hidratação, metabolismo e inflamação como base, sem citar como prescrição. |
| Guardrail final | Remover diagnóstico e prescrição. | Trocar “isso é enxaqueca” por “pode ter várias causas e precisa de contexto”. |

## 7. Governança e humano no circuito

A governança deve ser tratada como parte do produto, não como anexo posterior. Toda versão de prompt, schema, agente e guardrail precisa ser versionada. Mudanças em comportamento clínico devem passar por teste automatizado, revisão de casos adversariais e validação em ambiente DEV antes de exposição pública.

Casos vermelhos devem orientar o usuário a atendimento imediato e podem acionar revisão humana quando o produto estiver em ambiente supervisionado. Casos amarelos devem permanecer assistivos, fazer perguntas de qualificação e recomendar avaliação profissional se houver persistência, piora, recorrência ou contexto de risco. Casos verdes podem receber orientação educativa, organização de informações e acompanhamento de hábitos, sempre com limites claros.

| Nível | Descrição operacional | Ação do sistema |
|---|---|---|
| Verde | Dúvida geral, rotina, prevenção ou sintoma leve sem red flag. | Resposta educativa, perguntas úteis e continuidade. |
| Amarelo | Sintoma persistente, recorrente, incômodo ou com lacunas importantes. | Anamnese dirigida, alerta proporcional e sugestão de avaliação se persistir/piorar. |
| Vermelho | Sinais de urgência, déficit neurológico, dor súbita intensa, risco agudo ou autoagressão. | Orientar atendimento imediato e não aprofundar como chat comum. |
| Bloqueado | Pedido de diagnóstico fechado, dose, prescrição, substituição de consulta ou conduta perigosa. | Recusar o trecho inseguro e oferecer alternativa educativa segura. |

## 8. Roadmap de liberação

A liberação deve ocorrer por fases. A fase atual habilita maestro textual real para provocações clínicas comuns no chat público. A fase seguinte deve reforçar auditoria, telemetria de qualidade e biblioteca de casos adversariais. A fase multimodal só deve ser ativada depois que upload, armazenamento, consentimento, processamento seguro e agentes de documento/imagem estiverem validados. A fase de operação ampla exige revisão clínica externa, métricas de segurança, política de incidentes e governança contínua.

| Fase | Escopo | Critério de passagem |
|---|---|---|
| DEV textual | Maestro LLM server-side para texto clínico e fallback seguro. | Testes, build, contratos de regressão e revisão manual no DEV. |
| Piloto supervisionado | Usuários controlados, logs de qualidade e casos adversariais. | Taxa baixa de fallback ruim, nenhum vazamento de bastidor e guardrails confiáveis. |
| Multimodal controlado | Exames, documentos, imagens e vídeos com consentimento explícito. | Extração confiável, limites claros, auditoria e revisão clínica. |
| Operação ampliada | Uso público com escala, suporte, governança e monitoramento. | Políticas de incidentes, revisão contínua, métricas e humano no circuito. |

## 9. Critérios de aceite operacional

A orquestra estará pronta para cada nova etapa apenas quando os testes automatizados cobrirem casos sociais, clínicos comuns, red flags, prescrição, diagnóstico fechado, anexos, fallback inválido e regressões de tom. Além disso, respostas reais precisam ser avaliadas em cenários adversariais, incluindo mensagens curtas, ambíguas, emocionais, incompletas, contraditórias e potencialmente urgentes.

O critério central é simples: **o DOUTORELO deve responder como uma presença assistiva competente, mas nunca como médico autônomo, prescritor ou promessa de cura**. A experiência pode ser acolhedora, integrativa e avançada, desde que mantenha rastreabilidade, limite clínico e governança em cada resposta relevante.
