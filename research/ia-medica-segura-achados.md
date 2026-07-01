# Pesquisa — IA médica segura, benchmarks e vacinas anti-alucinação

## OMS — Ética e governança de IA em saúde

A Organização Mundial da Saúde publicou a diretriz **Ethics and governance of artificial intelligence for health**, produzida após dezoito meses de deliberação com especialistas em ética, tecnologia digital, direito, direitos humanos e ministérios da saúde. A página da OMS afirma que tecnologias de IA em saúde prometem melhorar diagnóstico, tratamento, pesquisa e funções de saúde pública, mas devem colocar **ética e direitos humanos no centro do desenho, implantação e uso**. A diretriz identifica riscos e desafios éticos e apresenta seis princípios consensuais para que a IA opere em benefício público.

Aplicação ao DOUTORELO: toda resposta da IA central deve ser desenhada como suporte educativo e organizacional, com supervisão humana, transparência, rastreabilidade, proteção de dados, não substituição de consulta e atenção explícita a segurança do paciente.

Fonte: https://www.who.int/publications/i/item/9789240029200

## HealthBench — avaliação médica realista por rubricas clínicas

A referência **HealthBench** descreve uma avaliação de modelos de IA em cenários realistas de saúde. A abordagem usa rubricas escritas por médicos para cada conversa, definindo o que uma resposta ideal deve incluir ou evitar. A página relata 5.000 conversas clínicas realistas e 48.562 critérios únicos de rubrica, com eixos visíveis como encaminhamentos de emergência, resposta sob incerteza, tarefas com dados de saúde, comunicação adaptada ao nível de expertise, busca de contexto, profundidade da resposta, qualidade da comunicação, seguimento de instruções, acurácia, consciência de contexto e completude.

Aplicação ao DOUTORELO: os testes da IA central devem ir além de “respondeu certo/errado”. Precisam de rubricas por caso: se identificou red flags, se pediu contexto antes de orientar, se declarou incerteza, se evitou prescrição, se traduziu o tema em linguagem popular, se respeitou limites de segurança e se não alucinou fonte ou recomendação.

Fonte: https://openai.com/index/healthbench/

## npj Digital Medicine — framework para segurança clínica e alucinações em sumarização médica

O artigo **A framework to assess clinical safety and hallucination rates of LLMs for medical text summarisation**, publicado em *npj Digital Medicine*, propõe uma estrutura de avaliação com **clínico no loop** para medir alucinações e omissões em documentação clínica produzida por LLMs. A taxonomia central distingue alucinações de omissões e classifica os erros como **maiores** ou **menores**, conforme potencial impacto em diagnóstico ou manejo do paciente. As alucinações são subdivididas em fabricação, negação, causalidade indevida e contextualização errada. As omissões são organizadas em problemas atuais, histórico médico/medicamentoso/familiar/social e informação/plano. O estudo também recomenda configuração reprodutível de experimentos, variação de apenas um parâmetro por vez, temperatura baixa, revisão por pelo menos dois médicos e consolidação por clínicos seniores.

Aplicação ao DOUTORELO: a IA central precisa de uma taxonomia interna de erro clínico, uma matriz de severidade, registro de experimento, testes regressivos e revisão humana em casos de alto impacto. Para respostas clínicas, os guardrails devem bloquear fabricação, negação de fato fornecido pelo usuário, causalidade não evidenciada e mistura de contextos. Em resumos longitudinais, também devem sinalizar omissões críticas de medicamentos, alergias, sintomas de alarme e plano acordado.

Fonte: https://www.nature.com/articles/s41746-025-01670-7

## CFM — Resolução nº 2.454/2026 e limites brasileiros para IA na medicina

O Conselho Federal de Medicina informa que a Resolução CFM nº 2.454/2026 normatiza o uso de IA na medicina no Brasil. A norma assegura o uso de IA como apoio à decisão clínica, gestão em saúde, pesquisa e educação médica continuada, mas reforça que a **palavra final sobre decisões diagnósticas, terapêuticas e prognósticas é sempre do médico**. A IA deve ser exclusivamente ferramenta de apoio, sem comprometer relação médico-paciente, escuta qualificada, empatia, confidencialidade e dignidade. O paciente deve ser informado de forma clara sempre que IA for usada como apoio relevante. A resolução proíbe delegar à IA a comunicação de diagnósticos, prognósticos ou decisões terapêuticas, exige supervisão humana obrigatória, julgamento crítico, governança, auditoria, monitoramento, capacitação, classificação de risco e observância rigorosa da LGPD.

Aplicação ao DOUTORELO: a IA central deve operar como educação, organização, triagem de contexto e preparação para decisão médica, nunca como diagnóstico, prognóstico ou prescrição autônoma. Qualquer saída de alto risco deve conter encaminhamento para profissional, registrar incerteza, evitar autoridade final e preservar auditabilidade. No produto, isso vira contrato técnico: `decisionAuthority = "physician_or_licensed_professional"`, `aiRole = "support_only"`, `prohibitedActs = [diagnosis_communication, therapeutic_decision, prognosis_communication, prescription]`, `requiresHumanReview` para alto risco.

Fonte: https://portal.cfm.org.br/noticias/cfm-normatiza-uso-da-ia-na-medicina/

## Med-PaLM / MultiMedQA — benchmarks de conhecimento clínico e avaliação humana

O artigo **Large language models encode clinical knowledge**, publicado na *Nature*, apresenta o benchmark **MultiMedQA**, que combina seis datasets médicos já existentes, cobrindo medicina profissional, pesquisa e perguntas de consumidores, além do novo **HealthSearchQA**, composto por perguntas médicas buscadas online. O trabalho cita como componentes relevantes **MedQA**, **MedMCQA**, **PubMedQA** e tópicos clínicos do **MMLU**, além de uma estrutura de avaliação humana em eixos como factualidade, compreensão, raciocínio, possível dano e viés. O estudo mostra ganhos com escala e ajuste por instrução, mas reforça que mesmo modelos especializados permanecem inferiores a clínicos e exigem avaliação rigorosa antes de uso seguro.

Aplicação ao DOUTORELO: a suíte de avaliação deve combinar conhecimento médico geral, perguntas populares brasileiras, perguntas integrativas, tarefas de explicação em linguagem simples e rubricas humanas. O objetivo não é apenas acertar múltipla escolha, mas demonstrar factualidade, compreensão do contexto, raciocínio prudente, baixo potencial de dano, baixa tendência a viés e capacidade de dizer “não sei” quando necessário.

Fonte: https://www.nature.com/articles/s41586-023-06291-2

## FDA / IMDRF — Good Machine Learning Practice para software médico

A FDA descreve os princípios de **Good Machine Learning Practice** para desenvolvimento de dispositivos médicos com IA/ML, destacando que essas tecnologias podem transformar a saúde, mas trazem considerações únicas pela complexidade, natureza iterativa e dependência de dados. A referência aponta para princípios internacionais do IMDRF para promover desenvolvimento seguro, efetivo e de alta qualidade ao longo de todo o ciclo de vida do produto.

Aplicação ao DOUTORELO: a IA central deve ser tratada como produto clínico-digital com ciclo de vida controlado: dados documentados, versionamento de prompts e políticas, testes antes de publicação, monitoramento pós-uso, avaliação de drift, trilhas de auditoria, controle de mudanças e governança para qualquer ampliação de autonomia.

Fonte: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles
