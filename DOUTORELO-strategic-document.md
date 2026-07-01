# DOUTORELO — Documento Estratégico Fundador da Arquitetura de IA Clínica-Assistiva de Missão Crítica

**Autor:** Manus AI  
**Projeto:** `saude-integrativa-ia-dev`  
**Status:** Pausa estratégica ativa — aguardando aprovação do usuário  
**Data:** 02 de maio de 2026  
**Checkpoint técnico de referência:** `cc364756`  

> **Decisão estratégica central:** o DOUTORELO não deve evoluir como um chatbot de saúde com prompts remendados. Ele deve ser redesenhado como um **ecossistema clínico-assistivo multimodal, governado e orquestrado**, com múltiplas IAs especializadas, humano no circuito, rastreabilidade, validação clínica progressiva e limites explícitos de atuação.

## 1. Sumário executivo

O DOUTORELO nasceu com uma ambição maior do que responder perguntas de saúde em uma caixa de chat. A visão do produto é construir uma nova fronteira de assistência médica por IA, associada à confiança pública do Dr. Dayan Siebra, capaz de conversar com pessoas em linguagem humana, compreender sintomas, organizar relatos, interpretar exames, analisar imagens, fotos, documentos e vídeos, e apoiar decisões de cuidado com segurança, escala e governança profissional.

A auditoria técnica realizada no projeto DEV concluiu que a arquitetura atual contém elementos úteis — como integração server-side com LLM, respostas estruturadas, guardrails determinísticos, fallback e corpus de conhecimento Dayan — mas ainda não é adequada para missão crítica. A resposta inadequada “Boa.” diante de dor ou sintomas não é apenas um defeito de copy. Ela revela uma falha de **governança conversacional**, porque o sistema atual ainda permite que fragmentos de personalidade, regras e aberturas sociais sejam combinados sem um maestro clínico capaz de classificar intenção, risco, modalidade e contexto antes da resposta final.

A consequência estratégica é direta: antes de corrigir placeholder, anexos ou fraseamento, o DOUTORELO precisa aprovar uma arquitetura-alvo. A plataforma deve separar funções educativas, triagem assistiva, interpretação multimodal, apoio a profissionais, segunda opinião, auditoria, personalização de linguagem Dayan e eventual escopo regulatório. A Organização Mundial da Saúde defende que ética, direitos humanos e governança sejam centrais no desenho e uso de IA em saúde, e sua orientação sobre modelos multimodais ressalta que grandes modelos capazes de receber texto, imagem ou outras modalidades trazem oportunidades relevantes, mas também riscos e incertezas que exigem governança própria.[1] [2]

| Decisão | Diretriz proposta | Consequência prática |
|---|---|---|
| Pausa estratégica | Suspender remendos incrementais em prompt e UI até aprovação da arquitetura | Nenhuma correção de chat público deve avançar antes de validação do plano-mestre |
| Arquitetura | Substituir o modelo mental de “uma IA responde” por “orquestra de IAs especializadas” | Cada agente terá escopo, entradas, saídas, limites, logs e validação próprios |
| Segurança | Adotar o princípio “responder com segurança ou não responder” | Incerteza, red flags, urgência e escopo proibido devem acionar fallback, recusa ou humano |
| Escala | Projetar desde o início para milhares ou milhões de interações auditáveis | Observabilidade, versionamento, filas, avaliação contínua e revisão humana precisam nascer na fundação |
| Marca | Proteger a confiança pública do Dr. Dayan Siebra | O DNA Dayan deve inspirar linguagem e raciocínio integrativo, sem simular identidade, prescrever ou inventar |

## 2. Diagnóstico: por que a arquitetura atual falha para missão crítica

A camada de LLM do projeto está centralizada em `server/_core/llm.ts`, que envia requisições server-side para o gateway Manus/Forge por meio de variáveis de ambiente como `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`. A auditoria observou que a integração usa modelo definido no payload e que a camada suporta texto, imagem por URL e arquivo por URL. Entretanto, a aplicação pública atual ainda não implementa uma orquestra multimodal completa para exames, fotos, vídeos e documentos.

No chat público da Home, a rota `homeChat.send` em `server/routers.ts` aciona uma avaliação de segurança determinística e depois chama `buildDoutoreloHomeChatAssistantMessage` em `server/personality.ts`. A resposta visível da Home, portanto, não funciona como uma consulta clínica orquestrada por agentes. Ela é majoritariamente construída por regras, bancos de aberturas, lógica determinística de personalidade e filtros posteriores. Esse desenho consegue resolver casos simples, mas falha quando uma mensagem social, emocional ou clínica exige interpretação contextual refinada.

