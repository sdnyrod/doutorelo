# Arquitetura de IA clínica e Machine Learning governado

Autor: **Manus AI**  
Projeto: **Saúde Integrativa IA DEV**  
Status: **fundação arquitetural para MVP DEV e evolução regulada**

## Princípio central

> **Responder com segurança ou não responder.** A IA do produto não deve ser desenhada para sempre produzir uma resposta. Ela deve ser desenhada para reconhecer incerteza, lacunas de contexto, risco clínico, escopo fora do permitido e ausência de base suficiente. Nesses casos, a resposta correta é declarar limitação, pedir mais contexto ou escalar para atendimento humano.

Esta arquitetura interpreta “IA digna de 100% de confiabilidade” como **confiabilidade operacional de comportamento**, não como onisciência clínica. O compromisso técnico é que o sistema tenha guardrails para **não inventar, não diagnosticar, não prescrever e não ocultar incerteza**. A literatura regulatória e de governança trata IA em saúde como sistema de risco que exige desenho, avaliação, monitoramento e ciclo de vida controlado; o NIST AI RMF propõe incorporar confiabilidade no desenho, desenvolvimento, uso e avaliação de sistemas de IA, enquanto a FDA destaca que IA/ML em saúde possui complexidade e natureza iterativa/data-driven que exigem boas práticas ao longo do ciclo de vida do produto.[1] [2]

## Modelo operacional de confiança

| Camada | Função | Regra de segurança | Evidência gerada |
|---|---|---|---|
| Entrada e consentimento | Validar LGPD, intenção, idade/contexto e completude mínima | Sem consentimento ou contexto mínimo, não processar dado sensível | Evento de consentimento, motivo de bloqueio e timestamp |
| Classificador determinístico | Detectar red flags, urgência, autoagressão e escopo proibido | Red flag sempre aciona fallback humano/emergência | `redFlag`, `severity`, `fallbackToHuman` |
| LLM restritivo | Produzir orientação educativa quando o caso é seguro e dentro do escopo | Proibido inventar, diagnosticar, prescrever ou dar certeza clínica | Resposta estruturada com `confidence`, `uncertaintyReason`, `safetyActions` |
| Verificador anti-alucinação | Checar se a saída viola escopo, contém prescrição, diagnóstico ou certeza indevida | Violação converte a saída em recusa segura | `guardrailDecision`, violações detectadas |
| Recuperação baseada em conhecimento | Restringir respostas a fontes aprovadas quando houver biblioteca clínica validada | Sem fonte aprovada, declarar incerteza | IDs de fontes, versão da base, cobertura |
| Humano no circuito | Escalar casos incertos, urgentes, complexos ou sensíveis | IA não toma decisão clínica final | Fila, prioridade, motivo e trilha de auditoria |
| Avaliação contínua | Medir qualidade, segurança, falsos negativos, recusas corretas e satisfação | Modelo/prompt só evolui após avaliação documentada | Dataset, versão, métricas, aprovação |

## Estrutura de Machine Learning desde já

O MVP DEV não deve começar por “treinar um modelo” sem governança. A fundação correta é criar uma **estrutura de MLOps clínico** para que qualquer modelo, prompt ou base de conhecimento seja versionado, avaliado e rastreável. O treinamento futuro deve ser separado em conjuntos de dados anonimizados, curados e aprovados, com métricas específicas de segurança clínica.

| Artefato | Objetivo | MVP DEV | Evolução posterior |
|---|---|---|---|
| Dataset de avaliação | Casos sintéticos e reais anonimizados para testar segurança | Casos sintéticos de red flags, incerteza e escopo proibido | Dados reais consentidos, anonimizados e revisados por médicos |
| Feature store conceitual | Variáveis seguras para triagem e personalização | Contrato de features documentado | Pipeline real com versionamento e controle de drift |
| Prompt registry | Versionar prompts, instruções e políticas | Constantes versionadas no backend | Registro com aprovações clínicas e rollback |
| Model registry | Versionar modelos usados e parâmetros | `clinical-safety-v0` como camada lógica | Modelos próprios/externos com métricas comparáveis |
| Evaluation harness | Rodar bateria anti-alucinação e segurança | Vitest com casos determinísticos | Avaliação offline/online, revisão humana e métricas por segmento |
| Audit log | Registrar decisões críticas da IA | Tracking estruturado de triagem | Persistência em banco, exportação e investigação de incidentes |

## Política anti-alucinação

A IA deve assumir que **uma resposta incompleta e honesta é superior a uma resposta fluente e insegura**. Portanto, todo fluxo clínico deve obedecer aos seguintes invariantes verificáveis por teste automatizado: a resposta não pode afirmar diagnóstico definitivo; não pode recomendar medicamento, dose, suplemento ou tratamento como prescrição; não pode minimizar sinais de alerta; não pode afirmar certeza sem evidência; deve conter disclaimer claro; e deve indicar próximo passo humano quando houver risco ou incerteza relevante.

| Situação | Comportamento correto | Comportamento proibido |
|---|---|---|
| Sintoma urgente | Orientar emergência e fallback humano | Dar dicas caseiras como solução suficiente |
| Contexto insuficiente | Dizer que não sabe com segurança e pedir informações | Inferir diagnóstico provável sem base |
| Pedido de prescrição | Recusar prescrição e orientar consulta | Sugerir dose, remédio ou protocolo |
| Suplemento/produto | Linguagem comercial/educativa, sem promessa clínica | Prometer cura, tratamento ou resultado |
| Conteúdo fora de escopo | Redirecionar ou recusar | Responder por improviso |

## Fronteiras regulatórias e de produto

No estágio atual, o app deve ser posicionado como **copiloto educativo, organizador de jornada, triagem de segurança e ponte para profissionais habilitados**. Ele não deve ser apresentado como diagnóstico automatizado, prescrição automatizada ou substituto de médico. Caso a ambição evolua para Software as a Medical Device ou tomada de decisão clínica autônoma, o roadmap precisará incluir validação clínica formal, sistema de qualidade, gerenciamento de risco, documentação regulatória e supervisão médica especializada.

## Roadmap técnico imediato

A próxima implementação no backend deve criar uma camada `server/ai/clinicalSafety.ts` com contrato estruturado para avaliação clínica segura. Essa camada deve encapsular regras determinísticas, política de incerteza, prompt restritivo e verificação anti-alucinação. O roteador de triagem deve passar a retornar `aiGovernance`, `confidence`, `uncertaintyReason`, `modelPolicyVersion` e `guardrailDecision`, mesmo que a chamada real ao LLM seja introduzida progressivamente. Isso cria a estrutura de Machine Learning desde já sem fingir que há treinamento clínico validado antes de existir dataset, avaliação e aprovação médica.

## Referências

[1]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"
[2]: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles "Good Machine Learning Practice for Medical Device Development: Guiding Principles | FDA"
