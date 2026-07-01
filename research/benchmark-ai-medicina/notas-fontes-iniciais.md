# Notas iniciais do benchmark global de IA medicinal

## Fonte 1 — Rest of World, 30 jan. 2026: Ant Afu / Ant Group

A reportagem afirma que o chatbot **Ant Afu**, da Ant Group, atingiu **30 milhões de usuários ativos mensais** até janeiro de 2026. O produto é descrito como um companheiro de saúde com capacidades agentivas: responde dúvidas de saúde, sugere consultas hospitalares, analisa exames, envia lembretes de exercício/medicação e opera dentro do ecossistema Alipay, com consultas, pagamentos e reembolso/seguro. A fonte também informa que a Ant adquiriu a Haodf em janeiro de 2025, portal com mais de **300 mil médicos registrados**, e que Ant Afu entrou entre os 10 apps iOS mais baixados na China conforme Sensor Tower citada pela reportagem.

Implicação preliminar para DOUTORELO: o padrão chinês vencedor parece não ser apenas “chatbot médico”, mas **chat + marca afetiva + infraestrutura transacional + rede médica + exames + seguro/pagamento + distribuição massiva**.

URL: https://restofworld.org/2026/ai-health-care-is-taking-off-in-china-led-by-jack-mas-ant-group/

## Fonte 2 — Healthcare IT News Asia, 4 mar. 2025: Ping An Xin Yi / Ping An Health

A reportagem descreve o **Ping An Xin Yi**, recurso de chatbot generativo no app da Ping An Health com **avatares digitais de médicos reais**, interação síncrona por texto, voz e vídeo, consulta assistida 24/7, interpretação simplificada de relatórios/laboratórios e lembretes personalizados de medicação. A arquitetura citada usa três camadas de treinamento: modelo médico base da Ping An com cinco bases médicas, 37 mil doenças e 420 mil termos relacionados; base de conhecimento do médico representado pelo avatar; e fine-tuning/anotação feita pelo próprio médico, inclusive com conteúdo em vídeo. A cobertura inicial é clínica geral, com expansão planejada para ginecologia, medicina interna, pediatria, cirurgia, andrologia, medicina tradicional chinesa, dermatologia e medicina geral.

Implicação preliminar para DOUTORELO: há convergência direta com a ideia de **RAG auditável sobre vídeos do Dr. Dayan**, mas a Ping An leva isso a uma camada de “avatar médico” e treinamento supervisionado por especialista. Para o DOUTORELO, a conclusão não é imitar avatar, e sim transformar os vídeos em **fonte auditável, versionada e revisável**, preservando anti-impersonação e governança clínica.

URL: https://www.healthcareitnews.com/news/asia/ping-launches-ai-avatars-top-chinese-doctors

## Fonte 3 — Ada Health, site oficial

A Ada se posiciona como uma avaliação de sintomas com IA otimizada por clínicos. O site enfatiza **symptom assessment**, biblioteca médica criada por médicos e conteúdo educativo para apoiar decisões de saúde. A experiência parece centrada em triagem estruturada, educação e parcerias corporativas, mais do que em um superapp transacional integrado a consultas, pagamentos e exames.

Implicação preliminar para DOUTORELO: Ada é referência em **clareza de triagem, linguagem acessível e confiança clínica**, mas não parece representar o modelo mais completo de ecossistema vivo que o DOUTORELO busca.

URL: https://ada.com/

## Fonte 4 — K Health, site oficial

A K Health se posiciona como acesso 24/7 a medicina de alta qualidade, com **AI Physician Mode** integrado a grandes sistemas de saúde. A página destaca um modelo híbrido que conecta cuidado virtual e presencial ao longo do continuum de cuidado, com parcerias como Cedars-Sinai, Hackensack Meridian Health e Hartford HealthCare citadas na página. A comunicação é mais B2B/B2B2C e institucional, com forte ênfase em integração com sistemas de saúde.

Implicação preliminar para DOUTORELO: K Health mostra que o chat de IA tende a ganhar força quando vira **porta de entrada operacional para atenção primária**, não apenas assistente de perguntas. A diferença crítica em relação ao DOUTORELO é a necessidade de combinar IA, rede humana, acompanhamento longitudinal e governança de qualidade.

URL: https://khealth.com/

## Fonte 5 — Ping An Group, página oficial Health and Senior Care

A Ping An descreve sua estratégia como **finanças integradas + saúde e senior care**, sustentada por um ecossistema que combina seguradora/pagador, rede médica, serviços online e offline, hospitais, farmácias e cuidado domiciliar. A página informa que, em 2024, o ecossistema serviu quase 67 mil clientes corporativos; a Ping An Health tinha mais de 31 milhões de usuários pagantes em negócios estratégicos; o Ping An Family Doctor serviu mais de 14 milhões de membros, com média de cinco usos por pessoa; e a rede doméstica incluía 50 mil médicos próprios/contratados, parcerias com mais de 36 mil hospitais, mais de 104 mil instituições de gestão de saúde e 235 mil farmácias.

Implicação preliminar para DOUTORELO: Ping An confirma que o padrão mais forte na China é **ecossistema integrado**, não chatbot isolado. O chat funciona como front door para consultas, triagem, agendamento, acompanhamento, farmácia, seguro e cuidado longitudinal.

URL: https://group.pingan.com/about_us/our_businesses/health-and-senior-care.html

## Fonte 6 — JD Health, página oficial de relatórios financeiros

A página de RI da JD Health lista relatórios de 2025, incluindo o **2025 Annual Report** e o **2025 Environmental, Social and Governance Report**. Ainda será necessário abrir ou extrair os documentos para buscar dados sobre IA, farmácia online, consulta médica, usuários e iniciativas de doctor/chatbot digital.

Implicação preliminar para DOUTORELO: JD Health deve permanecer no radar porque combina forte distribuição de e-commerce/farmácia com consulta online e iniciativas de IA, mas sua profundidade no benchmark depende da leitura do relatório anual e de fontes complementares.

URL: https://ir.jdhealth.com/en/ir_report.php

## Fonte 7 — GlobeNewswire / Research and Markets, 18 jul. 2025: líderes da telemedicina chinesa

A fonte identifica **Ping An Good Doctor, WeDoctor, JD Health e AliHealth/Alibaba Health** como líderes do mercado chinês de telemedicina em 2025. O texto cita que o mercado chinês de telemedicina foi avaliado em USD 6,65 bilhões em 2024 e projeta USD 18,93 bilhões até 2034. O artigo descreve Ping An Good Doctor com consultas online 24/7, prescrições, entrega de medicamentos, gestão de doenças crônicas e sistema de consulta com IA; WeDoctor com consultas, marcação hospitalar, diagnóstico cloud e integração com hospitais públicos e seguradoras; JD Health com teleconsultas, farmácia digital, cuidado crônico, bem-estar e centro de saúde mental com chatbot; e AliHealth com telemedicina, prescrições eletrônicas e entrega de medicamentos apoiada por e-commerce e cloud.

Implicação preliminar para DOUTORELO: a seleção chinesa tradicional para benchmark deve incluir **Ping An, WeDoctor, JD Health e Alibaba Health/AliHealth**, mas a ascensão de Ant AQ/Afu exige incluí-la como player de IA-native, possivelmente até acima de alguns incumbentes tradicionais para análise de chat.

URL: https://www.globenewswire.com/news-release/2025/07/18/3117756/28124/en/ping-an-good-doctor-wedoctor-guahao-jd-health-international-and-alihealth-alibaba-health-lead-china-s-telemedicine-market-in-2025-industry-to-reach-usd-18-93-billion-by-2034.html

## Fonte 8 — Ant Group, 23 fev. 2026: AQ / Ant Afu

A Ant Group anunciou que o app de saúde com IA **AQ** ultrapassou **100 milhões de usuários totais** durante o Ano Novo Chinês de 2026, chamando-o de maior app de saúde AI-native do mundo. A nota oficial informa que, entre 9 e 21 de fevereiro, 52% dos novos usuários vieram de cidades de terceiro nível ou menores. Os recursos mais usados foram perguntas e respostas de saúde, análise de pele por IA, consultas por chamada de voz, metas personalizadas de saúde e registros digitais de saúde. O app ficou em primeiro lugar geral na Apple App Store da China por vários dias consecutivos, segundo a nota.

Implicação preliminar para DOUTORELO: AQ/Ant Afu é obrigatório no benchmark porque representa a nova geração de **health AI-native app**: altamente distribuído, orientado a confiança, uso familiar/intergeracional, voz, análise visual, metas e registros digitais, não apenas chat textual.

URL: https://www.antgroup.com/en/news-media/press-releases/1771812000000

## Fonte 9 — OpenAI, 7 jan. 2026: ChatGPT Health

A OpenAI apresentou o **ChatGPT Health** como uma experiência dedicada dentro do ChatGPT para saúde e bem-estar. A página informa que mais de 230 milhões de pessoas globalmente fazem perguntas de saúde e bem-estar ao ChatGPT a cada semana. O produto conecta prontuários e apps de bem-estar, como Apple Health, Function e MyFitnessPal, para contextualizar respostas; opera em espaço separado, com memórias separadas, criptografia e isolamento adicionais; e não usa conversas de saúde para treinar modelos de fundação. A OpenAI ressalta que o produto deve apoiar, não substituir, cuidado médico, e não se destina a diagnóstico ou tratamento. O desenvolvimento envolveu mais de 260 médicos em 60 países, com mais de 600 mil feedbacks em 30 áreas, e avaliação por HealthBench com rubricas clínicas.

Implicação preliminar para DOUTORELO: ChatGPT Health redefine o padrão de consumidor para chat médico: **dados pessoais conectados, privacidade separada, memória clínica isolada, avaliação por rubricas médicas e preparação para consulta**, não simples Q&A. Mesmo que DOUTORELO seja vertical, usuários compararão a experiência com esse padrão.

URL: https://openai.com/index/introducing-chatgpt-health/