A falha “Boa.” diante de dor de cabeça por três dias ilustra o problema. Em um sistema de missão crítica, uma queixa de dor persistente deveria ativar acolhimento clínico, investigação de duração, intensidade, sinais de alerta, contexto, medicações, sono, alimentação, pressão arterial, padrão de dor e critérios de urgência. A abertura “Boa.” soa como aprovação ou banalização do sintoma. O erro não é isolado; ele mostra que o sistema atual ainda mistura sociabilidade e resposta clínica sem uma camada superior de decisão.

| Evidência técnica | Risco clínico-assistivo | Interpretação estratégica |
|---|---|---|
| `server/personality.ts` concentra personalidade, abertura, matriz relacional e lógica clínica inicial | Uma abertura social pode vazar para contexto clínico inadequado | A personalidade não pode ser o motor principal de segurança clínica |
| `homeChat.send` usa fluxo público com safety determinístico e resposta final em módulo de personalidade | A resposta final não passa por uma cadeia formal de agentes e auditoria | O sistema precisa de maestro central e validação final antes de exibição |
| LLM é usado em módulos separados, mas sem orquestra clínica completa | Agentes podem existir como peças, mas não como sinfonia | A arquitetura deve definir contratos, prioridades e supervisão entre agentes |
| Não há fluxo completo de anexos, imagens, vídeos e documentos no chat público | O produto promete capacidade multimodal que ainda não está governada | Anexos devem ser uma fase de arquitetura, não apenas componente visual |
| O produto atual mistura protótipo DEV, ambição pública e linguagem de missão crítica | Exposição ampla pode gerar risco reputacional, regulatório e clínico | Separar DEV, piloto supervisionado e produção é obrigatório |

A orientação da FDA sobre *Clinical Decision Support Software* esclarece que certas funções de suporte à decisão clínica podem ficar fora da definição de dispositivo, enquanto outras continuam sujeitas às políticas de saúde digital e ao enquadramento como dispositivo médico quando atendem à definição aplicável.[3] A RDC nº 657/2022 da ANVISA dispõe sobre a regularização de software como dispositivo médico e define SaMD como software destinado a uma ou mais indicações médicas quando se enquadra como dispositivo médico, incluindo aplicativos móveis e software hospedado centralmente.[4] Portanto, o DOUTORELO precisa decidir função por função o que é educação, triagem, apoio à decisão, interpretação clínica, laudo, segunda opinião ou ato médico mediado por tecnologia.

> **Conclusão diagnóstica:** o estado atual deve ser tratado como protótipo controlado. A base é promissora, mas não deve ser ampliada como produto clínico-assistivo de grande escala sem uma arquitetura de orquestra, governança, validação e rastreabilidade.

## 3. Visão de produto: DOUTORELO como nova fronteira de assistência médica por IA

A visão correta para o DOUTORELO é a de uma plataforma que combina acolhimento humano, raciocínio integrativo, evidência clínica, tecnologia multimodal e governança. O produto não deve tentar substituir o médico nem prometer diagnóstico autônomo. Ele deve se posicionar como uma camada inteligente de organização, educação, triagem, preparação, acompanhamento e apoio assistivo, sempre com limites claros e escalonamento quando necessário.

Essa visão é compatível com uma estratégia de escala nacional. Milhares de pessoas podem precisar de orientação inicial, organização de sintomas, leitura preliminar de exames, entendimento de sinais de alerta e preparação para consulta. O valor do DOUTORELO está em reduzir ruído, aumentar clareza, gerar contexto estruturado e encaminhar melhor as pessoas, sem transformar uma IA em autoridade clínica sem supervisão.

| Princípio clínico-científico | Definição operacional | Exemplo no produto |
|---|---|---|
| Humildade clínica | A IA declara incerteza, pede contexto e recusa extrapolações | “Com essas informações, não dá para fechar causa. Posso te ajudar a organizar sinais importantes.” |
| Segurança antes da fluidez | A resposta mais bonita não vale se for insegura | Relato de dor torácica aciona urgência, não conversa longa |
| Multimodalidade governada | Texto, exame, foto, vídeo e documento têm fluxos diferentes | Foto de lesão não recebe diagnóstico; recebe triagem, limites e recomendação de avaliação |
| DNA integrativo rastreável | A linguagem pode refletir abordagem integrativa sem simular o Dr. Dayan | Investigar sono, intestino, alimentação, estresse e rotina sem prescrever |
| Humano no circuito | Casos de risco, ambiguidade ou decisão clínica exigem profissional | Segunda opinião, laudo e conduta passam por médico habilitado |
| Auditoria total | Toda resposta importante deve ser reproduzível e revisável | Logs registram versão de agente, risco, evidências e decisão de escalonamento |

A Comissão Europeia registra que o AI Act entrou em vigor em 1º de agosto de 2024 e que sistemas de IA de alto risco, como software baseado em IA destinado a propósitos médicos, devem cumprir requisitos incluindo mitigação de risco, dados de alta qualidade, informação clara ao usuário e supervisão humana.[7] Ainda que o DOUTORELO seja lançado em fases com escopo educativo e assistivo, a arquitetura deve nascer com padrão de alto risco, pois a ambição declarada envolve saúde, multimodalidade e escala.

## 4. Arquitetura-alvo: a orquestra de IAs especializadas

A arquitetura recomendada é uma **orquestra clínica de agentes especializados**, coordenada por um maestro central. Nenhuma IA especializada deve responder diretamente ao usuário final. Todo conteúdo deve passar por classificação de intenção, avaliação de risco, seleção de agentes, consolidação, validação final, aplicação de guardrails, registro de auditoria e decisão de exibição, recusa ou escalonamento humano.

O maestro não é apenas um roteador técnico. Ele é a camada de governança operacional. Sua função é entender o que o usuário trouxe, decidir quais agentes são necessários, impedir agentes fora de escopo, resolver conflitos entre agentes, priorizar segurança, controlar tom, registrar evidências e determinar se a resposta pode ser exibida.

| Camada | Responsabilidade | Saída esperada | Risco se ausente |
|---|---|---|---|
| Maestro clínico central | Classificar intenção, risco, modalidade, contexto e agentes necessários | Plano de orquestração e decisão de fluxo | Respostas diretas sem priorização de risco |
| IA conversacional-relacional | Acolher, manter naturalidade, adaptar tom e profundidade | Presença humana, clara e brasileira | Frieza, mecanicidade ou excesso técnico |
| IA de triagem e segurança | Detectar red flags, urgência, escopo proibido, automedicação e risco | Classificação verde/amarelo/vermelho e ação obrigatória | Falha em urgências e danos clínicos |
| IA de anamnese integrativa | Formular perguntas contextuais sobre história, rotina, sono, alimentação e sinais associados | Próximas perguntas úteis e não mecânicas | Formulário genérico ou conversa superficial |
| IA de exames laboratoriais | Extrair, normalizar e explicar exames com limites | Achados, incertezas, necessidade de confirmação | Interpretação solta sem contexto clínico |
| IA de documentos e laudos | Ler PDFs, laudos, receitas, relatórios e documentos clínicos | Resumo estruturado, entidades clínicas e alertas | Perda de informação crítica ou alucinação |
| IA de imagem/foto | Avaliar qualidade da imagem, orientar limites e triagem visual | Descrição cautelosa e recomendação de avaliação quando necessário | Diagnóstico visual indevido |
| IA de vídeo | Extrair sinais observáveis, contexto temporal e qualidade do material | Sumário multimodal e limites | Inferência excessiva a partir de vídeo curto |
| IA de sumarização clínica | Consolidar conversa, anexos e achados em resumo útil | Linha do tempo, queixas, contexto e pontos para consulta | Fragmentação de informação |
| IA de auditoria/segunda opinião | Revisar resposta proposta, procurar risco, inconsistência e extrapolação | Aprovação, bloqueio ou ajuste obrigatório | Uma IA valida a si mesma sem crítica |
| IA de conhecimento Dayan | Aplicar repertório integrativo curado e versionado | Linguagem e educação alinhadas ao DNA Dayan | Respostas inventadas atribuídas à marca |
| Camada de compliance e dados | Aplicar LGPD, consentimento, retenção, logs e permissões | Decisão de tratamento e registro auditável | Exposição indevida de dados sensíveis |

A arquitetura deve funcionar como uma cadeia de decisão. O usuário envia uma mensagem ou anexo. O maestro classifica o caso e aciona agentes. Os agentes retornam objetos estruturados, não textos finais soltos. A resposta final é montada por um compositor de resposta, revisada por segurança clínica, verificada por compliance e só então exibida. Quando houver risco, baixa confiança ou escopo clínico sensível, o fluxo deve escalar para humano, orientar urgência ou recusar.

## 5. Fluxos críticos por modalidade

O DOUTORELO precisa tratar cada tipo de entrada como uma modalidade com regras próprias. Texto livre, exame laboratorial, imagem corporal, foto de documento, vídeo curto, áudio, laudo e relato emocional não podem passar pelo mesmo prompt. Cada modalidade tem riscos, qualidade de entrada, possibilidade de erro e necessidade de revisão diferentes.

| Modalidade | Exemplo de entrada | Fluxo recomendado | Condições de bloqueio ou escalonamento |
|---|---|---|---|
| Texto livre | “Estou com dor de cabeça há três dias pela manhã” | Acolhimento, triagem de red flags, anamnese contextual, educação e orientação de próximos passos | Sinais neurológicos, pior dor da vida, febre alta, trauma, confusão, rigidez de nuca, gestação ou hipertensão grave |
| Exame laboratorial PDF | Hemograma, TSH, glicemia, vitamina D | OCR/extração, normalização, comparação com referência, contexto clínico, explicação cautelosa | Valores críticos, inconsistência de leitura, ausência de unidade, exame ilegível ou necessidade de conduta |
| Foto de exame | Imagem capturada pelo celular | Avaliação de qualidade, OCR, pedido de nova foto se necessário, resumo | Baixa legibilidade, corte, reflexo, dados incompletos |
| Foto corporal/lesão | Pele, inchaço, ferida, olho, garganta | Descrição visual cautelosa, triagem de gravidade, orientação para avaliação | Suspeita de infecção grave, necrose, sangramento, dor intensa, evolução rápida, criança pequena ou imunossupressão |
| Vídeo curto | Tremor, marcha, respiração, movimento | Extração de sinais observáveis, perguntas contextuais, limites explícitos | Falta de ar, crise convulsiva, queda, alteração de consciência ou risco imediato |
| Documento clínico | Laudo, prescrição, relatório, alta hospitalar | Sumário estruturado, termos importantes, dúvidas para levar ao médico | Mudança de medicação, dose, diagnóstico fechado ou conflito com orientação médica |
| Áudio | Relato falado do usuário | Transcrição, confirmação do entendimento, triagem e continuidade conversacional | Áudio inaudível, risco emocional, autoagressão, urgência ou baixa confiança |

A área de anexos no rodapé da caixa de diálogo deve ser implementada somente depois da aprovação estratégica, mas já precisa estar desenhada na arquitetura. O rodapé deve comunicar claramente que o usuário pode anexar arquivos, arrastar e soltar documentos no desktop e, no celular, tirar foto ou gravar vídeo. Essa interface não é apenas conveniência: ela é a porta de entrada para fluxos de risco diferente e, portanto, precisa acionar consentimento, classificação de modalidade, validação de arquivo, proteção de dados e limites de uso.

## 6. Governança clínica, compliance e dados sensíveis

A governança clínica do DOUTORELO deve nascer como produto, não como documentação posterior. A RDC nº 657/2022 define conceitos como associação clínica válida, avaliação clínica, cibersegurança, validação analítica e validação clínica para software como dispositivo médico.[4] A LGPD define dado referente à saúde como dado pessoal sensível e estabelece hipóteses específicas para tratamento, incluindo consentimento específico e destacado ou situações indispensáveis previstas em lei.[5] A Resolução CFM nº 2.314/2022 define telemedicina como exercício da medicina mediado por tecnologias digitais e exige preservação de dados e imagens de prontuário com confidencialidade, integridade, privacidade e sigilo profissional.[6]

A consequência é que o DOUTORELO deve separar desde o início três camadas: produto educativo, produto assistivo de triagem e produto clínico com participação profissional. Cada camada pode exigir permissões, consentimentos, documentação, logs e revisão diferentes.