## Fonte 10 — Anthropic, 11 jan. 2026: Claude for Healthcare and Life Sciences

A Anthropic posiciona Claude em saúde tanto para organizações HIPAA-ready quanto para consumidores. No lado enterprise, a página destaca conectores para CMS Coverage Database, ICD-10, National Provider Identifier Registry, PubMed, além de Agent Skills para FHIR e revisão de autorização prévia. Os casos de uso incluem revisão de autorização prévia, recursos contra glosas, coordenação de cuidado, triagem de mensagens de pacientes, ambient scribing, revisão de prontuários e apoio a decisões clínicas. No lado consumidor, Claude Pro e Max nos EUA podem conectar lab results, health records, HealthEx, Function, Apple Health e Android Health Connect para resumir histórico médico, explicar exames, detectar padrões de métricas e preparar perguntas para consulta. A Anthropic declara que não usa dados de saúde para treinar modelos.

Implicação preliminar para DOUTORELO: Claude mostra um padrão mais **operacional e interoperável**: conectores, FHIR, autorização prévia, literatura biomédica e workflows administrativos. Para o DOUTORELO, isso reforça a necessidade de separar chat para usuário final de infraestrutura auditável para médico, prontuário, trilhas de decisão e futuras integrações.

URL: https://www.anthropic.com/news/healthcare-life-sciences

## Fonte 11 — JD Corporate Blog, 15 jan. 2025: AI Jingyi e JOY DOC

A JD Health apresentou a suíte **AI Jingyi** para cenários de saúde online e o **JOY DOC/JDY Doc** para uso hospitalar, ambos construídos sobre o LLM médico especializado **Jingyi Qianxun**. A fonte oficial descreve produtos como AI Diagnosis Assistant 2.0, AI Research Assistant, AI Doctor Digital Twin, Personal Medical Butler, Doctor Digital Twin e Future Digital Hospital. A página afirma que o AI Diagnosis Assistant 2.0 alcançou **99,5% de acurácia de triagem**, melhorou a eficiência de escrita de prontuário eletrônico em **120%** e resolveu mais de **90% dos problemas na primeira tentativa**. A proposta combina triagem inteligente, escolha entre consulta online/offline, matching com departamentos/médicos, otimização de fila, pagamento, exames, medicação, coleta de história clínica, alertas de alto risco e gestão hospitalar.

Implicação preliminar para DOUTORELO: JD Health confirma que o próximo padrão competitivo é **copiloto operacional de jornada**, não apenas chat clínico. Para o DOUTORELO, isso reforça a necessidade de intake estruturado, encaminhamento para médicos, alertas de risco, preparação da consulta, acompanhamento pós-consulta e integração progressiva com agenda, pagamento, exames e marketplace.

URL: https://jdcorporateblog.com/jd-health-introduces-groundbreaking-llm-powered-suite-for-comprehensive-online-and-in-hospital-healthcare-scenarios/

## Fonte 12 — AliHealth, página oficial About Us

A Alibaba Health se descreve como a plataforma flagship do Alibaba Group para recursos médicos e de saúde online/offline integrados, oferecendo soluções one-stop. A estratégia institucional é organizada em **cloud-based infrastructure**, **cloud-based pharmacy** e **cloud-based hospital**, com menções explícitas a cloud computing, **Medical AI**, medical knowledge graphs, Medical Big Model, traceability code e digital healthcare. A página afirma que a Alibaba Health Pharmacy opera uma plataforma farmacêutica integrada online/offline e, em 31 de março de 2025, tinha **1,23 milhão de SKUs**, com distribuição por Tmall, Taobao, Alipay, Ele.me e outras plataformas.

Implicação preliminar para DOUTORELO: AliHealth reforça que a vantagem chinesa é a integração entre **IA médica, e-commerce farmacêutico, cloud hospital, rastreabilidade, logística e distribuição de superapp**. Para o DOUTORELO, a lição é desenhar desde já uma arquitetura modular que permita, no futuro, conectar recomendação educativa, consulta, produto, pagamento e acompanhamento sem transformar o chat em prescriptor indevido.

URL: https://www.alihealth.cn/en-us/aboutus

## Fonte 13 — Investcorp, portfolio WeDoctor

A Investcorp descreve a WeDoctor como empresa chinesa de serviços online de saúde fundada em 2010 por Jerry Liao, especialista em inteligência artificial. A página informa que a companhia tem **mais de 240 milhões de usuários registrados** para consulta online, prescrição e serviços de diagnóstico, e que possui/opera uma das maiores infraestruturas digitais de saúde da China ao conectar hospitais e médicos com pacientes, farmácias, seguradoras e serviços financeiros.

Implicação preliminar para DOUTORELO: WeDoctor mostra o valor de uma camada de **infraestrutura de acesso**: agendamento, consulta, prescrição regulada, diagnóstico/encaminhamento, farmácia e seguradoras. Para o DOUTORELO, o chat deve ser pensado como porta de entrada para uma malha de serviços, ainda que essa malha seja construída progressivamente no Brasil.

URL: https://www.investcorp.com/portfolio/wedoctor/