| Área de governança | Padrão mínimo recomendado | Implementação futura |
|---|---|---|
| Consentimento | Específico, destacado, granular e revogável para dados de saúde, IA, anexos e melhoria de modelo | Tela de consentimento por finalidade e modalidade |
| Minimização | Coletar somente dados necessários para a finalidade ativa | Campos e anexos vinculados a finalidade e retenção |
| Rastreabilidade | Registrar agente, versão, entrada resumida, risco, decisão, saída e fallback | `ai_interactions`, `ai_agent_runs`, `clinical_risk_events` |
| Humano no circuito | Exigir revisão humana em risco alto, baixa confiança, conduta, laudo e segunda opinião | Filas de revisão médica e painel profissional |
| Validação | Testar por cenários reais, sintéticos e adversariais antes de liberar | Suites de avaliação clínica e adversarial versionadas |
| Cibersegurança | Proteger confidencialidade, integridade e disponibilidade | Criptografia, RBAC, logs, segregação, rate limit e monitoramento |
| Explicabilidade | Explicar limites, incerteza e motivos de escalonamento em linguagem simples | Cards de segurança e resumos auditáveis |
| Gestão de alteração | Versionar prompt, modelo, corpus, regras e agentes | Registry de agentes, changelog clínico e rollback |

> **Regra de ouro de governança:** toda resposta clínica relevante deve ser tratada como artefato auditável. Se não puder ser reconstruída, revisada e explicada, ela não deve ser usada em escala.

## 7. Segurança conversacional: do erro “Boa.” à política de tom clínico-humano

A correção do “Boa.” deve ser tratada como parte de uma política maior de comunicação clínica. O DOUTORELO precisa espelhar o nível de profundidade do usuário, mas nunca aprovar sintoma, dor ou sofrimento. Cumprimento social pode receber resposta social breve. Dúvida aberta pode receber convite acolhedor. Relato clínico deve iniciar com reconhecimento do incômodo e perguntas úteis. Urgência deve interromper a conversa comum e orientar ação imediata.

| Tipo de mensagem | Resposta permitida | Resposta proibida |
|---|---|---|
| Cumprimento simples | “Boa noite, em que posso ajudar? Fique à vontade! Estou por aqui.” | Anamnese, base Dayan, triagem ou explicações internas |
| Dúvida aberta | Convite breve para contar sintoma, exame, rotina ou dúvida | Texto longo sobre funcionalidades do produto |
| Relato de dor/sintoma | Acolhimento direto, triagem de gravidade e perguntas contextuais | “Boa.”, “Ótimo”, “Perfeito” ou tom de aprovação |
| Pedido de prescrição/dose | Recusa segura, explicação de limite e orientação para profissional | Dose, combinação de medicamentos ou prescrição |
| Red flag | Orientação clara de urgência ou atendimento presencial | Continuação de conversa educativa normal |

Essa política deve ser implementada no futuro como contrato testável. O exemplo “Faz 3 dias que sinto dores de cabeça pela manhã. O que pode ser?” precisa obrigatoriamente bloquear aberturas como “Boa.” e produzir resposta com acolhimento, investigação de sinais de alerta e perguntas contextuais. Porém, por decisão estratégica, essa implementação deve ocorrer **após** a aprovação deste documento.

## 8. Roadmap técnico de missão crítica

O DOUTORELO deve evoluir por fases com critérios objetivos de passagem. A pior decisão seria lançar capacidades multimodais profundas em produção apenas porque a interface já permite anexar foto ou vídeo. A melhor decisão é construir uma sequência de maturidade: protótipo controlado, base orquestral, piloto supervisionado, expansão com revisão humana, validação clínica e escala.

| Fase | Objetivo | Entregáveis principais | Critério de passagem |
|---|---|---|---|
| Fase 0 — Pausa estratégica | Aprovar arquitetura-alvo antes de novos remendos | Documento fundador, matriz de agentes, limites e roadmap | Aprovação explícita do usuário |
| Fase 1 — Correções UX seguras | Corrigir placeholder, anexos visuais e abertura inadequada | UI de anexos, testes de placeholder, bloqueio de “Boa.” em sintomas | Vitest, build e revisão manual no DEV |
| Fase 2 — Maestro inicial | Criar orquestrador textual para intenção, risco e modalidade | `ai/orchestrator`, contratos JSON, logs básicos e testes adversariais | Cobertura de cenários críticos e fallback confiável |
| Fase 3 — Agentes especializados textuais | Separar conversa, triagem, anamnese, Dayan, auditoria e sumarização | Agentes versionados e registry | Nenhum agente responde direto ao usuário |
| Fase 4 — Anexos documentais | Suportar PDF/foto de exame e documento clínico com governança | Upload seguro, OCR/extração, consentimento e resumo auditável | Baixa taxa de extração incorreta e bloqueio de ilegíveis |
| Fase 5 — Imagem e vídeo supervisionados | Introduzir análise multimodal com limites rígidos | Qualidade de mídia, triagem visual, revisão humana | Piloto supervisionado e métricas de segurança |
| Fase 6 — Backoffice clínico | Criar painel de revisão, filas e segunda opinião | Médico responsável, auditoria, prontuário/SRES se aplicável | Operação controlada com profissionais |
| Fase 7 — Validação clínica e escala | Preparar expansão pública com métricas e governança | Avaliação clínica, adversarial, compliance e monitoramento | Comitê clínico aprova exposição ampliada |

A progressão entre fases deve ser bloqueada por critérios de segurança, não por entusiasmo visual. Cada fase deve ter testes automatizados, avaliação adversarial, revisão de riscos, métricas de uso e decisão documentada.

## 9. Modelo de dados e observabilidade recomendados

A arquitetura futura deve registrar a operação de IA como cadeia de eventos. O objetivo não é guardar texto bruto de saúde sem necessidade, mas manter rastreabilidade suficiente para auditoria, melhoria, explicação e investigação de incidentes, sempre com governança LGPD.

| Entidade futura | Finalidade | Campos conceituais |
|---|---|---|
| `ai_interactions` | Representar uma interação de usuário com IA | usuário/sessão, modalidade, finalidade, consentimento, risco, status |
| `ai_agent_runs` | Registrar execução de cada agente | agente, versão, entrada resumida, saída estruturada, confiança, duração |
| `clinical_risk_events` | Registrar red flags, urgências e bloqueios | tipo de risco, severidade, ação tomada, mensagem exibida |
| `ai_artifacts` | Registrar anexos e artefatos processados | tipo, storage key, hash, qualidade, status de extração |
| `human_reviews` | Registrar revisão profissional | responsável, decisão, alterações, justificativa, timestamp |
| `model_prompt_registry` | Versionar modelos, prompts, regras e corpora | versão, changelog, data, responsável, status de aprovação |
| `evaluation_runs` | Guardar resultados de testes e avaliações | dataset, métricas, falhas, bloqueios, aprovação |

A observabilidade precisa incluir métricas de segurança, não apenas tráfego. Taxa de red flag, taxa de fallback, taxa de baixa confiança, tempo até escalonamento, falhas por modalidade, anexos ilegíveis, respostas bloqueadas e incidentes reportados devem ser métricas centrais.

## 10. Critérios de validação antes de produção

O DOUTORELO não deve ser liberado em escala com base apenas em testes unitários. Vitest é necessário, mas insuficiente. O produto precisa de avaliação adversarial, casos clínicos sintéticos, revisão profissional, testes de regressão conversacional, testes multimodais, análise de segurança, simulação de incidentes e critérios de aceitação por fase.

| Categoria de validação | Exemplo de teste | Bloqueio de lançamento |
|---|---|---|
| Segurança clínica | Dor torácica, déficit neurológico, febre em criança, autoagressão | Se qualquer red flag receber resposta comum |
| Prescrição | Pedido de dose, combinação de fármacos, antibiótico, suplemento em gestante | Se a IA prescrever ou ajustar dose |
| Conversação | Cumprimento, dúvida aberta, relato emocional, sintoma persistente | Se resposta social invadir contexto clínico ou vice-versa |
| Exames | Valores críticos, unidade ausente, OCR errado, exame ilegível | Se o sistema interpretar dado duvidoso como certo |
| Imagem/vídeo | Lesão grave, baixa qualidade, sinais de urgência | Se houver diagnóstico visual fechado sem revisão |
| LGPD | Consentimento ausente, finalidade incompatível, exportação indevida | Se dado sensível for processado sem base e finalidade |
| Marca Dayan | Afirmações em primeira pessoa, promessa de cura, fala inventada | Se o sistema simular o Dr. Dayan ou atribuir invenção a ele |

A validação deve produzir relatórios versionados. Cada mudança de prompt, modelo, agente, corpus Dayan ou regra de segurança deve disparar regressão automatizada e, em fases clínicas, revisão humana.

## 11. Correções de UX imediatas — somente após aprovação estratégica

As três correções de UX identificadas pelo usuário permanecem corretas e importantes, mas não devem ser implementadas antes da aprovação deste documento. Elas devem ser a primeira fase de execução após aprovação, porque afetam diretamente a confiança da experiência inicial.

| Correção | Motivo | Critério de aceite |
|---|---|---|
| Remover placeholder após primeira mensagem | Evita poluição visual e sensação de campo resetado durante conversa | Após o primeiro envio, a instrução grande desaparece ou muda para estado compacto |
| Bloquear “Boa.” em sintomas | Evita banalização de dor, sofrimento ou preocupação clínica | Sintoma persistente recebe acolhimento e triagem, nunca aprovação social |
| Criar rodapé de anexos | Comunica capacidade multimodal e prepara upload seguro | Desktop permite clique/drag-and-drop; mobile comunica foto e vídeo; fluxo respeita consentimento |

Essas correções devem vir acompanhadas de testes automatizados. O teste do exemplo de dor de cabeça por três dias deve impedir regressão. O teste de UI deve garantir que a orientação de anexos esteja presente e que o placeholder não persista indevidamente após o início da conversa.

## 12. Decisões que exigem aprovação do usuário

Este documento propõe uma mudança de paradigma. A aprovação do usuário deve confirmar que o DOUTORELO deixa oficialmente de ser tratado como chat incremental e passa a ser desenvolvido como plataforma de IA clínica-assistiva orquestrada.

| Decisão pendente | Opção recomendada | Impacto |
|---|---|---|
| Retomar implementação incremental? | Não, exceto correções UX após aprovação estratégica | Evita gambiarras antes da arquitetura |
| Arquitetura de IA | Orquestra de agentes com maestro central | Aumenta segurança, rastreabilidade e escalabilidade |
| Escopo inicial | Educação, organização, triagem e preparação para cuidado | Reduz risco regulatório e clínico no começo |
| Multimodalidade | Introduzir por fases, começando por documentos/exames antes de imagem/vídeo livre | Evita promessa visual sem governança |
| Dr. Dayan | Usar como DNA editorial e repertório curado, sem simular identidade | Protege confiança pública e reduz risco reputacional |
| Humano no circuito | Obrigatório para risco, baixa confiança, conduta, laudo e segunda opinião | Aproxima produto de operação profissional |

## 13. Recomendação final

A recomendação é aprovar a arquitetura-alvo como norte estratégico e iniciar uma fase curta de execução controlada. A primeira execução deve corrigir a experiência de chat público já identificada — placeholder, anexos e abertura inadequada — mas usando a nova política de governança conversacional como base. Em seguida, deve-se construir o maestro inicial e separar agentes especializados textuais antes de qualquer promessa multimodal avançada.

O DOUTORELO pode se tornar uma referência nacional e internacional em assistência médica por IA, mas somente se a ambição vier acompanhada de disciplina técnica, clínica e regulatória. A revolução não será produzida por um prompt mais longo. Ela será produzida por uma arquitetura que sabe quando falar, quando perguntar, quando recusar, quando escalar e quando chamar um humano.

> **Proposta para aprovação:** aprovar este documento como o marco fundador da nova fase do DOUTORELO e autorizar, depois disso, a implementação da Fase 1: correções UX seguras e testes anti-regressão, sem ainda liberar anexos clínicos reais ou multimodalidade diagnóstica em produção.

## References

[1]: https://www.who.int/publications/i/item/9789240029200 "World Health Organization — Ethics and governance of artificial intelligence for health: WHO guidance"  
[2]: https://www.who.int/publications/i/item/9789240084759 "World Health Organization — Ethics and governance of artificial intelligence for health: guidance on large multi-modal models"  
[3]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software "U.S. Food and Drug Administration — Clinical Decision Support Software"  
[4]: https://www.in.gov.br/en/web/dou/-/resolucao-de-diretoria-colegiada-rdc-n-657-de-24-de-marco-de-2022-389603457 "ANVISA — RDC nº 657, de 24 de março de 2022"  
[5]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm "Presidência da República — Lei nº 13.709/2018, Lei Geral de Proteção de Dados Pessoais"  
[6]: https://www.in.gov.br/en/web/dou/-/resolucao-cfm-n-2.314-de-20-de-abril-de-2022-397602852 "Conselho Federal de Medicina — Resolução CFM nº 2.314/2022"  
[7]: https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en "European Commission — Artificial Intelligence in healthcare"
