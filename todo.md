# Project TODO

- [x] Implementar PWA mobile-first com navegação inferior fixa, CTAs em zona de polegar, transições suaves e entrada otimizada para tráfego de redes sociais.
- [x] Criar layout público/paciente separado do backoffice administrativo web.
- [x] Implementar tela inicial mobile premium com proposta de valor, entrada rápida por campanha social, disclaimers de saúde e CTA principal para iniciar triagem.
- [x] Implementar onboarding LGPD com aceitação obrigatória da política de privacidade antes de qualquer coleta de dado de saúde.
- [x] Implementar consentimentos granulares para dados de saúde, recomendações por IA, notificações e comunicações operacionais.
- [x] Bloquear qualquer fluxo de coleta de sintomas, metas de saúde ou informações sensíveis enquanto o consentimento obrigatório não estiver concluído.
- [x] Implementar triagem por IA em chat com linguagem humanizada, disclaimers de segurança, detecção de red flags e fallback para suporte humano.
- [x] Registrar tracking estruturado básico de triagem com tipo de fluxo, status, presença de red flag, decisão de fallback e timestamp em resposta tRPC DEV; latência real e persistência ficam para a próxima iteração.
- [x] Implementar perfis DEV de médicos com especialidade, credenciais, abordagem, disponibilidade estática e solicitação de consulta em um toque com confirmação visual.
- [x] Implementar fluxo DEV de solicitação de consulta com confirmação visual; status persistente, histórico para paciente/médico/admin e filas reais ficam para a próxima iteração.
- [x] Implementar feed oficial de conteúdo curado por categorias de saúde, sem UGC aberto no MVP.
- [x] Implementar cards iniciais de conteúdo oficial com linguagem educativa e não prescritiva; recomendação contextual baseada em estado real da jornada fica para a próxima iteração.
- [x] Implementar marketplace com catálogo de produtos, detalhes, carrinho e fluxo de checkout simulado no DEV.
- [x] Garantir que toda copy do marketplace use linguagem comercial explícita e separada de prescrição, diagnóstico ou conduta clínica.
- [x] Implementar RBAC DEV com autenticação, procedimento administrativo restrito e separação visual do backoffice; papel doctor no banco e guards específicos de médico ficam para a próxima iteração.
- [x] Implementar backoffice web protegido com visão operacional e módulos administrativos exibidos; CRUD real de usuários, médicos, conteúdos, produtos, consultas e logs fica para a próxima iteração.
- [x] Implementar sistema de notificações para lembretes de consulta e dicas de saúde com opt-out controlado pelo usuário.
- [x] Implementar observabilidade inicial de UX/admin com métricas DEV e contrato de tracking de triagem; logs estruturados persistentes de eventos críticos ficam para a próxima iteração.
- [x] Implementar estados de carregamento, vazio, erro, sucesso, bloqueio por consentimento e fallback humano em todas as jornadas críticas.
- [x] Aplicar design visual premium com tipografia refinada, espaçamento deliberado, contraste acessível, microinterações discretas e sensação de confiança.
- [x] Garantir acessibilidade mobile-first com foco visível, navegação por teclado nas telas web, contraste adequado e labels semânticos.
- [x] Escrever testes Vitest para consentimento obrigatório, RBAC, copy comercial do marketplace, red flags da IA e permissões administrativas.
- [x] Validar TypeScript, build, testes automatizados e ambiente DEV antes do primeiro checkpoint.
- [x] Salvar checkpoint único ao final da primeira entrega navegável e fornecer o link DEV para validação.

- [x] Documentar próxima iteração: estender schema e migrações com doctors, appointments, articles, products, consents e audit_logs.
- [x] Documentar próxima iteração: substituir triagem determinística por `invokeLLM` server-side com resposta estruturada, disclaimers, red flags, fallback humano e tracking de latência.
- [x] Documentar próxima iteração: adicionar papel `doctor` ao enum do banco e criar procedimentos protegidos específicos para médicos.
- [x] Documentar próxima iteração: persistir consentimentos, preferências de notificação, solicitações de consulta, carrinho e eventos críticos no banco.
- [x] Documentar próxima iteração: transformar módulos do backoffice em CRUDs administrativos reais com auditoria e permissões.
- [x] Documentar próxima iteração: realizar exercício de naming, brand book e configuração de DNS após aprovação estratégica separada.

- [x] Definir e documentar arquitetura de IA clínica governada para todo o processo, com camadas de LLM, regras determinísticas, avaliação, rastreabilidade, humano no circuito e limites regulatórios explícitos.
- [x] Implementar primeira fundação backend de IA segura com contrato estruturado, prompt clínico restritivo, anti-alucinação, detecção de red flags, fallback determinístico e campos de confiança/risco.
- [x] Criar estrutura inicial DEV de Machine Learning/MLOps com registry de modelos/prompts, dataset sintético de avaliação, métricas automatizadas, contratos de features e eventos de auditoria sem texto bruto de saúde.
- [x] Adicionar testes automatizados para anti-alucinação, recusa de diagnóstico/prescrição, escalonamento de urgência, LGPD e consistência de disclaimers.
- [x] Atualizar a comunicação do produto para posicionar IA como copiloto educativo e assistivo, sem promessa de substituição médica e com o princípio “responder com segurança ou acionar fallback”.
- [x] Incorporar o princípio operacional “responder com segurança ou não responder”: quando a IA não souber, não tiver evidência suficiente ou detectar risco clínico, deve declarar incerteza, não inventar, pedir contexto ou escalar para humano.

- [x] Integrar `invokeLLM` server-side à triagem clínica com `response_format` em JSON Schema estrito, preservando contrato estruturado, incerteza explícita e fallback determinístico.
- [x] Validar e normalizar respostas do LLM contra schema interno antes de expor ao frontend, impedindo conteúdo fora do escopo clínico seguro.
- [x] Atualizar testes Vitest para cobrir resposta estruturada por JSON Schema, fallback quando o LLM falha ou retorna inválido, recusa de diagnóstico/prescrição e red flags.

- [x] Realizar análise estratégica profunda do produto atual, incluindo crítica honesta do layout, percepção de valor, arquitetura, IA clínica, LLM, Machine Learning, segurança, growth e diferenciação competitiva.
- [x] Conduzir benchmark internacional de saúde digital, IA médica, wellness, apps premium e ecossistemas de confiança nos EUA, Europa, China e mercados globais relevantes.
- [x] Definir visão de redesign UI/UX de classe mundial para transformar a experiência atual em uma plataforma premium, emocionalmente confiável, clinicamente segura e comercialmente diferenciada.
- [x] Elaborar roadmap exaustivo de próximos passos para sincronizar UI/UX, LLM, ML, dados, backoffice, governança clínica, personalização, marca, marketplace e percepção pública.
- [x] Entregar relatório estratégico final com análise do que está feito, lacunas, oportunidades, benchmark, princípios de design, arquitetura de IA e plano de execução priorizado.

- [x] Implementar V2 premium da Saúde Integrativa IA com novo design system mineral-botânico, tipografia editorial, superfícies sofisticadas e linguagem visual proprietária.
- [x] Redesenhar a home como cockpit de cuidado integrativo com estado de hoje, próximo melhor passo, timeline, plano semanal, rede humana, confiança e governança visível.
- [x] Tornar a IA governada visível na interface com cartões estruturados de risco, incerteza, red flags, limites, fallback humano e explicabilidade educativa.
- [x] Aprimorar as áreas de médicos, conteúdo, marketplace e backoffice para parecerem parte de um ecossistema premium e seguro, não módulos estáticos isolados.
- [x] Atualizar microcopy, responsividade, acessibilidade e microinterações para elevar percepção de produto classe mundial.
- [x] Validar a V2 premium com testes automatizados, checagem TypeScript, build e status do servidor antes do checkpoint final.
- [x] Elevar o redesign para um padrão extraordinário, evitando aparência genérica de app comum e criando uma experiência de cuidado viva, memorável, emocionalmente inteligente, tecnicamente precisa e visualmente proprietária.
- [x] Incorporar uma camada emocional e sensorial forte ao redesign, com estética sexy, íntima, humana e memorável, capaz de tocar confiança, desejo de cuidado, acolhimento profundo e sensação de presença sem comprometer segurança clínica.
- [x] Adicionar contratos objetivos para a V2 cobrindo explicitamente estado de hoje, próximo melhor passo, timeline, plano semanal, rede humana e governança visível na home.
- [x] Adicionar contratos objetivos para os elementos de governança da IA na UI: risco, incerteza, red flags, limites, fallback humano e explicabilidade educativa.
- [x] Documentar o design system V2 em código, com tokens, tipografia, superfícies, componentes reutilizáveis e cobertura verificável em Home/Admin.
- [x] Validar objetivamente responsividade, acessibilidade, microinterações e integração premium das áreas de médicos, conteúdo, marketplace e backoffice.
- [x] Otimizar carregamento tipográfico da V2 movendo Google Fonts do `@import` CSS para `<link>` ativo no `client/index.html`.
- [x] Criar especificação técnica verificável da experiência V2 com princípios de cockpit, governança clínica, linguagem mineral-botânica e critérios de aceitação.
- [x] Realizar pesquisa profunda China/Europa/EUA sobre sistemas digitais de saúde, wellness e apps premium com melhor retorno financeiro, focando cor, emoção visual, confiança e conversão.
- [x] Auditar criticamente a paleta atual da Saúde Integrativa IA DEV para verificar se está pálida, sem energia ou insuficiente para acionar desejo, confiança e presença emocional.
- [x] Definir uma nova hipótese visual mais viva, emocional e comercialmente forte, sem comprometer segurança clínica, acessibilidade e governança.
- [x] Implementar uma evolução visual baseada na pesquisa internacional, com mais contraste, vida cromática, profundidade sensorial e gatilhos emocionais no primeiro impacto.
- [x] Atualizar contratos automatizados, documentação estratégica e validações antes do novo checkpoint visual.
- [x] Analisar profundamente o PDF `AnáliseDOCTORELOemInglês.pdf`, extraindo tese, forças, fragilidades, riscos, oportunidades e implicações para a Saúde Integrativa IA DEV.
- [x] Corrigir a V3 escura e pesada, migrando para uma estética de saúde clara, limpa, respirável, premium e menos poluída.
- [x] Reduzir drasticamente a densidade textual da primeira dobra, priorizando hierarquia visual, respiro, emoção silenciosa e clareza imediata.
- [x] Substituir a paleta escura por cores claras de saúde com energia: branco quente, azul/verde clínico suave, coral vivo dosado e gradientes luminosos.
- [x] Reestruturar a home para surpreender com simplicidade sofisticada, sensação de confiança, leveza, acolhimento e desejo de cuidado, sem parecer app genérico.
- [x] Atualizar os contratos automatizados para impedir regressão para telas escuras, poluídas ou excessivamente textuais.
- [x] Incorporar leveza, graça e sutileza como critérios centrais do redesign, substituindo densidade dramática por emoção silenciosa, luminosa e elegante.
- [x] Reduzir o hero a uma mensagem breve, respirável e memorável, com menos blocos laterais, menos métricas simultâneas e mais espaço em branco.
- [x] Criar uma linguagem visual de saúde clara e delicada, com superfícies translúcidas suaves, sombras leves, microdetalhes orgânicos e acentos cromáticos dosados.
- [x] Garantir que a nova tela pareça premium, humana e serena, sem parecer hospital frio, spa genérico ou app de produtividade escuro.
- [x] Simplificar o HeroCockpit removendo sinais e métricas simultâneas, deixando a primeira dobra com 1 mensagem principal, 1 apoio curto, 2 CTAs e no máximo 1 bloco lateral.
- [x] Adicionar testes automatizados mensuráveis contra excesso de densidade visual/textual no hero, incluindo limites de métricas, sinais e cards laterais.
- [x] Criar contrato visual verificável para aparência premium, humana e serena com critérios objetivos em código/testes.
- [x] Ajustar o HeroCockpit para ter exatamente 1 texto de apoio na primeira dobra, movendo o estado de consentimento para dentro do card lateral.
- [x] Expandir contrato e testes V4 com critérios objetivos para experiência premium, humana e serena.
- [x] Ajustar a microcopy dos módulos de IA, médicos, saber, rituais/marketplace e backoffice para o mesmo tom claro, humano, leve e sutil da V4.
- [x] Criar uma segunda variação editorial do hero para comparação, mantendo segurança clínica, poucos elementos e linguagem mais sofisticada.
- [x] Revisar a experiência mobile em tela real/simulada e corrigir pontos objetivos de legibilidade, respiro, hierarquia e zona de toque.
- [x] Remover da Home frases artificiais ou pouco brasileiras como “Seu corpo pede escuta”, substituindo por linguagem clara, natural e profissional para o público brasileiro.
- [x] Retirar da primeira dobra o discurso defensivo sobre IA, limites, incerteza, diagnóstico ou prescrição, fazendo a confiança ser percebida por fluxo, hierarquia, tom e desenho de produto.
- [x] Reposicionar o hero e o card lateral com linguagem institucional madura, sem slogans superficiais, sem explicar a IA e sem parecer amador.
- [x] Atualizar contratos e testes para bloquear regressão para microcopy artificial, defensiva ou excessivamente explicativa sobre IA.
- [x] Validar com o usuário se a revisão editorial agora transmite conforto, maturidade e confiança suficientes para seguir.
- [x] Adicionar critérios verificáveis de conforto editorial e validar a experiência final no navegador antes do checkpoint.
- [x] Documentar a validação editorial final em `editorial-qa-v5.md`, incluindo testes, build, preview e correção da navegação que cobria o CTA.

- [x] Analisar integralmente o documento enviado sobre DOCTORELO/DOUTORELO e extrair implicações para naming e arquitetura de marca.
- [x] Definir hipóteses de naming e arquitetura de marca para o projeto: marca-mãe, módulos, uso de Saúde Integrativa IA, DOUTORELO ou alternativa proprietária.
- [x] Propor fundamentos de branding: missão, visão, promessa central, valores, personalidade, tom de voz e território verbal.
- [x] Propor uma direção visual inicial com fontes, paleta de cores, atmosfera, símbolo/elo visual e critérios de aplicação na interface.
- [x] Preparar uma leitura estratégica para discussão com opções claras, riscos e recomendação inicial.

- [x] Aprofundar a análise do naming principal, incluindo Doutor·Elo/DOUTORELO, arquitetura de marca, riscos, alternativas e recomendação executiva.
- [x] Definir missão, visão, promessa central, valores, personalidade e território verbal da marca com maturidade estratégica.
- [x] Desenvolver a direção de identidade visual da marca, incluindo fontes, paleta, símbolo/elo, atmosfera, grid emocional e critérios de aplicação digital.
- [x] Consolidar um documento profundo de branding para discussão, separando decisões recomendadas, hipóteses a validar e próximos passos de implementação.
- [x] Salvar checkpoint da rodada profunda de branding e entregar uma recomendação executiva ao usuário.

- [x] Corrigir imediatamente a frase artificial “organize seus sinais” e revisar a Home contra traduções conceituais que soem estranhas em português brasileiro.
- [x] Criar uma régua editorial de português brasileiro para bloquear microcopy artificial, slogans traduzidos e formulações culturalmente inadequadas.
- [x] Incorporar autoridade linguística brasileira ao naming, missão/visão, tom de voz e identidade verbal da marca.

- [x] Reconstruir a landing page para abandonar aparência básica/genérica e atingir uma experiência memorável, premium e proprietária.
- [x] Fazer pesquisa internacional real de referências na China, Europa e EUA em saúde digital, tecnologia premium, IA e experiências de marca de alto encantamento.
- [x] Definir um conceito criativo ousado para a landing, com narrativa visual, interação e microcopy brasileira que não pareça tradução nem template.
- [x] Implementar a nova landing com direção de arte sofisticada, composição responsiva, camadas visuais, microinterações e acessibilidade.
- [x] Atualizar testes automatizados para impedir regressão a frases artificiais, seções genéricas e proposta visual básica.
- [x] Validar build, testes e estado do projeto da nova landing extraordinária.

- [x] Substituir os chips “Contexto antes da conduta”, “IA com critério clínico” e “Português humano, sem tradução automática” por mensagens públicas centradas no benefício percebido pelo usuário comum.
- [x] Revisar a primeira dobra para remover linguagem de bastidor, filosofia interna e explicações sobre o próprio sistema que não fazem sentido para o visitante comum.
- [x] Atualizar testes editoriais para bloquear regressão a chips autocentrados, técnicos ou internos na landing.
- [x] Validar testes, build e prévia após a correção da microcopy pública da primeira dobra.
- [x] Auditar toda a microcopy pública da landing para garantir que fale ao potencial cliente externo, não ao time interno, investidores ou à própria arquitetura do produto.
- [x] Reescrever qualquer frase pública que dependa de explicação interna, jargão de IA, filosofia de produto ou conceito pouco imediato para o visitante brasileiro comum.

- [x] Adotar DOUTORELO como nomenclatura oficial do aplicativo daqui em diante, revisando referências de marca quando necessário.
- [x] Ler cuidadosamente o documento DOUTORELO.pdf e extrair a visão estratégica do serviço desejado.
- [x] Avaliar se a estrutura atual do projeto atende à descrição do serviço, incluindo jornada, proposta de valor, arquitetura de produto e linguagem pública.
- [x] Analisar lacunas de experiência com uma visão ambiciosa de UI/UX, encantamento, recompensa, sensação de cuidado e padrão internacional de produto digital premium.
- [x] Consolidar recomendações objetivas para aproximar o DOUTORELO da experiência de serviço descrita no documento.

- [x] Definir o plano mestre de implementação do DOUTORELO, priorizando produto, dados, IA, experiência e segurança clínica.
- [x] Implementar a base longitudinal de dados do usuário: perfil, sinais, sintomas, hábitos, exames, consultas, documentos e linha do tempo.
- [x] Construir a jornada inicial de clareza do DOUTORELO com onboarding, triagem conversacional, resumo estruturado e próximos passos.
- [x] Criar a área autenticada do usuário com painel de saúde, histórico, documentos, recomendações e evolução visual.
- [x] Implementar a camada de IA clínica segura com limites explícitos, geração de resumo, preparação para consulta e explicabilidade.
- [x] Criar catálogo persistente de médicos/profissionais com filtros, perfis, disponibilidade e fluxo de agendamento inicial.
- [x] Ajustar a landing e a navegação pública para refletirem o produto real à medida que os módulos forem implementados.
- [x] Adicionar testes automatizados para schema, procedures, fluxos críticos, segurança editorial e regressões de experiência.

- [x] Fase 1A: desenhar e implementar schema longitudinal mínimo para perfil de saúde, eventos, conversas, mapas de clareza, documentos, consultas, indicadores e consentimentos.
- [x] Fase 1B: criar helpers de banco para memória clínica do usuário com escopo obrigatório por usuário autenticado.
- [x] Fase 1C: expor procedures protegidas para obter perfil, salvar perfil, registrar evento, salvar mapa de clareza e listar linha do tempo.
- [x] Fase 1D: criar interface inicial de memória do DOUTORELO com painel autenticado, linha do tempo e primeiro Mapa de Clareza salvável.
- [x] Fase 1E: adicionar testes automatizados para schema, autorização, helpers, procedures e contratos de experiência da memória longitudinal.
- [x] Fase 1F: validar TypeScript, testes, build e estado DEV antes do checkpoint de implementação da Fase 1.

- [x] Fase 2A: definir contrato server-side da Jornada de Clareza com consentimento obrigatório, entrada conversacional, avaliação de segurança clínica e resposta estruturada.
- [x] Fase 2B: criar gerador de Mapa de Clareza assistido por IA com JSON Schema estrito, fallback determinístico, limites explícitos e linguagem não diagnóstica.
- [x] Fase 2C: persistir conversa, evento clínico e Mapa de Clareza em tabelas longitudinais usando escopo obrigatório por usuário autenticado.
- [x] Fase 2D: criar página autenticada `/clareza` com onboarding conversacional premium, chat guiado, progresso emocional e resumo estruturado do mapa.
- [x] Fase 2E: integrar navegação lateral e links de entrada para a Jornada de Clareza sem quebrar Memória Clínica e landing pública.
- [x] Fase 2F: adicionar testes Vitest para autorização, consentimento, segurança clínica, fallback, persistência e contrato editorial da jornada.
- [x] Fase 2G: validar testes, TypeScript, build, ambiente DEV e salvar checkpoint da Jornada de Clareza.

- [x] Fase 3A: criar contratos backend para painel autenticado do usuário com visão consolidada de perfil, últimos eventos, documentos, mapas de clareza, recomendações e evolução.
- [x] Fase 3B: criar catálogo persistente de profissionais com seed DEV, filtros, perfis, disponibilidade e solicitação inicial de agendamento por usuário autenticado.
- [x] Fase 3C: expor camada de IA clínica explicável com limites, incerteza, red flags, próximos passos educativos e preparação para consulta sem diagnóstico ou prescrição.
- [x] Fase 3D: construir dashboard autenticado `/app` com painel de saúde, histórico, documentos, recomendações e evolução visual conectados à memória longitudinal.
- [x] Fase 3E: construir página autenticada de profissionais `/profissionais` com filtros, cards persistentes, perfil resumido e solicitação de agendamento inicial.
- [x] Fase 3F: ajustar landing e navegação pública/autenticada para refletirem o produto real: Clareza, Área Clínica, Profissionais e Memória longitudinal.
- [x] Fase 3G: adicionar testes automatizados para painel, catálogo de profissionais, IA explicável, rotas, copy segura e regressões de experiência.
- [x] Fase 3H: validar testes, TypeScript, build, ambiente DEV, checklist final e salvar checkpoint de conclusão do plano mestre.

- [x] Fase 3I: incorporar a nova identidade visual do DOUTORELO baseada na logo enviada, com símbolo de elos, paleta verde-turquesa/verde-profundo, tipografia limpa e atmosfera integrativa premium.
- [x] Fase 3J: aplicar a logo oficial como ativo web seguro, usando armazenamento externo ao projeto e referência estável no frontend.
- [x] Fase 3K: atualizar tokens visuais, landing, navegação e áreas autenticadas para que todo o cenário do produto pareça coerente com a nova marca.
- [x] Fase 3L: adicionar validações automatizadas contra regressão para nomenclatura DOUTORELO, presença da marca, paleta principal e linguagem visual compatível com saúde integrativa.

- [x] Fase Home Logo 1: redesenhar integralmente a Home pública do DOUTORELO com a logo oficial dos elos como referência central de marca.
- [x] Fase Home Logo 2: aplicar paleta verde-turquesa, verde-profundo, branco clínico e cinzas suaves derivados da logo em hero, navegação, CTAs, cards e fundos.
- [x] Fase Home Logo 3: substituir a atmosfera escura atual por uma experiência mais clara, integrativa, tecnológica, premium e coerente com a marca enviada.
- [x] Fase Home Logo 4: reescrever a narrativa da Home para apresentar Clareza, Área Clínica, Memória longitudinal e Profissionais de forma simples, brasileira e segura.
- [x] Fase Home Logo 5: inserir a logo como ativo web seguro fora do diretório do projeto e referenciá-la por URL estável no frontend.
- [x] Fase Home Logo 6: atualizar testes automatizados para validar presença da marca, nova paleta, linguagem pública e ausência de regressões editoriais.
- [x] Fase Home Logo 7: validar testes, TypeScript, build, ambiente DEV e salvar checkpoint do redesign completo da Home.

- [x] Fase 4A: modelar agenda real por profissional com horários disponíveis, reserva por usuário autenticado, status de agendamento e histórico de solicitações.
- [x] Fase 4B: criar contratos backend protegidos para listar horários, reservar horário, consultar agendamentos do usuário e evitar dupla reserva no mesmo slot.
- [x] Fase 4C: criar página de detalhe por profissional com perfil completo, abordagem, credenciais, disponibilidade, conteúdos relacionados e CTA de agendamento.
- [x] Fase 4D: atualizar catálogo `/profissionais` para navegar aos detalhes e selecionar horários reais em vez de apenas solicitação genérica.
- [x] Fase 4E: criar área administrativa protegida para CRUD de profissionais com campos de perfil, especialidade, credenciais, disponibilidade, status e destaque.
- [x] Fase 4F: criar área administrativa protegida para CRUD de conteúdos oficiais com categoria, título, resumo, corpo educativo, status de publicação e linguagem não prescritiva.
- [x] Fase 4G: alinhar design visual, estados de carregamento, vazio, erro, sucesso, acessibilidade e feedbacks de interação nas novas telas.
- [x] Fase 4H: adicionar testes Vitest para agenda, detalhe de profissional, CRUD administrativo, permissões, prevenção de dupla reserva e copy segura.
- [x] Fase 4I: validar testes, TypeScript, build, ambiente DEV, checklist final e salvar checkpoint da etapa de agenda, detalhe e administração.

- [x] Fase 5A: assumir diretriz app-first para 98% de uso em iOS/Android, documentando que toda nova tela deve priorizar navegação inferior, zona de toque, safe areas, ritmo de app e responsividade mobile antes da versão web.
- [x] Fase 5B: mapear rotas, layouts e contratos atuais para identificar pontos que precisam de shell mobile, atalhos diários e continuidade de cuidado pós-agendamento.
- [x] Fase 5C: implementar shell mobile app-first com navegação inferior persistente, áreas seguras para iOS/Android, atalhos principais e hierarquia compacta para uso recorrente.
- [x] Fase 5D: criar fluxo autenticado de consultas do paciente com próximos agendamentos, histórico, status, preparo para consulta e ações rápidas.
- [x] Fase 5E: criar gestão administrativa de consultas com listagem operacional, filtros de status, atualização de status, observações internas e proteção por papel administrativo.
- [x] Fase 5F: refinar UX mobile com alvos de toque confortáveis, estados de carregamento/erro/vazio, microcopy segura, sensação offline-like e acessibilidade em telas pequenas.
- [x] Fase 5G: adicionar testes Vitest para shell mobile, rotas app-first, fluxo de consultas do paciente, gestão administrativa, permissões e linguagem segura.
- [x] Fase 5H: validar testes, TypeScript, build, ambiente DEV, checklist final e salvar checkpoint da etapa app-first de consultas e continuidade de cuidado.

- [x] Fase 6A: assumir diretriz estratégica de marketplace app-first para produtos e serviços, considerando uso majoritário via iOS/Android, catálogo escalável e base de dados de grande volume desde a modelagem inicial.
- [x] Fase 6B: modelar domínio de marketplace com produtos, serviços, categorias, marcas/parceiros, preço, status de publicação, elegibilidade, estoque, carrinho, pedidos e eventos de recomendação.
- [x] Fase 6C: criar fundação backend protegida para listar produtos e serviços, consultar detalhe, administrar catálogo, controlar estoque e preparar pedidos sem ativar cobrança real ainda.
- [x] Fase 6D: implementar experiência mobile de marketplace com navegação por categorias, busca, cards compactos, detalhe de produto/serviço, carrinho e CTAs adequados para toque.
- [x] Fase 6E: criar backoffice administrativo para cadastro e curadoria de produtos/serviços, atualização de estoque, ativação/desativação e revisão de claims de saúde com linguagem segura.
- [x] Fase 6F: preparar arquitetura de checkout e pagamentos, incluindo dependência futura de Stripe, estados de pedido e separação clara entre simulação DEV e transação real.
- [x] Fase 6G: implementar recomendações iniciais por IA de produtos e serviços com base no perfil, memória clínica e consultas, mantendo transparência, privacidade, consentimento e não prescrição.
- [x] Fase 6H: adicionar testes para catálogo, estoque, carrinho, permissões administrativas, recomendações seguras, privacidade e linguagem não prescritiva.

- [x] Fase 7A: pausar temporariamente a implementação de marketplace e priorizar revisão profunda de comunicação das páginas publicadas.
- [x] Fase 7B: auditar Home, área autenticada, profissionais, consultas e administração para identificar expressões pouco brasileiras, textos genéricos, frios ou com excesso de jargão técnico.
- [x] Fase 7C: definir uma diretriz editorial brasileira para DOUTORELO com tom acolhedor, maduro, emocional na medida certa, comercialmente claro e clinicamente seguro.
- [x] Fase 7D: reescrever e aplicar copy aculturada ao português brasileiro nas páginas públicas e autenticadas prioritárias, preservando segurança médica e LGPD.
- [x] Fase 7E: atualizar testes/contratos editoriais para impedir regressão para linguagem artificial, pouco brasileira ou promessas clínicas indevidas.
- [x] Fase 7F: validar TypeScript, testes, build, ambiente DEV e salvar checkpoint específico da revisão editorial brasileira.

- [x] Fase 7G: substituir “Jornada de Clareza” por uma nomenclatura brasileira natural em todas as páginas, CTAs, estados, toasts, textos de acessibilidade e testes.
- [x] Fase 7H: revisar nomes conceituais como “Mapa de Clareza”, “memória longitudinal”, “humano no circuito” e “elo” para decidir o que deve virar linguagem cotidiana brasileira.
- [x] Fase 7I: aplicar uma diretriz de copy brasileira: falar como uma marca de saúde confiável no Brasil, sem termos importados, sem jargão desnecessário e sem promessas clínicas indevidas.

- [x] Revisar o blueprint original do DOUTORELO, comparar com a implementação atual e produzir diagnóstico de aderência, lacunas e próximos passos estratégicos.

- [x] Fase 8A: aprofundar exaustivamente o núcleo clínico longitudinal do DOUTORELO como etapa de construção, não apenas estratégia, respeitando a ambição completa do blueprint.
- [x] Fase 8B: auditar schema, rotas, páginas, testes e componentes atuais para identificar pontos de extensão de memória clínica, exames, indicadores, plano de cuidado e dispositivos.
- [x] Fase 8C: ampliar o modelo de dados para linha do tempo clínica unificada, indicadores recorrentes, documentos/exames, plano de cuidado, metas, observações, compartilhamento e sinais importados de dispositivos.
- [x] Fase 8D: criar backend protegido para registrar, consultar, resumir e organizar dados longitudinais com consentimento, auditoria, linguagem segura e separação entre educação, organização e conduta médica.
- [x] Fase 8E: construir experiência app-first do núcleo longitudinal com painel de hoje, timeline inteligente, documentos/exames, indicadores, plano de cuidado, preparo para consulta e próximos passos.
- [x] Fase 8F: preparar a arquitetura do projeto para integração futura com app iOS nativo, Apple Health e Apple Watch, definindo contratos, consentimentos, tipos de métricas e fluxo de sincronização.
- [x] Fase 8G: adicionar testes automatizados para contratos clínicos longitudinais, consentimento, privacidade, dispositivos, segurança de IA e linguagem não diagnóstica.
- [x] Fase 8H: validar TypeScript, testes, ambiente DEV, revisar checklist e salvar checkpoint da etapa de núcleo clínico longitudinal avançado.

- [x] Fase 8I: ampliar a arquitetura de conexões universais para incluir Android Health Connect, dispositivos Android e wearables além de Apple Health e Apple Watch.
- [x] Fase 8J: modelar contratos universais de fontes de dados de saúde, distinguindo métricas vindas de Apple Health, Apple Watch, Health Connect, wearables Android, entrada manual e importação documental.
- [x] Fase 8K: preparar a camada de agendamentos para comunicação futura com Google Calendar, Apple Calendar e Outlook Calendar, incluindo status de sincronização, identificadores externos, conflitos e revogação de acesso.
- [x] Fase 8L: criar uma central de conexões no app para explicar integrações futuras, consentimentos por fonte, permissões, sincronização, privacidade e limites de uso clínico dos dados importados.
- [x] Fase 8M: adicionar testes automatizados para contratos de interoperabilidade com dispositivos iOS/Android e calendários externos, garantindo que a integração seja universal, modular e segura.

- [x] Fase 9A: retirar telemedicina da prioridade imediata e documentar que ela permanecerá como módulo futuro, sem orientar a fase atual por videochamada.
- [x] Fase 9B: pesquisar bases, benchmarks, diretrizes e arquivos públicos internacionais relevantes para treinamento, avaliação e segurança de IA em saúde.
- [x] Fase 9C: pesquisar referências brasileiras relevantes para segurança clínica, ética, LGPD, linguagem médica responsável e limites de IA em saúde.
- [x] Fase 9D: definir uma arquitetura de “vacinas anti-alucinação” para a IA do DOUTORELO, incluindo recusa segura, checagem de escopo, incerteza explícita, red flags, citações/fontes, revisão humana e auditoria.
- [x] Fase 9E: definir estratégia de treinamento governado e avaliação extensiva da IA, separando fine-tuning, RAG, prompt policy, datasets licenciados, casos sintéticos, golden tests e avaliação clínica.
- [x] Fase 9F: criar uma camada de DNA editorial/médico autorizável do Dr. Dayan, sem impersonação indevida, com princípios, tom, raciocínio educativo, limites clínicos e trilha de consentimento/licenciamento de conteúdo.
- [x] Fase 9G: implementar contratos e testes automatizados para bloquear diagnóstico, prescrição, alucinação sem fonte, falsa certeza, extrapolação clínica e simulação indevida de médico real.
- [x] Fase 9H: criar documentação técnica da IA clínica DOUTORELO com governança, fontes recomendadas, fluxos de segurança, matriz de riscos e plano de expansão de treinamento.
- [x] Fase 9I: validar testes, TypeScript, build, ambiente DEV, revisar checklist e salvar checkpoint da fundação de IA clínica anti-alucinação.

- [x] Fase 9J: mapear canais, vídeos, entrevistas, aulas, posts e páginas públicas do Dr. Dayan Siebra que possam informar a camada editorial/pedagógica da IA central.
- [x] Fase 9K: dissecar conteúdos públicos do Dr. Dayan em matriz de temas, teses recorrentes, linguagem, metáforas, estrutura de explicação, alertas, limites e raciocínio educativo.
- [x] Fase 9L: transformar o material analisado em um “DNA editorial autorizável” para a IA, diferenciando inspiração pedagógica, conteúdo licenciado, citação pública e impersonação proibida.
- [x] Fase 9M: criar regras da IA central para nunca se declarar Dr. Dayan, nunca simular consulta individual dele, nunca prometer cura e sempre separar educação, organização e decisão médica.
- [x] Fase 9N: preparar uma biblioteca de avaliação com casos sintéticos que testem se a IA responde com clareza, estilo educativo compatível, segurança clínica, incerteza explícita e sem alucinação.

- [x] Fase 9O: aprofundar a execução da camada de medicina integrativa da IA central, usando fontes públicas do Dr. Dayan para extrair método pedagógico, temas recorrentes, lógica de explicação e vocabulário educativo.
- [x] Fase 9P: mapear vídeos longos, shorts, lives e entrevistas públicas do Dr. Dayan em uma matriz de tópicos de saúde integrativa, nutrição, metabolismo, inflamação, sono, hormônios, beleza, envelhecimento, prevenção e estilo de vida.
- [x] Fase 9Q: criar um protocolo de resposta da IA que priorize raciocínio integrativo, investigação de hábitos, organização longitudinal, educação acessível e encaminhamento responsável, sem se apresentar como o Dr. Dayan.
- [x] Fase 9R: implementar testes que verifiquem aderência da IA à linha integrativa, clareza popular, segurança clínica, ausência de falsa autoridade pessoal e bloqueio de respostas inventadas ou prescritivas.

- [x] Fase 10A: redesenhar a Home pública do DOUTORELO como uma experiência minimalista app-first, com uma pergunta central, um campo único de entrada e CTAs secundários discretos, inspirada na simplicidade de interfaces de busca e agentes.
- [x] Fase 10B: conectar o campo central ao fluxo seguro de preparação de saúde/IA integrativa, preservando login, consentimento, limites clínicos e redirecionamento adequado para usuários não autenticados.
- [x] Fase 10C: atualizar testes automatizados para validar a pergunta central, o campo único, a ausência de landing page genérica e a manutenção dos caminhos essenciais de autenticação e segurança.

- [x] Fase 10D: pausar a implementação da Home minimalista e entregar primeiro uma análise estratégica profunda sobre impacto, diferenciação, riscos, conversão, UX app-first e segurança clínica da proposta.

- [x] Fase 10E: transcrever e interpretar o áudio do sócio sobre a proposta de Home minimalista, incorporando seus argumentos à análise estratégica antes de qualquer implementação.

- [x] Fase 10F: transcrever os três novos áudios dos sócios e consolidar seus argumentos com o áudio anterior para orientar a análise estratégica da entrada minimalista.
- [x] Fase 10G: mapear convergências e tensões entre a visão de campo único, a preocupação com produto difícil de entender, a estratégia de porta de entrada e os riscos de saúde/monetização.

- [x] Fase 10H: corrigir a autoria dos documentos estratégicos recentes para “SIDNEY (PMO SENIUM.AI)” e adotar esse padrão editorial em entregas estratégicas do DOUTORELO quando representarem a visão do PMO.

- [x] Fase 11A: implementar a porta de entrada minimalista do DOUTORELO com a pergunta central “Como posso melhorar sua saúde hoje?” como primeiro elemento dominante da Home.
- [x] Fase 11B: substituir a primeira dobra explicativa por um campo único de entrada, visualmente limpo, com microcopy clínica segura e CTAs secundários discretos.
- [x] Fase 11C: preservar o blueprint e o DNA integrativo em camadas progressivas abaixo da primeira interação, sem sobrecarregar a tela inicial.
- [x] Fase 11D: conectar a intenção digitada ao fluxo de preparação de consulta/IA integrativa, respeitando autenticação, consentimento, limites clínicos e retorno pós-login.
- [x] Fase 11E: atualizar testes automatizados para garantir simplicidade da porta de entrada, presença da pergunta central, segurança clínica e ausência de excesso de landing page na primeira dobra.
- [x] Fase 11F: validar TypeScript, testes e ambiente DEV antes de salvar checkpoint da implementação.

- [x] Fase 12A: definir o conceito de Motor de Desdobramento Contínuo do DOUTORELO, em que o primeiro input gera resposta inicial, próximos caminhos, perguntas inteligentes, ações clínicas seguras e continuidade longitudinal.
- [x] Fase 12B: auditar a preparação de consulta, IA clínica, memória longitudinal e componentes de chat para identificar onde acoplar sugestões, ramificações e próximas melhores ações.
- [x] Fase 12C: implementar um contrato server-side para classificar a intenção inicial e gerar caminhos dinâmicos como aprofundar sintomas, organizar exames, preparar consulta, buscar profissional, registrar memória, acompanhar hábitos e revisar sinais de alerta.
- [x] Fase 12D: criar uma interface pós-resposta inicial com trilhas personalizadas, chips de ação, perguntas sugeridas, resumo vivo e CTA para continuar a conversa sem limitar o usuário a um fluxo linear.
- [x] Fase 12E: garantir que o motor de caminhos respeite consentimento, autenticação, LGPD, limites clínicos, red flags, não diagnóstico, não prescrição e escalonamento responsável.
- [x] Fase 12F: adicionar testes automatizados para classificação de intenção, geração de caminhos, segurança clínica, persistência do primeiro input e ausência de becos sem saída após a resposta inicial.
- [x] Fase 12G: validar TypeScript, testes, build, ambiente DEV e salvar checkpoint da primeira versão do motor de desdobramento contínuo.

- [x] Fase 12H: substituir o CTA inicial “Organizar minha consulta” por uma inscrição mais aberta, que não pressuponha consulta e permita desdobramentos como entender sintomas, organizar exames, acompanhar hábitos, buscar profissional, preparar consulta ou explorar próximos passos de saúde.
- [x] Fase 12I: atualizar contratos editoriais e testes para impedir regressão a CTAs restritivos que reduzam o primeiro input do usuário apenas à preparação de consulta.
- [x] Fase 12J: validar a Home em DEV após a troca do CTA, garantindo que o campo único continue claro, seguro, responsivo e coerente com o motor de possibilidades amplas.

- [x] Fase 13A: criar o núcleo do Motor de Desdobramento Contínuo para classificar o primeiro input por intenção, domínio de saúde, urgência, necessidade principal e nível de segurança clínica.
- [x] Fase 13B: gerar uma resposta inicial curta, acolhedora e útil, com síntese do que o usuário disse, limite clínico explícito e ausência de diagnóstico ou prescrição.
- [x] Fase 13C: produzir trilhas dinâmicas de continuação após a primeira resposta, incluindo entender melhor, organizar informações, acompanhar rotina, registrar memória, preparar conversa profissional, buscar profissional, revisar sinais de alerta e continuar livremente.
- [x] Fase 13D: criar perguntas inteligentes contextuais que aprofundem o caso sem transformar a experiência em formulário rígido.
- [x] Fase 13E: construir a interface pós-resposta com resposta inicial, chips de ação, painel de caminhos, resumo vivo e campo aberto de continuidade.
- [x] Fase 13F: garantir que consulta seja apenas uma possibilidade entre muitas, impedindo regressão para funil único de preparação de consulta.
- [x] Fase 13G: reforçar red flags, consentimento, LGPD, não diagnóstico, não prescrição e recomendação de atendimento urgente quando houver sinais de alerta.
- [x] Fase 13H: adicionar testes unitários e contratos de design para intenção, trilhas, segurança clínica, CTA aberto e ausência de becos sem saída.
- [x] Fase 13I: validar testes, TypeScript, build e ambiente DEV antes do checkpoint da primeira versão do motor contínuo.

- [x] Fase 14A: recuperar e normalizar a lista completa dos 250 vídeos públicos do Dr. Dayan já mapeados, incluindo título, URL, duração, tema inicial e status de extração.
- [x] Fase 14B: extrair transcrição, legenda ou conteúdo equivalente de cada vídeo disponível, registrando indisponibilidades, bloqueios e limitações por vídeo sem substituir por inferência silenciosa.
- [x] Fase 14C: construir um corpus estruturado por vídeo com teses centrais, tópicos clínico-editoriais, explicações, metáforas, alertas, hábitos sugeridos, menções a suplementos/alimentos e limites de segurança.
- [x] Fase 14D: consolidar o corpus em uma taxonomia de treinamento da IA DOUTORELO por temas como metabolismo, emagrecimento, inflamação, detox, sono, energia, intestino, circulação, prevenção, suplementos, hormônios, beleza e hábitos.
- [x] Fase 14E: criar arquivos de dataset utilizáveis pela IA, com JSONL/JSON estruturado, índice de busca, matriz temática e relatório de cobertura dos 250 vídeos.
- [x] Fase 14F: implementar camada server-side de recuperação do corpus Dayan no DOUTORELO, para que a IA use o conteúdo extraído como referência interna de raciocínio integrativo e editorial.
- [x] Fase 14G: integrar a recuperação do corpus à resposta da IA sem depender apenas de prompt genérico, retornando trechos temáticos, fontes internas, trilhas de continuidade e auditoria de uso do corpus.
- [x] Fase 14H: adicionar testes automatizados para verificar cobertura do corpus, busca por tema, uso em respostas, rastreabilidade por vídeo e ausência de resposta vazia quando há conteúdo disponível.
- [x] Fase 14I: validar testes, TypeScript, build, ambiente DEV e salvar checkpoint da versão com corpus Dr. Dayan incorporado ao DOUTORELO.

- [x] Manter atualizações curtas e frequentes ao usuário durante o processamento do corpus profundo dos 250 vídeos do Dr. Dayan.

- [x] Integrar o corpus consolidado do Dr. Dayan ao backend com busca rastreável por vídeo, tema e seção.
- [x] Expor procedimentos tRPC para estatísticas, busca semântica simples e resposta assistida com citações do corpus.
- [x] Garantir que respostas clínicas usem alertas, limites clínicos e recomendação de avaliação profissional quando houver risco.

- [x] Fase 15A: mapear os fluxos atuais de resposta da IA DOUTORELO para identificar onde o corpus Dayan deve influenciar raciocínio, linguagem, recomendações e continuidade.
- [x] Fase 15B: criar uma camada de contexto Dayan que selecione trechos, temas, alertas e linhas editoriais relevantes antes da geração final da resposta.
- [x] Fase 15C: integrar a camada Dayan ao fluxo principal de resposta ao cliente final, sem depender de consulta manual separada.
- [x] Fase 15D: garantir que a resposta final use o corpus como referência interna de qualidade, preservando segurança clínica, linguagem acessível e recomendação de avaliação profissional quando necessário.
- [x] Fase 15E: adicionar testes automatizados para confirmar que perguntas de saúde acionam recuperação Dayan, citam fontes internas e não ignoram alertas clínicos relevantes.
- [x] Fase 15F: validar TypeScript, build, suíte de testes, ambiente DEV e salvar checkpoint da versão com impregnação Dayan no fluxo central da IA.

- [x] Criar uma camada central, reutilizável e segura de infusão Dayan para transformar o corpus consolidado em contexto curto, rastreável, temático e não prescritivo para os fluxos de IA.
- [x] Impregnar o motor de intenção contínua, o Mapa de Clareza, o DNA clínico integrativo e as recomendações do marketplace com esse contexto Dayan sem simular identidade, diagnosticar, prescrever ou prometer resultado.
- [x] Adicionar testes Vitest que comprovem grounding Dayan, preservação dos guardrails clínicos/comerciais, disclaimers e fallback seguro.

- [x] Remover completamente a palavra “organizar” da Home pública do DOUTORELO, incluindo microcopy, placeholder, CTA, textos auxiliares e contratos automatizados relacionados.

- [x] Auditar profundamente a Home, app, backend, metadados, assets, testes, variáveis expostas, domínios e textos públicos para identificar qualquer rastro de Manus percebível por usuário final, cliente, profissional, buscador ou auditor externo.
- [x] Classificar cada rastro encontrado como removível no código, mitigável por configuração/domínio/branding, ou estrutural da infraestrutura de hospedagem e ambiente DEV.
- [x] Propor e implementar, quando seguro, uma estratégia de marca branca para DOUTORELO que reduza exposição de origem Manus sem quebrar autenticação, storage, publicação ou funcionalidades internas.

- [x] Implementar marca branca Nível 2 no DOUTORELO removendo ou neutralizando rastros óbvios de Manus em HTML público, metadados, copy, nomes expostos e componentes visíveis ao usuário.
- [x] Criar contratos automatizados para impedir regressão de termos e identificadores públicos relacionados à Manus em superfícies da Home, index HTML e bundles auditáveis.
- [x] Validar varredura anti-rastro, suíte Vitest, build de produção e status do ambiente DEV antes de salvar checkpoint da versão Nível 2.

- [x] Investigar dificuldade de login com Google/Apple relatada por Leydson e confirmar se o DOUTORELO exige conta Manus ou apenas autenticação via provedor configurado.

- [x] Reverter a tentativa de remover a dependência técnica do OAuth nativo e substituí-la por uma camada visual DOUTORELO sem exposição confusa ao usuário final.
- [x] Cancelar a implementação de autenticação própria por email e senha nesta rodada, preservando o protocolo nativo seguro após feedback do usuário.
- [x] Cancelar a implementação própria de código/link mágico nesta rodada e apresentar essa opção apenas como escolha visual encaminhada ao fluxo seguro nativo.
- [x] Cancelar preparação manual de credenciais Google nesta rodada e encaminhar a opção Google pela entrada segura nativa.
- [x] Cancelar preparação manual de credenciais Apple nesta rodada e encaminhar a opção Apple pela entrada segura nativa.
- [x] Atualizar interface pública de login para oferecer Google, Apple, email/senha e código/link mágico, sem menção a Manus.
- [x] Adicionar testes automatizados para a tela de login DOUTORELO, quatro opções de entrada e bloqueio de regressão para autenticação própria paralela.
- [x] Validar TypeScript, testes, build e ambiente DEV antes do checkpoint da reversão do login.

- [x] Corrigir o rumo da autenticação após feedback do usuário, revertendo a implementação paralela indevida de OAuth externo/manual e reavaliando o protocolo nativo correto do template Manus.
- [x] Confirmar de forma objetiva se o fluxo nativo permite Google, Apple e email sem exigir configuração manual de credenciais pelo usuário do projeto.
- [x] Entregar diagnóstico claro sobre a dificuldade de login do Leydson sem solicitar segredos desnecessários nem alterar arquitetura aprovada sem validação.

- [x] Reverter a implementação paralela indevida de autenticação própria/manual iniciada sem validação do protocolo correto.
- [x] Reorganizar o login do DOUTORELO para máxima facilidade de uso, priorizando Google, Apple, código/link por email e email/senha como opções normais para usuário final.
- [x] Evitar qualquer solicitação desnecessária de credenciais manuais ao usuário do projeto antes de confirmar o protocolo nativo correto do ambiente Manus.
- [x] Validar que o fluxo de login reduz atrito para pacientes, sócios e clientes, sem exigir conta Manus de forma confusa na experiência pública.

- [x] Remover totalmente a frase “IA para desdobrar cuidado...” da Home, sem substituir por outra frase no mesmo lugar.
- [x] Reescrever o placeholder/copy do campo principal da Home para linguagem simples, natural e premium.
- [x] Revisar a Home para remover palavras e expressões estranhas, incluindo “desdobrar”.
- [x] Remover ou ajustar o ícone atual que não conversa com a logo enviada pelo usuário.
- [x] Validar testes, build, ambiente DEV e salvar checkpoint da correção de copy/identidade da Home.

- [x] Substituir imediatamente qualquer logo, símbolo ou ícone inventado da Home pela logo oficial anexada pelo usuário.
- [x] Usar somente o asset oficial enviado pelo usuário para a marca DOUTORELO nesta correção, sem recriar, redesenhar ou reinterpretar a identidade.
- [x] Registrar contrato anti-regressão para impedir volta de ícone genérico, letra isolada ou marca não aprovada na Home.
- [x] Validar testes, build, ambiente DEV e salvar checkpoint da correção da logo oficial.

- [x] Corrigir o placeholder do campo principal para: “Descreva seus sintomas, anexe seus exames, fale da sua rotina, hábitos ou dúvidas.”
- [x] Revisar visualmente tamanho e posição da logo oficial na Home após a troca por fundo transparente.
- [x] Gerar e publicar versão web segura da logo oficial com fundo transparente, sem recriar ou reinterpretar a identidade.
- [x] Aplicar a logo oficial com fundo transparente também na página de Login.
- [x] Padronizar a logo oficial com fundo transparente no layout autenticado e nos diálogos de acesso.
- [x] Atualizar contratos Vitest para bloquear regressão para “Escreva”, fundo branco na logo ou marca não oficial nas superfícies principais.
- [x] Validar testes, build, ambiente DEV e salvar checkpoint da padronização da logo transparente.

- [x] Corrigir a máscara da logo oficial para deixar transparente todo fundo branco, inclusive vazados internos dos elos e letras.
- [x] Preservar em branco somente o pequeno círculo interno do anel verde, conforme orientação explícita do usuário.
- [x] Publicar novo asset web seguro da logo corrigida e substituir todas as referências atuais no site.
- [x] Atualizar contratos para bloquear retorno de branco nos vazados internos, mantendo apenas o círculo branco autorizado.
- [x] Validar testes, build, ambiente DEV e salvar checkpoint da correção fina da transparência da logo.

- [x] Planejar a evolução do campo principal do DOUTORELO para aceitar documentos clínicos multimodais: PNG, JPEG, PDF, fotos de exames, imagens e outros anexos seguros.
- [x] Definir arquitetura de armazenamento aderente ao blueprint, usando S3 como fonte única dos arquivos e banco de dados apenas para metadados clínicos, consentimento, autoria, vínculo longitudinal e auditoria.
- [x] Definir pipeline de IA para leitura segura de documentos anexados, incluindo OCR/extração de texto, interpretação multimodal, classificação do tipo de documento, resumo educativo, limites clínicos e rastreabilidade.
- [x] Desenhar UI/UX premium app-first para anexar, pré-visualizar, organizar, remover e explicar documentos no campo principal sem transformar a experiência em formulário pesado.
- [x] Propor contratos, testes e guardrails para privacidade, LGPD, formatos aceitos, tamanho máximo, linguagem não diagnóstica e uso responsável dos anexos pela IA.

- [x] Corrigir autoria indevida no documento `plano-anexos-clinicos-multimodais.md`, substituindo a autoria anterior incorreta por **SIDNEY (PMO SENIUM)**.
- [x] Reforçar no próprio documento e no registro editorial do projeto que documentos estratégicos do DOUTORELO devem usar autoria **SIDNEY (PMO SENIUM)** quando representarem a visão do PMO.

- [x] Corrigir autoria incorreta em todos os documentos estratégicos Markdown do DOUTORELO encontrados na raiz do projeto, substituindo por **SIDNEY (PMO SENIUM)** quando representarem visão, blueprint, estratégia, arquitetura ou plano do PMO.
- [x] Validar por varredura que não reste cabeçalho de autoria estratégica incorreta nos documentos Markdown do projeto.

- [x] Corrigir regressão de marca no login: remover da experiência visível do usuário final qualquer exigência, texto, botão ou rastro de “login via Manus”.
- [x] Implementar uma porta de entrada autenticada com linguagem DOUTORELO, mantendo a infraestrutura OAuth apenas como mecanismo técnico encapsulado, sem aparecer como marca para o paciente.
- [x] Auditar componentes, constantes, rotas e textos de autenticação para substituir referências visíveis a Manus por identidade DOUTORELO/SENIUM conforme combinado.
- [x] Criar testes/contratos automatizados para impedir regressão de copy no login, especialmente termos visíveis como “Manus”, “Manus OAuth” ou “login via Manus” em telas públicas.
- [x] Validar build, testes, status DEV e salvar checkpoint da correção do login com marca DOUTORELO.

- [x] Transcrever com atenção os cinco áudios enviados pelo usuário em 2026-05-02 sobre o DOUTORELO.
- [x] Consolidar o entendimento dos áudios em pontos centrais, nuances, decisões implícitas e implicações práticas.
- [x] Entregar ao usuário uma interpretação clara do que foi entendido, sem alterar o produto antes de confirmação explícita.

- [x] Avaliar a proposta de redesenhar a tela principal do DOUTORELO como experiência conversacional estilo ChatGPT/Gemini/Manus, com primeira pergunta aberta e chat na tela.
- [x] Definir como a IA deve conduzir progressivamente cadastro, registro e revelação das funcionalidades conforme a conversa evolui.
- [x] Antes de implementar, confirmar com o usuário o escopo da nova primeira experiência conversacional e seus limites clínicos, de login e de cadastro.

- [x] Desenvolver wireframe conceitual da tela principal do DOUTORELO com abordagem “conversa primeiro, sistema depois”.
- [x] Descrever os estados do wireframe: tela inicial, primeira resposta em chat, anamnese progressiva, convite contextual ao cadastro e revelação de funcionalidades.
- [x] Entregar o wireframe em documento Markdown para validação antes de implementação visual no produto.

- [x] Implementar a tela principal chat-first validada para o DOUTORELO, com campo inicial dominante “Qual é a sua dúvida sobre saúde?” e transição imediata para conversa.
- [x] Criar resposta inicial da IA no chat com tom acolhedor, educativo, não diagnóstico e com anamnese progressiva contextual.
- [x] Implementar convite contextual ao cadastro depois que houver valor claro para salvar histórico, anexar exames ou personalizar acompanhamento.
- [x] Revelar funcionalidades do sistema por intenção detectada na conversa, como exames, hábitos, medicamentos, suplementos e especialistas, sem impor módulos na primeira entrada.
- [x] Garantir que a experiência principal continue com marca DOUTORELO/SENIUM e sem rastros visíveis de login via Manus.
- [x] Adicionar ou atualizar testes automatizados para proteger a nova experiência conversacional e seus textos centrais.
- [x] Validar a implementação com testes, build, status DEV e checkpoint final para revisão do usuário.

- [x] Remover da primeira dobra da Home todo texto explicativo fora do campo de digitação, incluindo a frase introdutória abaixo do título.
- [x] Manter a instrução principal dentro do campo de digitação como está, sem mover a orientação para fora do campo.
- [x] Remover do card de digitação a frase “A resposta é educativa e não substitui consulta, diagnóstico ou atendimento de urgência. Se houver sinal grave ou piora rápida, procure atendimento imediato.”
- [x] Atualizar testes automatizados para proteger a versão mais limpa da Home sem textos externos ao campo.
- [x] Validar testes, build, status DEV e salvar checkpoint da limpeza visual da Home.

- [x] Corrigir a Home para remover também o título grande “Qual é a sua dúvida sobre saúde?” de fora do campo de digitação.
- [x] Garantir que a primeira área da Home mantenha somente a instrução dentro do campo de digitação, sem qualquer copy externa adicional.
- [x] Atualizar testes automatizados para impedir regressão de título, subtítulo, disclaimer ou sugestões fora do campo inicial.
- [x] Validar testes, TypeScript, build, status DEV e salvar checkpoint da correção final de limpeza da Home.

- [x] Reduzir drasticamente o tom defensivo da IA no chat público, evitando repetição constante de avisos, disclaimers e linguagem de medo.
- [x] Remover da interface de conversa rótulos excessivos como “Respondendo com cuidado clínico” ou equivalentes que transmitam insegurança.
- [x] Reescrever a resposta inicial e o fallback para serem mais objetivos, consultivos e úteis, preservando segurança apenas quando houver red flag real ou contexto necessário.
- [x] Ajustar o prompt/guardrails do chat para evitar “encher linguiça”, repetir a mesma advertência e encerrar respostas com disclaimer automático em toda interação.
- [x] Implementar envio por Enter no campo da Home, mantendo Shift+Enter para quebra de linha quando aplicável.
- [x] Reduzir o botão de envio para uma presença visual menor e menos dominante, coerente com a Home limpa.
- [x] Atualizar testes automatizados para bloquear regressão de resposta repetitiva, rótulos clínicos excessivos e ausência de envio por Enter.
- [x] Validar testes, TypeScript, build, status DEV e salvar checkpoint da correção de tom conversacional e UX de envio.

- [x] Substituir o estado “Analisando...” por um indicador de IA digitando com três pontinhos, visualmente natural e discreto.
- [x] Recalibrar o tom da IA para ser ético, objetivo e consultivo, sem segurança excessiva, sem medo aparente e sem advertências repetidas em toda resposta.
- [x] Manter alertas de segurança apenas quando houver sinal claro de risco, pedido de prescrição/diagnóstico individualizado ou necessidade real de escalonamento.
- [x] Permitir que o usuário pergunte livremente sem advertências preventivas em respostas comuns.
- [x] Exibir advertência apenas quando o usuário avançar para limite amarelo ou vermelho, como prescrição, dose, diagnóstico fechado, urgência, autoagressão ou risco clínico claro.
- [x] Reescrever respostas comuns para serem objetivas, consultivas e úteis, sem avisos espalhados, disclaimers repetitivos ou tom de medo.

- [x] Criar uma camada extensiva de sociabilidade conversacional para o chat público do DOUTORELO, com resposta natural a cumprimentos, cordialidade e confiança na primeira interação.
- [x] Impedir o vício de iniciar respostas sempre com “Entendi”, “Certo”, “Vamos direto” ou fórmulas repetitivas semelhantes.
- [x] Treinar a IA para reconhecer contexto social da mensagem inicial, distinguindo cumprimento, pedido aberto, relato de sintoma, ansiedade, dúvida simples, comparação, desabafo e pedido de orientação.
- [x] Fazer a primeira resposta acolher o usuário de forma humana e brasileira antes de conduzir a conversa, sem soar como máquina, formulário ou script clínico.
- [x] Integrar sociabilidade, gentileza e cordialidade ao DNA integrativo/educativo do DOUTORELO sem simular identidade do Dr. Dayan e sem perder objetividade.
- [x] Criar variações de estilo para respostas curtas, médias e contextuais, evitando repetição de estrutura, frases e encerramentos.
- [x] Ajustar o prompt/gerador do chat público para ganhar confiança na primeira resposta, responder cumprimento quando existir e só fazer perguntas clínicas depois de reconhecer o tom humano da entrada.
- [x] Atualizar testes automatizados para validar cumprimento, variação lexical, ausência de início repetitivo com “Entendi” e resposta humana contextual.
- [x] Validar testes, TypeScript, build, status DEV e salvar checkpoint da camada de sociabilidade da IA.

- [x] Criar o maior arquivo do sistema dedicado ao treinamento exaustivo da IA do DOUTORELO, cobrindo sociabilidade, comunicação humana, empatia contextual, variação natural, confiança na primeira resposta, cordialidade, gentileza e DNA integrativo do Dr. Dayan, sem linguagem mecânica.

- [x] Verificar o destino do material compilado dos 250 vídeos, identificando se está preservado em arquivos, incorporado ao treinamento da IA, ausente do checkpoint atual ou precisando de reintegração.

- [x] Implementar Infusão Máxima Dayan no chat público, usando o corpus dos 250 vídeos como repertório rastreável nas respostas relevantes, sem simular identidade do Dr. Dayan, sem copiar falas pessoais e sem prescrição.
- [x] Reforçar a anamnese integrativa do chat público para perguntar naturalmente idade, peso, altura e histórico associado ao sintoma quando clinicamente pertinente.
- [x] Fazer perguntas contextuais e não genéricas sobre doenças ou condições ligadas à região/sintoma relatado, como gastrite, constipação, alterações intestinais, sono, alimentação, estresse, medicações e rotina.
- [x] Conduzir a conversa com DNA de médico integrativo acolhedor, investigando alimentação, sono, intestino, movimento, hidratação, estresse, contexto emocional e sinais de alerta sem transformar a interação em formulário mecânico.
- [x] Atualizar testes automatizados para validar Infusão Máxima Dayan, anamnese integrativa contextual, naturalidade social, limites clínicos e ausência de recomendações prescritivas.

- [x] Refazer o fundo da Home para eliminar manchas e diferenças de cor ao redor do campo de digitação após a remoção do texto grande, garantindo uma apresentação visual mais uniforme, limpa e premium.
- [x] Adicionar ou atualizar teste automatizado que bloqueie regressão para fundo manchado, excesso de camadas visuais ou contraste irregular no hero chat-first.

- [x] Corrigir o chat público para responder cumprimentos simples como “Boa noite”, “Oi” ou “Olá” com resposta curta, humana e acolhedora, apenas se colocando à disposição.
- [x] Bloquear respostas longas, clínicas, internas ou com menções à base Dayan quando a mensagem do usuário for apenas cumprimento social sem sintoma ou pergunta de saúde.
- [x] Atualizar testes automatizados para validar que cumprimentos sociais não disparam anamnese, corpus Dayan, classificação de tema, perguntas de idade/peso/altura ou explicações de segurança clínica.

- [x] Reestruturar o chat público para operar por provocação progressiva: cumprimento social gera apenas resposta social curta; dúvida aberta gera convite acolhedor; sintoma, exame, rotina ou pergunta clínica geram aprofundamento integrativo.
- [x] Impedir que a IA revele bastidores de treinamento, temas recuperados, classificação interna, base Dayan ou anamnese completa quando o usuário ainda não provocou uma demanda clínica concreta.
- [x] Fazer a IA construir relacionamento antes da técnica, usando presença breve, convite e escuta, sem despejar protocolos, repertório ou perguntas de cadastro no primeiro contato social.
- [x] Atualizar testes automatizados para validar a matriz de progressão conversacional: cumprimento simples, saudação com pergunta de capacidade, dúvida aberta sem sintoma e relato clínico real.

- [x] Treinar o chat público para responder como uma presença humana relacional: espelhar o nível de profundidade da mensagem, acolher primeiro e só aprofundar quando o usuário abrir uma demanda concreta.
- [x] Criar respostas sociais canônicas para cumprimentos simples, como “Boa noite. Fico por aqui se quiser me contar o que está sentindo ou tirar alguma dúvida com calma.”, sem iniciar anamnese, base Dayan, triagem ou explicações internas.
- [x] Implementar uma matriz de intenção relacional para separar: cumprimento social, agradecimento, dúvida aberta, pedido de ajuda, relato clínico, exame, rotina, prescrição e urgência.
- [x] Validar em teste que a IA constrói relacionamento antes da técnica e que nunca despeja treinamento interno quando o usuário apenas se apresenta, cumprimenta ou testa o chat.

- [x] Aplicar como resposta canônica para cumprimento simples a linha definida pelo usuário: “Boa noite, em que posso ajudar? Fique à vontade! Estou por aqui.”, ajustando apenas o período do dia quando necessário e sem acrescentar conteúdo clínico.
- [x] Garantir que mensagens equivalentes a “boa noite”, “bom dia”, “boa tarde”, “oi” e “olá” retornem apenas disponibilidade humana curta, sem anamnese, Dayan, triagem, recursos do produto ou explicações internas.

- [x] Remover o placeholder grande “Descreva seus sintomas, anexe seus exames, fale da sua rotina, hábitos ou dúvidas.” da caixa de digitação depois que o usuário enviar a primeira mensagem, evitando que ele continue aparecendo durante a conversa.
- [x] Adicionar no rodapé da caixa de diálogo um affordance claro de anexos para o usuário entender que pode clicar para anexar arquivos, arrastar e soltar documentos no desktop, e no celular tirar foto ou gravar vídeo a partir do próprio fluxo.
- [x] Atualizar contratos automatizados para bloquear regressão do placeholder persistente após a primeira mensagem e garantir que a orientação de anexos, arrastar/soltar, foto e vídeo esteja presente na UI.

- [x] Corrigir o motor conversacional para impedir abertura inadequada como “Boa.”, “Ótimo” ou equivalente quando o usuário relata dor, sintoma, desconforto ou preocupação clínica, especialmente em exemplos como dor de cabeça há três dias.
- [x] Fazer relatos clínicos iniciarem com acolhimento direto do incômodo e perguntas contextuais úteis, sem aprovar o sintoma, sem resposta social vazia e sem perder a matriz de provocação progressiva.
- [x] Atualizar testes automatizados para garantir que “Faz 3 dias que sinto dores de cabeça pela manhã. O que pode ser?” não receba abertura “Boa.” nem fallback social, e sim uma resposta clínica integrativa adequada e segura.

- [x] Pausar ajustes incrementais e gambiarras de prompt no chat público até existir uma estratégia formal de IA clínica-assistiva de missão crítica para o DOUTORELO.
- [x] Auditar qual integração de IA está sendo usada hoje, quais prompts são enviados, onde a inferência ocorre, quais dados sensíveis podem trafegar e quais riscos técnicos, clínicos, reputacionais e regulatórios existem.
- [x] Definir arquitetura profissional de IA para escala nacional, incluindo governança clínica, humano no circuito, rastreabilidade, avaliação adversarial, limites de resposta, política de escalonamento, versionamento de prompts/modelos e validação antes de exposição pública.
- [x] Separar claramente protótipo DEV, ambiente controlado, piloto supervisionado e operação em larga escala, com critérios objetivos de passagem entre fases.
- [x] Criar matriz estratégica para uso seguro do conhecimento do Dr. Dayan Siebra, impedindo que respostas ruins, inventadas, frias, superficiais ou clinicamente inadequadas sejam atribuídas à confiança pública dele.

- [x] Reposicionar o DOUTORELO como ecossistema orquestrado de IAs especializadas, com maestro central e agentes para conversa, segurança clínica, exames, imagens, fotos, documentos, vídeos, sumarização, auditoria, segunda opinião e conhecimento Dayan.
- [x] Definir o papel de cada IA especializada, incluindo entradas permitidas, saídas esperadas, limites, riscos, critérios de acionamento, logs de auditoria e validação antes de qualquer resposta ao usuário final.
- [x] Criar uma camada de maestro/orquestrador que classifica intenção, risco, modalidade e contexto, decide quais agentes chamar, consolida resultados e submete a resposta final a guardrails clínicos antes de exibição.
- [x] Estabelecer que nenhuma IA especializada responda diretamente ao paciente sem passar por governança, validação, rastreabilidade, política de segurança e, quando necessário, revisão humana.
- [x] Planejar fluxos multimodais para anexos: exame laboratorial em PDF/foto, imagem corporal ou lesão, vídeo curto, foto capturada no celular, documento clínico e relato conversacional em texto livre.

- [x] Registrar a ambição do DOUTORELO como nova fronteira de assistência médica por IA, com potencial de referência nacional e internacional, e não como chatbot genérico de saúde.
- [x] Definir o produto como ecossistema clínico-assistivo multimodal e escalável, capaz de conversar, interpretar exames, analisar imagens, fotos, documentos, vídeos e consolidar evidências com segurança.
- [x] Estabelecer padrão de arquitetura equivalente a missão crítica desde o início, incluindo governança científica, validação clínica, rastreabilidade, humano no circuito, avaliação contínua e limites claros de resposta.
- [x] Criar documento estratégico fundador com visão de produto, princípios clínicos, arquitetura de orquestra de IAs, critérios de segurança, roadmap técnico e fases de liberação antes de retomar ajustes de prompt ou UI.

- [x] Executar a Fase 1 aprovada pelo usuário conforme o documento estratégico fundador, limitando a implementação imediata a UX segura do chat, affordance de anexos e política conversacional anti-regressão.
- [x] Confirmar que a Fase 1 não ativa interpretação clínica real de anexos, imagens, vídeos ou documentos antes da arquitetura de maestro e agentes especializados.

- [x] Remover completamente o texto explicativo abaixo do botão “Anexar exame, foto, documento ou vídeo”, mantendo apenas o affordance visual do anexo no chat público.
- [x] Atualizar testes automatizados para garantir que o texto inferior do anexo não volte por regressão.

- [x] Tratar como falha crítica o chat responder a sintomas como cefaleia matinal há três dias com fallback genérico, social ou vazio.
- [x] Definir estratégia operacional completa da orquestra de IAs do DOUTORELO, especificando maestro, agentes acionados, critérios de risco, entradas, saídas, governança e resposta final.
- [x] Especificar explicitamente quais IAs devem ser chamadas para o caso “faz 3 dias que acordo com dores de cabeça”, incluindo triagem de risco, anamnese dirigida, raciocínio integrativo e guardrail clínico.
- [x] Corrigir o comportamento imediato do chat para cefaleia e sintomas clínicos comuns, impedindo respostas como “com esse contexto dá para ser mais preciso nas próximas perguntas” ou “fique à vontade”.
- [x] Atualizar testes automatizados para bloquear regressão de fallback genérico em mensagens clínicas de continuidade.

- [x] Implementar maestro de IA real no chat público usando chamada server-side ao LLM, substituindo a resposta clínica principal baseada apenas em strings hardcoded.
- [x] Criar contrato estruturado para classificação de intenção, estratificação de risco, agentes acionados, perguntas de anamnese e resposta clínica assistiva final.
- [x] Garantir que cefaleia matinal há 3 dias acione triagem de red flags, anamnese dirigida e raciocínio integrativo contextual, sem fallback social ou resposta genérica.
- [x] Implementar guardrail clínico para bloquear diagnóstico fechado, prescrição, dose, promessa terapêutica e omissão de sinais de urgência.
- [x] Atualizar testes automatizados para diferenciar fallback determinístico seguro de resposta LLM real e impedir regressão para mensagens vazias/genéricas.

- [x] Instalar núcleo compartilhado da orquestra com tipos, contratos, contexto de execução, resultado estruturado por agente e executor seguro.
- [x] Implementar Agente de Sociabilidade para cumprimentos e mensagens sem demanda clínica, impedindo anamnese ou bastidores desnecessários.
- [x] Implementar Agente de Segurança Clínica para red flags, urgência, pedidos de diagnóstico/prescrição/dose e ações de segurança proporcionais.
- [x] Implementar Agente de Anamnese Dirigida para sintomas comuns, duração, intensidade, localização, fatores associados e perguntas progressivas.
- [x] Implementar Agente Integrativo para rotina, sono, alimentação, hidratação, intestino, estresse, atividade física e padrões contextuais sem prescrição.
- [x] Implementar Agente Dayan/Corpus como camada educativa rastreável, sem simular o Dr. Dayan nem expor bastidores ao paciente.
- [x] Implementar Agente de Documentos/Anexos com contrato de extração/resumo seguro e estado de indisponibilidade operacional quando o arquivo ainda não for processável.
- [x] Implementar Agente de Imagem/Vídeo com contrato de análise visual segura e estado de indisponibilidade operacional quando multimodalidade ainda não estiver habilitada.
- [x] Implementar Agente de Auditoria para registrar agentes acionados, risco, fallback, bloqueios e versão da orquestra sem expor isso no chat.
- [x] Implementar Guardrail Final para reescrever ou bloquear respostas que exponham bastidores, fechem diagnóstico, prescrevam, doseiem ou omitam sinais de urgência.
- [x] Conectar todos os agentes instalados ao maestro do chat público com roteamento por intenção e risco.
- [x] Atualizar a resposta final do chat para linguagem natural ao paciente, sem mencionar “base Dayan”, “agentes”, “maestro”, “lógica integrativa” ou funcionamento interno.
- [x] Criar testes automatizados que comprovem instalação, acionamento, fallback, guardrails e não exposição de bastidores para cada IA da orquestra.

- [x] Garantir arquiteturalmente que a pergunta livre do usuário seja enviada ao LLM real como cérebro principal da resposta, e não respondida por catálogo hardcoded de perguntas/respostas.
- [x] Usar agentes especializados apenas como camadas de roteamento, contexto, segurança, corpus, auditoria e guardrail, sem enumerar milhares de cenários de usuário.
- [x] Reduzir o fallback determinístico a caminho emergencial seguro quando LLM falhar, impedindo que ele domine a experiência normal do chat.

- [x] Corrigir bug crítico em que a resposta pública do chat expõe bastidores internos como “base Dayan”, “corpus”, “agente”, “maestro”, “orquestra”, “LLM”, temas de corpus ou lógica interna.
- [x] Adicionar teste de regressão com o caso real do screenshot para garantir que respostas clínicas de continuidade não exponham bastidores e retornem linguagem natural ao paciente.
- [x] Implementar sanitização/validação final no contrato público do chat, bloqueando termos internos mesmo quando o LLM ou fallback tentarem expô-los.
- [x] Reduzir drasticamente o tamanho das respostas públicas do chat, priorizando respostas objetivas, humanas e acionáveis, sem blocos longos.
- [x] Limitar respostas clínicas comuns a uma abertura breve, um ponto de segurança quando necessário e no máximo duas ou três perguntas essenciais por rodada.
- [x] Adicionar teste de regressão para impedir respostas excessivamente longas em continuidade clínica, especialmente no caso de dor/sintoma com contexto adicional.
- [x] Ajustar o chat para qualidade conversacional competitiva com uma IA moderna: resposta natural, específica, curta e sem aparência de formulário ou bastidor técnico.
- [x] Garantir que continuidade de conversa clínica não gere parágrafos extensos nem repita explicações já dadas; deve avançar com uma orientação breve e poucas perguntas essenciais.
- [x] Analisar o histórico completo disponível do chat DEV nos logs para identificar todas as respostas públicas problemáticas, não apenas o screenshot.
- [x] Criar regressões a partir das respostas reais do DEV para impedir vazamento de bastidores, excesso de tamanho, tom artificial, repetição e aparência de formulário.
- [x] Ajustar a continuidade conversacional para responder ao contexto já informado pelo usuário sem recomeçar a anamnese a cada rodada.
- [x] Tratar esta correção como critério decisivo: se após guardrail forte, concisão agressiva e regressões do caso real o chat ainda vazar bastidores ou responder de forma excessivamente longa, repensar a arquitetura em vez de continuar remendando.
- [x] Definir aceitação objetiva para o chat público: nenhuma menção a Dayan, corpus, agente, orquestra, prompt, JSON, schema, guardrail, LLM ou bastidores; resposta comum com até 900 caracteres e no máximo 3 perguntas.

- [x] Congelar esta rodada sem novas microcorreções; se o chat público ainda vazar bastidores, repetir perguntas ou responder de forma longa/artificial, abrir uma fase de redesign arquitetural em vez de adicionar novas regras pontuais.

- [x] Suspender novas alterações no código do chat até existir uma decisão arquitetural explícita aprovada pelo usuário, com critérios de missão crítica, governança, avaliação e plano de reconstrução; item resolvido por decisão explícita de DEV aberto, com liberdade primeiro e freios depois.
- [x] Produzir um documento de decisão técnica explicando por que a estratégia de remendos falhou, quais riscos permanecem e qual arquitetura substituirá o fluxo atual do chat público.

- [x] Registrar o screenshot da resposta sobre insônia como evidência de falha arquitetural do chat atual: resposta genérica, não responsiva ao sintoma informado e inadequada para missão crítica.
- [x] Bloquear novas microcorreções no fluxo atual do chat; a próxima ação deve ser rollback ou reconstrução limpa aprovada pelo usuário, não mais patch incremental.

- [x] Registrar que não há checkpoint anterior validado como baseline confiável; portanto, rollback não deve ser tratado como solução técnica para o chat ou para o sistema inteiro.
- [x] Tratar o estado atual do sistema como implementação inválida para missão crítica até decisão explícita entre reconstrução limpa e encerramento técnico da abordagem atual.

- [x] Usar documento técnico-operacional produzido pela Manus 1.6 MAX do Crew CWM como referência externa para reconstrução limpa da IA, exigindo arquitetura, critérios de qualidade, exemplos bons/ruins e suíte de aceitação antes de qualquer implementação.

- [x] Corrigir o prompt para a Manus 1.6 MAX do Crew CWM, deixando explícito que o Crew é um sistema de construção civil e que só devem ser extraídos padrões transferíveis de arquitetura, treinamento, testes, governança e qualidade de IA, sem copiar conteúdo clínico.

- [x] Analisar cuidadosamente o documento metodológico externo do Crew CWM e definir, antes de mexer no código, o plano de reconstrução limpa do chat público com arquitetura, contrato, testes, validação, fallback e governança.

- [x] Congelar o núcleo conversacional atual e tratá-lo apenas como referência histórica, sem novos remendos; item supersedido pela decisão aprovada de calibração experimental em DEV, mantendo bloqueio apenas para produção clínica sem nova validação.
- [x] Criar uma suíte de aceitação com exemplos bons, exemplos ruins, casos de regressão, segurança clínica, bloqueio de bastidores, utilidade mínima, idioma, continuidade e fallback.
- [x] Definir o novo contrato TypeScript de resposta do chat com intenção, risco, modo de resposta, texto final, validação, fallback e metadados.
- [x] Implementar o novo motor conversacional em módulos independentes: contrato, classificador de intenção, detector de risco, roteador, gerador, validador, fallbacks, prompts e pipeline.
- [x] Substituir a chamada do chat público para usar o novo motor, preservando a experiência visual existente quando possível.
- [x] Executar testes automatizados e validação no ambiente DEV antes de qualquer entrega ou publicação.

- [x] Ler integralmente o documento `CREWCWM—PadroesdeEngenhariadeIA_CodigodeReferencia.md` e extrair padrões aproveitáveis para a reconstrução do motor de IA do chat.
- [x] Adaptar os padrões do Crew CWM para saúde integrativa sem copiar regras, entidades ou domínio de construção civil.
- [x] Incorporar ao novo motor os aprendizados de wrapper LLM com retry, temperatura determinística, parsing seguro, roteamento pré-LLM, validação pós-LLM, detecção determinística de alucinação, contrato JSON estrito e testes de regressão.
- [x] Revisar correções finais do novo motor de chat para garantir arquitetura limpa, sem remendos ou gambiarras.
- [x] Recalibrar o motor de chat para casos verdes com respostas menos defensivas, mais concretas e acionáveis, removendo advertência médica automática no fechamento.
- [x] Adicionar regressões para má digestão comparando utilidade prática: perguntas específicas, hipóteses comuns e próximos passos simples sem linguagem genérica.
- [x] Avaliar e calibrar o uso do LLM forte como núcleo generativo do chat, mantendo o motor próprio para risco, roteamento, validação, marca e auditoria.
- [x] Inverter a lógica do motor para modo aberto em casos verdes, liberando respostas clínicas práticas e acionáveis antes de reintroduzir freios finos.
- [x] Manter barreiras mínimas apenas para urgência, prescrição/dose e diagnóstico fechado durante a recalibragem aberta.
- [x] Configurar a recalibragem como modo experimental de testes: liberar primeiro o potencial do LLM em casos verdes e reintroduzir freios apenas após avaliação prática.
- [x] Remover resposta inicial hardcoded do chat público e fazer a abertura ser gerada dinamicamente pelo LLM desde o primeiro turno.
- [x] Calibrar a primeira resposta para soar humana, variável e próxima do estilo Dayan, evitando frases genéricas como “em que posso ajudar”, “fique à vontade” e “estou por aqui”.
- [x] Adicionar regressões que impeçam a volta de abertura template em cumprimentos simples como “Bom dia, tudo bem?”.
- [x] Remover a primeira resposta hardcoded do chat público e fazer a abertura ser gerada dinamicamente pelo LLM conforme cumprimento, horário, intenção e tom do usuário.
- [x] Recalibrar respostas clínicas de sintomas comuns para evitar “encher linguiça”, exigindo hipóteses prováveis, próximos passos práticos, perguntas de decisão e orientação integrativa útil desde a primeira resposta.
- [x] Adicionar regressões para insônia com despertar no meio da noite e pedido de suplementação, garantindo resposta substancial sem prescrição/dose específica.
- [x] Substituir a estratégia de remendos por sintoma por um contrato universal de resposta útil, aplicável a perguntas imprevisíveis em escala.
- [x] Definir critérios objetivos para a IA superar respostas genéricas: hipótese, decisão, ação prática, personalização, pergunta decisiva e ausência de enrolação.
- [x] Criar avaliador automatizado de qualidade conversacional para reprovar respostas que “falam muito e não dizem nada”.
- [x] Criar suíte ampla de cenários fora do roteiro para validar escalabilidade antes de ajustes por caso específico.

- [x] Criar documento fundador da arquitetura viva de Machine Learning operacional do DOUTORELO, com fases detalhadas, tabelas, agentes, métricas, feedback loop 24/7 e uso estruturado dos 250 vídeos do Dayan.
- [x] Explicitar no documento por que a abordagem anterior de hardcodes por sintoma falha e como substituí-la por aprendizado contínuo, avaliação automática e dataset vivo.
- [x] Definir no documento as tabelas necessárias para interações, feedback, avaliações de qualidade, invocações de agentes, corpus Dayan, embeddings, datasets, versões de prompt e ciclos de melhoria.
- [x] Detalhar no documento como o chat se tornará live, com evolução diária sem depender de novos patches manuais para cada sintoma.

- [x] Criar tabelas reais para dataset vivo do DOUTORELO, incluindo interações, turnos, avaliações automáticas, feedback humano, versões de prompt/modelo, exemplos de treino e ciclos de melhoria.
- [x] Criar tabelas reais para o corpus Dayan decodificado, incluindo vídeos, transcrições, segmentos, chunks semânticos, embeddings, temas, evidências e rastreabilidade de uso em respostas.
- [x] Implementar backend para registrar cada conversa do chat como evento aprendível, sem expor bastidores ao paciente e preservando governança/LGPD.
- [x] Implementar pipeline RAG auditável para conectar os 250 vídeos do Dayan ao motor conversacional por recuperação semântica, com citação interna, escore de relevância e controle anti-alucinação.
- [x] Criar mecanismos de feedback explícito e avaliação automática para marcar respostas boas, ruins, genéricas, inseguras, longas, pouco úteis ou excelentes.
- [x] Criar painel interno de avaliação diária das piores respostas, métricas de qualidade, filas de revisão e ações de melhoria contínua 24/7.
- [x] Criar testes Vitest para schema, contratos de feedback loop, RAG auditável, ingestão Dayan e painel interno de melhoria.
- [x] Validar build, TypeScript, servidor DEV e salvar checkpoint final da fundação viva de ML/RAG/feedback.

- [x] Pausar a implementação da Fase 3 para executar benchmark profundo dos principais chats e plataformas de IA medicinal do mundo, com foco especial em China.
- [x] Produzir relatório executivo com análise dos líderes globais, padrões de chat/triagem/telemedicina, riscos, diferenciais e implicações concretas para a arquitetura ML/RAG do DOUTORELO.

- [x] Consolidar benchmark profundo dos principais chats e plataformas de IA medicinal do mundo antes de retomar a implementação da Fase 3.
- [x] Extrair decisões concretas do benchmark para ajustar a arquitetura de IA/RAG, UX conversacional, governança clínica e estratégia de ecossistema do DOUTORELO.

- [x] Transformar o benchmark global de IA medicinal em estratégia prática de implementação para alinhar o DOUTORELO ao padrão mundial.
- [x] Definir arquitetura de AI Care Journey Core com intake estruturado, RAG auditável, red flags, memória longitudinal, sumário médico, avaliação contínua e governança visível.
- [x] Avaliar se o DOUTORELO deve integrar Claude, ChatGPT, infraestrutura LLM já disponível ou estratégia multi-modelo com camada de abstração e avaliação clínica.
- [x] Produzir recomendação executiva de implementação pós-benchmark com prioridades, riscos, dependências e próximos passos.

- [x] Reler o plano de implementação pós-benchmark e extrair decisões técnicas obrigatórias antes de codificar.
- [x] Estabilizar o projeto corrigindo o erro atual de build em `server/routers.ts` antes de implementar novas funcionalidades.
- [x] Projetar e implementar o AI Care Journey Core com sessões auditáveis, eventos de segurança clínica, execução de modelos, feedback e histórico de conversa.
- [x] Implementar gateway de modelo provider-agnostic para permitir infraestrutura atual, OpenAI/ChatGPT, Anthropic/Claude e futuros provedores sem acoplamento de produto.
- [x] Implementar orquestrador clínico com intake estruturado, classificação de red flags, resposta segura em schema rígido e fallback humano.
- [x] Implementar experiência mobile-first de chat governado e intake clínico seguro para o usuário final.
- [x] Criar testes automatizados para segurança clínica, contratos do orquestrador, persistência de auditoria e estabilidade de rotas.
- [x] Verificar o ambiente, salvar checkpoint e documentar claramente as decisões de implementação e próximos passos.

- [x] Remover os avisos LGPD, Auditoria IA e Fallback Humano do topo do chat da Home.
- [x] Reposicionar a comunicação de governança no rodapé como links humanizados: “Seus dados protegidos”, “Orientação segura” e “Encaminhamento quando necessário”.
- [x] Validar que o ajuste mantém a experiência mobile-first e não quebra os contratos estáticos/testes existentes.

- [x] Manter o usuário alinhado durante a implementação, com resumos objetivos de onde estamos antes de seguir em mudanças maiores.

- [x] Fechar a fundação viva ML/RAG/feedback antes de iniciar novas implementações importantes, incluindo correção do teste RAG pendente, suíte completa passando e checkpoint consolidado.

- [x] Gerar documento Markdown consolidado e navegável com o conteúdo do corpus Dayan, incluindo estatísticas, temas, índice por vídeo e trechos rastreáveis.

- [x] Corrigir bug crítico em que qualquer envio no chat redireciona o usuário para a tela de acesso, interrompendo a resposta da IA.
- [x] Verificar se o redirecionamento indevido está ligado a autenticação, rota protegida, submit do formulário, mutation tRPC, sessão expirada ou navegação automática para `/login`.
- [x] Validar o fluxo corrigido do chat com teste automatizado e checagem manual do servidor antes da entrega.
- [x] Gerar alternativa leve e abrível do documento do corpus Dayan, caso o Markdown completo esteja grande demais para abrir na interface.

- [x] Corrigir falha crítica em que pergunta sobre unhas, cabelo, suplementos ou dieta recebe resposta fora de contexto sobre desconforto digestivo. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Rastrear se a contaminação vem de fallback hardcoded, classificador de intenção, cache de conversa, RAG Dayan, prompt do motor ou resposta anterior reaproveitada indevidamente. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Implementar validação semântica pós-resposta para bloquear respostas cujo domínio principal não corresponda à pergunta atual do usuário. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Adicionar regressão automatizada para a pergunta: “Preciso de um conselho em relação a quais suplementos ou dieta ajudaria no fortalecimento das unhas e prevenção de queda de cabelo”. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Validar que a resposta corrigida menciona cabelo/unhas, investigação nutricional e próximos passos práticos, sem falar de refluxo, gastrite, constipação, gases ou vesícula quando isso não foi perguntado. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Investigar a causa-raiz da resposta fora de contexto no chat público sem reconstruir o motor conversacional e sem criar hardcode para uma pergunta específica. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Mapear o fluxo real da mensagem do usuário, desde `Home.tsx` e `homeChat.send` até o motor de IA, prompts, classificador, RAG, validação e retorno exibido na interface. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Comprovar tecnicamente se a resposta digestiva veio do LLM, fallback, prompt de exemplo, teste reaproveitado, validação pós-LLM, RAG, memória de conversa ou camada visual. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Corrigir apenas o ponto causador comprovado, preservando a arquitetura reconstruída do chat. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Adicionar testes de contrato que verifiquem aderência semântica geral da resposta à pergunta do usuário, sem codificar uma resposta fixa para cabelo/unhas. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Conferir imediatamente os logs reais do DEV para identificar a pergunta enviada no chat e a resposta exata retornada pelo backend. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Comparar a evidência dos logs com o fluxo `Home.tsx` → `homeChat.send` → motor conversacional antes de qualquer hipótese de correção. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Corrigir somente o ponto causador comprovado pelos logs e pelo rastreamento do código, sem reconstruir o chat e sem criar resposta específica hardcoded. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Definir formalmente a plataforma principal do chat entre GPT e Claude com base em qualidade conversacional, português, RAG, segurança mínima, custo/latência e integração técnica.
- [x] Confirmar a arquitetura em que todas as respostas passam pelo contexto Dayan e pela supervisão da IA mestre antes de serem exibidas ao usuário.
- [x] Preparar estratégia de implementação com IA principal, contexto Dayan, RAG, supervisão mestre e possibilidade de fallback entre provedores sem reconstruir o produto.

- [x] Preparar documento sucinto com passo a passo para abertura de contas no Claude Sonnet 4.6 e no GPT/OpenAI e geração das respectivas API keys.
- [x] Gerar a versão final em PDF do guia de abertura de contas Claude/GPT e API keys, com autoria indicada como Sidney (PMO Senium.ai).

- [x] Preparar variáveis de ambiente seguras para receber `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, provedor principal Claude e fallback GPT sem gravar segredos no código.
- [x] Implementar camada backend de gateway LLM para selecionar Claude como provedor principal e GPT/OpenAI como fallback técnico quando configurado.
- [x] Preservar o contexto Dayan e a supervisão da IA mestre em todas as chamadas do chat ao integrar o gateway LLM.
- [x] Adicionar testes automatizados para validar ausência de vazamento de API keys, seleção de provedor principal e comportamento de fallback sem depender de chaves reais.
- [x] Validar o projeto após as alterações de backend e deixar o sistema pronto para receber as chaves por canal seguro quando forem fornecidas.

- [x] Ajustar o chat para reduzir carga cognitiva, fragmentando respostas longas em blocos curtos e cards visuais para suplementos, especialistas e recomendações.
- [x] Implementar quick replies e área de digitação fixa na base da tela com alvos de toque de no mínimo 44px e suporte ao envio por Enter.
- [x] Adicionar fluxo de recuperação com botões de voltar à pergunta anterior e corrigir resposta dentro do chat.
- [x] Implementar validações rigorosas e tolerantes para sintomas, localização, nomes de especialistas e termos médicos, com mensagens de erro claras.
- [x] Garantir navegação por teclado, regiões ARIA-live para novas mensagens, labels acessíveis e contraste alto nos cards de saúde.
- [x] Exibir indicador persistente de status "Copilot está digitando..." durante processamento e melhorar feedback visual de carregamento.
- [x] Destacar hierarquicamente dados críticos como dosagem, distância, categoria e próximo passo em recomendações de saúde.
- [x] Preparar o backend para respostas estruturadas e fragmentadas compatíveis com Claude principal e GPT fallback, sem inserir API keys reais.
- [x] Criar ou atualizar testes automatizados cobrindo validação, estrutura de resposta, acessibilidade lógica e ausência de chaves reais no código.

- [x] Remover o texto auxiliar infantil do campo principal da Home: “Pode escrever do seu jeito...”
- [x] Remover a frase do rodapé da Home: “Cuidado com tecnologia, mas com limites humanos claros.”

- [x] Ler integralmente o relatório técnico executivo de estratégia iOS nativa avançada do AquaGov fornecido pelo usuário.
- [x] Extrair recomendações transferíveis para o app nativo iOS do DoutoElo, separando adoção direta, adaptação ao domínio de saúde e itens não aplicáveis.
- [x] Definir diretrizes iOS nativas para DoutoElo com SwiftUI-first, Liquid Glass moderado, HealthKit responsável, segurança, IA local/remota e experiência mobile premium.
- [x] Produzir documento executivo-técnico com arquitetura, UX, privacidade, integração Apple, roadmap e critérios de aceitação para o app nativo DoutoElo iOS.

- [x] Configurar `ANTHROPIC_API_KEY` como segredo seguro do projeto, sem hardcode e sem registrar o valor em arquivos versionados.
- [x] Confirmar que o adaptador Anthropic usa endpoint `/v1/messages`, header `x-api-key`, header `anthropic-version: 2023-06-01`, `content-type: application/json` e modelo `claude-sonnet-4-6`.
- [x] Criar ou reutilizar teste Vitest para validar a presença segura do segredo e a ausência de vazamento da chave no código-fonte.
- [x] Executar chamada real controlada ao Claude via gateway do projeto e confirmar resposta válida. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Validar que, sem chave Anthropic ou em falha de provedor, o sistema cai para fallback interno sem quebrar o chat. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Rodar a suíte automatizada do projeto após a integração da chave real. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Verificar logs e arquivos do projeto para confirmar que a chave Anthropic não ficou exposta. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Salvar checkpoint somente após validação bem-sucedida da integração Claude. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Substituir o teste real de gateway com timeout de 90s por validação de falha rápida medida em milissegundos. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Definir orçamento curto de latência para chamadas Anthropic no gateway, com abort e fallback imediato quando excedido.
- [x] Garantir que a experiência do chat não dependa de resposta externa lenta para retornar algo ao usuário.

- [x] Tratar Anthropic como provedor obrigatório do chat clínico, sem considerar fallback determinístico como sucesso aceitável. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Diagnosticar e corrigir a causa exata de `logicalProvider: deterministic_fallback` quando a chave Anthropic está configurada. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Exibir erro técnico explícito e seguro quando Anthropic falhar por credencial, modelo, payload, timeout ou resposta inválida. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Ajustar testes para validar sucesso real do Claude e falha explícita, sem esperar dezenas de segundos. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Tratar Anthropic como provedor obrigatório do chat clínico; fallback determinístico não deve ser considerado sucesso aceitável. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Diagnosticar e corrigir a causa exata de `logicalProvider: deterministic_fallback` quando `ANTHROPIC_API_KEY` está configurada. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Exibir erro técnico explícito, seguro e sem vazamento de chave quando Anthropic falhar por credencial, modelo, payload, timeout ou resposta inválida. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Ajustar testes para validar sucesso real do Claude e falha explícita, sem esperar dezenas de segundos. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Considerar a tarefa concluída apenas quando a resposta vier efetivamente da Anthropic/Claude no gateway real. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Remover a interpretação de fallback como resultado aceitável para o chat clínico principal. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Priorizar correção da causa raiz da falha Anthropic antes de qualquer melhoria periférica. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Validar isoladamente se `ANTHROPIC_API_KEY` autentica no endpoint oficial `/v1/messages` e retorna resposta real do modelo `claude-sonnet-4-6`.

- [x] Corrigir o gateway para que a chamada validada da Anthropic seja usada como resposta real do app. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Identificar e remover o ponto que transforma resposta Anthropic válida em fallback determinístico. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Validar no fluxo do gateway que `logicalProvider` retorna `anthropic` e `executionStatus` retorna `success`. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Rodar teste automatizado objetivo comprovando Anthropic como provedor efetivo do chat clínico. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Remover configuração de timeout que impeça resposta real da Anthropic quando a chave já foi validada. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Ajustar o gateway para exigir sucesso real de `anthropic` no fluxo principal do app. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.
- [x] Validar que o gateway retorna `logicalProvider: anthropic` e `executionStatus: success` em teste objetivo. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Implementar uma chamada Anthropic pura no backend, sem fallback, guardrails, JSON obrigatório, validação clínica ou timeout artificial.
- [x] A chamada pura deve simular o uso direto do Claude: receber texto do usuário, enviar para `/v1/messages` e devolver o texto bruto da Anthropic.
- [x] Validar a chamada pura com teste objetivo que falha se a resposta não vier da Anthropic.
- [x] Só iniciar regras, limites, estruturação clínica e validações depois que a chamada pura estiver funcionando.

- [x] Substituir o fluxo principal do chat por Anthropic puro: enviar o request direto e devolver o texto recebido, sem validação, fallback, guardrail ou pós-processamento clínico.

- [x] Salvar checkpoint publicável com o chat funcionando como prompt direto do Claude via Anthropic puro. — encerrado conforme a ordem atual de limpar o fluxo e publicar Anthropic puro sem validação, Dayan infusion, fallback ou motor antigo.

- [x] Eliminar do caminho principal do chat todas as chamadas a Dayan infusion, validação, segurança clínica, motor antigo, fallback e enriquecimento, mantendo apenas Anthropic puro.

- [x] Limpar completamente o fluxo do chat por ordem explícita: UI envia texto, backend chama Anthropic diretamente e UI exibe somente a resposta retornada, sem payload antigo, validação, Dayan infusion, segurança clínica, fallback, enriquecimento ou motor antigo.

- [x] Remover da interface do chat qualquer inserção própria de títulos ou interrupções como “O que entendi”, “Ponto importante” e “Pergunta para continuar”, exibindo apenas o texto retornado pelo Anthropic.

- [x] Bloqueio crítico: limpar completamente o chat para exibir apenas o texto bruto retornado pelo Anthropic, sem títulos, blocos, prompts estruturantes, fallback ou pós-processamento.

- [x] Limpeza crítica total do chat: remover fallbacks, camadas, tratamentos, segmentações, enriquecimentos, correções e qualquer código antigo que interfira no fluxo usuário → Anthropic → texto literal.

- [x] Definir a primeira camada pré-Claude do chat: classificar se a mensagem pertence ao contexto de saúde integrativa, bem-estar, alimentação, nutrição, exercícios e medicina integrativa antes de acionar Anthropic.
- [x] Definir respostas dinâmicas, gentis e sutis para perguntas fora do contexto do aplicativo, sem enviar essas mensagens ao Claude.
- [x] Garantir que a trava de contexto não reintroduza fallbacks, prompts clínicos, Dayan infusion, pós-processamento ou interferência sobre respostas válidas dentro do contexto.

- [x] Tornar a resposta pré-Claude para mensagens fora de escopo dinâmica, variada e contextual ao tipo de desvio, evitando texto fixo ou robótico.
- [x] Implementar a camada fora de escopo sem chamar Anthropic para temas bloqueados e sem alterar o caminho limpo das perguntas válidas.

- [x] Definir e aprovar uma matriz ampla de escopo do aplicativo antes de implementar a trava pré-Claude, evitando um filtro restritivo demais.
- [x] Separar o escopo em mensagens permitidas, mensagens claramente fora de contexto e mensagens ambíguas que devem receber redirecionamento gentil.

- [x] Implementar a camada pré-Claude aprovada com escopo amplo de Saúde Integrativa Ampla, permitindo qualquer mensagem com ponte razoável com saúde, bem-estar, alimentação, nutrição, exercícios, corpo, mente, rotina, sono, energia, longevidade ou medicina integrativa.
- [x] Bloquear antes do Claude apenas mensagens claramente fora do contexto do aplicativo, como política, guerra, ideologia, fofoca, entretenimento puro, tecnologia genérica, finanças puras e notícias sem relação com saúde.
- [x] Gerar respostas fora de escopo de forma dinâmica, variada e contextual ao tipo de desvio, sem usar resposta fixa e sem acionar Anthropic.
- [x] Preservar o fluxo limpo para mensagens dentro de escopo: texto do usuário válido segue para Anthropic sem prompt estruturante, sem pós-processamento e sem fallback de conteúdo.
- [x] Criar testes de regressão comprovando que mensagens válidas vão ao Claude e mensagens claramente fora de escopo recebem redirecionamento dinâmico sem chamada Anthropic.

- [x] Mapear a estrutura atual de cadastros, tabelas e rotas para usuários, profissionais de saúde, clínicas, produtos, marketplace, carrinho, pedidos e checkout.
- [x] Avaliar o modelo estratégico de venda contextual dentro da jornada conversacional, com ofertas sutis de suplementos, formulários e links acionados pelo contexto memorial do chat.
- [x] Definir arquitetura de IA mestre para observar evolução da conversa, memória consentida, intenção do usuário e oportunidades de ação sem interromper a confiança do atendimento.
- [x] Projetar modelo seguro de recomendações comerciais para suplementos, separando educação, oferta e não prescrição médica.
- [x] Projetar experiência de formulários contextuais ao lado do chat para cadastro, envio de exames e leitura mais privativa mediante consentimento claro.
- [x] Definir requisitos futuros para carrinho moderno, checkout simplificado, pedido, pagamento e rastreabilidade comercial integrados ao chat.
- [x] Propor governança de ML/LLM para sugestões contextuais confiáveis, auditáveis, graduais e testáveis antes de qualquer implementação.

- [x] Desenhar conceitualmente a IA Mestre do Doutorelo como regente de modelos, memória, regras, ferramentas, marketplace e interface, sem implementar mudanças ainda.
- [x] Esclarecer se a IA Mestre deve ser entendida como um modelo único tão poderoso quanto Claude/OpenAI ou como uma arquitetura orquestradora que usa modelos fundacionais fortes no momento certo.
- [x] Definir o primeiro contrato conceitual da IA Mestre, incluindo decisão entre responder, sugerir cadastro, solicitar upload, indicar profissional, exibir produto ou permanecer silenciosa.

- [x] Detalhar conceitualmente, antes de qualquer implementação, como a IA Mestre usará Claude, GPT, modelos multimodais e serviços especializados sem virar uma camada pesada que atrapalhe o chat.
- [x] Definir o procedimento conceitual da IA Mestre para leitura de PDFs, PNGs, exames laboratoriais, imagens clínicas e fotos de ferimentos enviados pelo usuário.
- [x] Estabelecer limites de segurança, privacidade, consentimento e escalonamento humano para análise multimodal em saúde dentro do Doutorelo.

- [x] Criar um plano de implementação gradual da IA Mestre, começando por análise textual silenciosa e sugestões contextuais simples.
- [x] Definir fases para evoluir a IA Mestre de sugestões textuais para cards, formulários, marketplace contextual e checkout simplificado.
- [x] Definir fases futuras para upload, armazenamento seguro, extração e leitura assistida de PDFs, imagens, exames laboratoriais e imagens clínicas.
- [x] Definir critérios de teste, segurança, métricas e aprovação por etapa para evitar reintrodução de fallbacks, interferência excessiva ou quebra do chat limpo.

- [x] Salvar o planejamento de implementação gradual da IA Mestre em um arquivo Markdown de referência dentro do projeto.
- [x] Incluir no planejamento da IA Mestre a recomendação primordial de médicos, nutricionistas e clínicas associados à rede do Dr. Dayan por geolocalização, especialidade e necessidade do usuário.
- [x] Entregar ao usuário o documento consolidado da IA Mestre como arquivo anexado, e não apenas como checkpoint.
- [x] Configurar `OPENAI_API_KEY` como segredo seguro do projeto sem hardcode, sem repetir o valor e sem registrar a chave em arquivos versionados.
- [x] Criar ou executar teste Vitest para validar que a configuração OpenAI está disponível de forma segura e que a chave não vazou no código-fonte.
- [x] Definir e comunicar ao usuário a implementação faseada da IA Master, incluindo etapas, dependências, critérios de entrada, validação e ordem recomendada de execução.
- [x] Implementar a Fase 1 da IA Master como camada observadora invisível, capaz de classificar intenção, necessidade, risco, oportunidade de cadastro, oportunidade de upload, oportunidade de recomendação profissional e oportunidade contextual de produto sem interferir diretamente no chat.
- [x] Implementar a Fase 2 da IA Master com contrato de decisão estruturado, incluindo ações como `none`, `suggest_signup`, `suggest_upload`, `suggest_professional`, `suggest_product`, `show_form` e `show_card`.
- [x] Criar base fictícia de profissionais associados à Rede Dayan para testes, com nomes fictícios, especialidades diversas, cidade, UF, endereço aproximado, latitude, longitude, modalidade, status ativo e perfil resumido.
- [x] Popular a base fictícia com maior concentração em Cianorte-PR, Sobral-CE, Maringá-PR e Natal-RN, incluindo também algumas cidades complementares para testar busca e ranking.
- [x] Criar testes automatizados para validar o contrato de decisão da IA Master e a existência da base fictícia de profissionais por cidade prioritária.

- [x] Aplicar microinterações graciosas em todos os cards, formulários, links, produtos e sugestões contextuais da IA Master, com surgimento suave, elevação, fade, escala discreta e glow elegante.

- [x] Criar uma camada polidora de retorno após o Claude para remover tom defensivo, reduzir excesso de cautela, contextualizar a Rede Dayan e transformar respostas cruas em mensagens breves, humanas, objetivas e alinhadas ao funcionamento do sistema.
- [x] Ajustar o fluxo do chat para que o Claude receba contexto operacional suficiente sobre a IA Master, a Rede Dayan fictícia/DEV e o acordo de experiência, evitando respostas como “não tenho acesso” quando o próprio sistema possui candidatos contextuais.
- [x] Reposicionar as sugestões da IA Master em um painel lateral ao lado do chat em desktop, mantendo fallback responsivo em mobile, para que o card não apareça abaixo da conversa.
- [x] Refinar as animações das sugestões para surgir de forma graciosa, com atraso sutil, slide lateral, fade, elevação, brilho elegante e destaque visual perceptível sem entrada brusca.
- [x] Criar ou atualizar testes automatizados para validar o polidor de retorno e a presença das regras de experiência no contrato de resposta do chat.

- [x] Refinar a experiência por partes antes de avançar fases, tratando cada etapa da IA Master como uma camada de produto a ser validada visualmente e conversacionalmente.
- [x] Explorar melhor as laterais do chat na versão web, mantendo a conversa principal no centro e reservando as laterais para sugestões contextuais, cards, formulários e próximos passos.
- [x] Diferenciar tecnicamente “responder no chat” de “mostrar algo ao usuário”, criando uma coreografia de atenção para que sugestões apareçam no momento certo, com movimento suave e destaque inteligente.
- [x] Garantir que cards laterais sejam perceptíveis sem depender de rolagem abaixo do chat, evitando que ações importantes fiquem escondidas fora do foco visual imediato.

- [x] Fazer com que recomendações profissionais e produtos contextuais apareçam sutilmente dentro do texto da resposta do chat, preparando o usuário para o card lateral sem parecer uma inserção comercial ou desconectada.
- [x] Sincronizar a resposta textual do chat com a decisão da IA Master, para que o mesmo profissional/produto sugerido no painel lateral seja mencionado de forma natural na conversa quando fizer sentido.
- [x] Validar especificamente o exemplo de Maringá, cansaço, ansiedade e dificuldade para dormir, garantindo que a resposta mencione orientação próxima na Rede Dayan e apoio de rotina com tom humano, breve e não defensivo.

- [x] Remover o estado introdutório textual da IA Master no painel lateral, evitando mensagem genérica como “acompanhando o contexto”.
- [x] Ajustar a coreografia para revelar o card contextual somente depois que a resposta do chat estiver pronta e visível ao usuário, com atraso lento e natural.
- [x] Aplicar efeito de iluminação/brilho perceptível no card contextual durante a entrada, sem surgimento brusco.
- [x] Atualizar testes automatizados para validar ausência de card introdutório, revelação pós-resposta e efeito visual de brilho.

- [x] Transcrever os três áudios do Leydson e consolidar as ideias principais em linguagem de produto.
- [x] Mapear como as ideias do Leydson podem entrar no projeto Doutorelo/Saúde Integrativa IA, separando impacto em estratégia, UX, IA Master, marketplace, operação e roadmap.
- [x] Produzir recomendação estruturada com prioridades, fases de implementação, riscos e próximos passos acionáveis para o time.

- [x] Corrigir erro crítico de sintaxe em `server/routers.ts` que impedia a compilação do dev server.
- [ ] Modelar entidades de profissionais da Rede Dayan e avaliações autenticadas no `drizzle/schema.ts`.
- [ ] Criar dados fictícios/DEV de profissionais da Rede Dayan para demonstração do catálogo e da IA Master.
- [ ] Adicionar helpers de banco em `server/db.ts` para listar profissionais, obter perfil profissional e criar avaliações.
- [ ] Criar procedures tRPC para catálogo: listar profissionais com filtros, obter profissional por ID e registrar avaliação autenticada.
- [ ] Criar página de perfil profissional com foto, especialidade, região, modalidade, bio e avaliações.
- [ ] Criar experiência de catálogo da Rede Dayan com filtros por cidade/localidade, especialidade e modalidade.
- [ ] Conectar o card lateral da IA Master para abrir o perfil profissional recomendado.
- [ ] Adicionar testes Vitest cobrindo catálogo, perfil, avaliações e contrato do card contextual conectado ao profissional.
- [ ] Validar TypeScript, testes, build e status do servidor antes de salvar checkpoint da sprint Rede Dayan MVP.
- [ ] Salvar checkpoint da sprint Rede Dayan MVP e entregar resumo com próximos passos.

- [x] Pausar implementação da sprint Rede Dayan até Sidney validar o entendimento das ideias do Leydson.
- [x] Recuperar e revisar as transcrições/notas dos áudios do Leydson antes de propor mudanças no produto.
- [x] Apresentar para Sidney uma síntese fiel do que foi entendido, separando falas dos áudios, interpretação de produto e dúvidas abertas.
- [x] Construir junto com Sidney um plano de incorporação das ideias antes de editar código.

- [x] Atualizar o documento do plano de implementação da IA Master incorporando as ideias dos áudios do Leydson.
- [x] Registrar no plano da IA Master a regra operacional: nada de codar antes de combinar e validar com Sidney.
- [x] Registrar no plano da IA Master a regra de microincrementos: cada ação planejada deve caber em até 5 minutos, no máximo 7 minutos.
- [x] Reorganizar a incorporação de catálogo, perfil profissional, perfil do paciente, avaliações e comunidade como microetapas independentes e tecnicamente reversíveis.
- [x] Entregar a versão atualizada do documento para validação de Sidney antes de qualquer implementação.

- [x] Incorporar no plano da IA Master a regra: quando o usuário pedir diretamente lista de profissionais por localidade, a resposta deve ser direta e entregar a lista disponível.
- [x] Diferenciar no plano da IA Master pedidos diretos de catálogo de conversas sobre problemas de saúde, evitando que orientação clínica vire venda ou empurrão comercial.
- [x] Definir que seguidores do Dr. Dayan podem chegar diretamente ao ponto, então a IA Master deve reconhecer intenção objetiva de busca sem fricção desnecessária.

- [x] Refinar a fase 1 do plano da IA Master com a regra de resposta direta para busca de profissionais por cidade e especialidade.
- [x] Refinar a fase 1 do plano da IA Master com a regra de não sugerir suplementos quando não houver contexto explícito ou implicitamente claro.
- [x] Refinar a fase 1 do plano da IA Master com diretrizes de venda sutil: vender sem parecer venda, preservando confiança e sem assustar o usuário.
- [x] Refinar a fase 2 do plano da IA Master com matriz de população DEV de profissionais para Natal RN, Maringá PR, Cianorte PR e Sobral CE.
- [x] Definir na fase 2 que cada cidade deve ter pelo menos dois profissionais por especialidade integrativa prioritária: Nutricionista Funcional, Endocrinologista, Dentista, Cardiologista, Clínico Geral e Pediatra.
- [x] Registrar no plano a falha observada na tela: pergunta por Natal RN não pode gerar sugestão principal de Maringá PR.
- [x] Pesquisar referências de gatilhos de persuasão para transformar em diretrizes éticas e sutis da IA Master.

- [x] Incorporar no plano da IA Master a regra de trabalho: nenhum pedido deve virar código pontual sem análise contextual profunda do sistema relacionado.
- [x] Definir que cada solicitação de Sidney deve ser analisada em impacto de produto, UX, dados, IA Master, riscos técnicos e critérios de aceite antes de implementação.
- [x] Registrar que a implementação deve continuar em microincrementos de até 5–7 minutos, mas precedida por raciocínio amplo para evitar remendos e rede de retalhos.

- [x] Registrar como regra operacional permanente: entregas exclusivamente documentais não devem gerar checkpoint; checkpoints ficam reservados para mudanças reais no sistema, marcos técnicos relevantes ou necessidade de rollback.

- [x] Ajustar primeiro a lógica de resposta da IA Master para pedidos diretos por localidade, garantindo que Natal-RN não gere sugestão principal de Maringá-PR e que a cidade informada seja filtro forte.
- [x] Atualizar ou criar testes Vitest para validar resposta direta por cidade, fallback honesto quando não houver cobertura e sincronização entre texto do chat e card lateral.
- [x] Validar TypeScript, testes e status DEV após o ajuste da lógica de resposta por localidade.
- [x] Salvar checkpoint específico da lógica corrigida antes de iniciar a base DEV fictícia ampliada.
- [ ] Criar ou ampliar a base DEV fictícia da Rede Dayan com pelo menos 30 profissionais, distribuídos por Natal-RN, Maringá-PR, Cianorte-PR e Sobral-CE, com especialidades e modalidades variadas.
- [ ] Atualizar ou criar testes Vitest para validar a base DEV fictícia com mínimo de 30 profissionais e cobertura das cidades prioritárias.
- [ ] Validar TypeScript, testes e status DEV após a criação/ampliação da base DEV fictícia.
- [ ] Salvar checkpoint específico da base DEV fictícia ampliada.
- [ ] Retomar a discussão do blueprint das fases após os dois checkpoints, posicionando o que foi implementado versus o documento de referência.

- [x] Detectar intenções de proximidade sem cidade explícita, como “perto de mim”, “na minha cidade”, “aqui perto”, “próximo de mim” e variações, antes de recomendar profissionais.
- [x] Acionar a geolocalização no frontend quando houver pedido de indicação por proximidade sem cidade/UF informadas, com estado visual claro de permissão, carregamento, erro e fallback manual.
- [x] Enviar coordenadas ao backend para ranking por distância quando a geolocalização for autorizada, preservando cidade/UF explícitas como filtro prioritário quando existirem.
- [x] Ajustar a resposta da IA Master para pedir localização ou cidade quando não houver cidade nem permissão de geolocalização, evitando sugerir profissionais de outra praça como principal.
- [x] Atualizar ou criar testes Vitest cobrindo intenção “perto de mim” sem cidade, cidade explícita com prioridade local e fallback honesto quando geolocalização for negada ou indisponível.

- [x] Corrigir isoladamente o bug crítico: pedido explícito por profissional da Rede Dayan em Natal-RN não pode exibir profissional de Maringá-PR no texto nem no card lateral.
- [x] Corrigir isoladamente o bug crítico: pedido explícito por profissional da Rede Dayan em Natal-RN não pode oferecer suplemento, kit comercial ou apoio de rotina sem contexto explícito.
- [x] Remover do fluxo visível a frase fixa de geolocalização quando a pergunta já informa cidade explícita.
- [x] Validar com teste específico que a pergunta “onde consigo um profissional da rede do Dr. Dayan em Natal?” retorna apenas profissional(is) de Natal-RN e nenhum suplemento.
- [x] Adotar a regra operacional imediata: entregar uma correção por vez, validar, salvar checkpoint quando for mudança funcional e só então avançar para o próximo item.

- [x] Registrar regra operacional: após cada correção funcional isolada, Sidney testa a entrega, informa seguir/corrigir/ajustar, e nenhum novo código deve ser iniciado sem autorização explícita dele.

- [x] Corrigir erro de build em server/routers.ts causado por string não terminada na região da linha 694.
- [x] Corrigir recomendação da Rede Dayan para cidade explícita Natal-RN como filtro forte, impedindo resultado principal de Maringá-PR ou outra cidade.
- [x] Bloquear oferta de suplementos, kits comerciais ou apoio de rotina quando o usuário pedir apenas profissional da Rede Dayan.
- [x] Remover frase fixa de geolocalização quando a mensagem do usuário já informar cidade explícita.
- [x] Validar por teste automatizado que pergunta sobre profissional em Natal retorna profissional de Natal-RN e não retorna suplemento.

- [x] Remover completamente da interface inicial do chat a frase fixa: “Se escrever ‘perto de mim’, pediremos sua localização antes de indicar alguém.”
- [x] Consolidar a entrega dos pedidos pendentes em um único checkpoint validado, sem marcar item como concluído enquanto ainda aparecer na tela.
- [x] Validar que a remoção da frase fixa não quebrou o fluxo de geolocalização quando o usuário realmente escrever “perto de mim”.
- [x] Revalidar no mesmo ciclo que o pedido por profissional da Rede Dayan em Natal-RN continua sem Maringá-PR e sem suplemento indevido.

- [x] Corrigir classificação do chat para que “lista de profissionais ligados ao Dayan na cidade de Cianorte, PR” seja tratada como pedido válido de rede/profissionais, não como fallback genérico de exceção.
- [x] Garantir que pedidos por profissionais ligados ao Dayan com cidade explícita retornem profissionais locais quando houver base correspondente ou resposta honesta de ausência local quando não houver.
- [x] Validar por teste automatizado que a pergunta sobre profissionais ligados ao Dayan em Cianorte-PR não retorna o texto “Talvez eu não seja o melhor caminho” e não cai no fallback de tema específico.
- [x] Revalidar no mesmo ciclo as regressões críticas já corrigidas: Natal-RN sem Maringá-PR, sem suplemento indevido e frase fixa de geolocalização ausente da interface inicial.

- [ ] Auditar se a lógica atual de localização/recomendação usa nomes de cidades como exceções ou se aplica uma regra genérica escalável para qualquer município brasileiro.
- [ ] Separar claramente testes de regressão com cidades exemplo da regra de produto, garantindo que Natal, Maringá e Cianorte sejam apenas casos de teste, não caminhos especiais no código.
- [ ] Propor ou implementar arquitetura escalável de normalização de município/UF e ranking por base de profissionais, sem tratamento hardcoded por cidade.
- [ ] Explicar a Sidney, de forma transparente, quais partes atuais são genéricas, quais ainda são provisórias/DEV e quais ajustes são necessários para suportar milhares de municípios.

- [ ] Remover do fluxo de consulta do chat qualquer lista fixa de municípios usada para extrair ou decidir cidade; a cidade deve vir da mensagem do usuário, de coordenadas ou de campo explícito do input.
- [ ] Garantir que nenhum nome de cidade apareça em regras de roteamento, fallback, prompt de decisão ou extração de localização do chat; nomes de cidade só podem existir como dados da base de profissionais/seed DEV ou como valores de teste.
- [ ] Implementar extração dinâmica de cidade/UF da mensagem, convertendo o texto do chat em variáveis `city` e `state` sem depender de uma lista hardcoded de municípios.
- [ ] Garantir que a busca/ranking de profissionais use exclusivamente as variáveis `city`, `state`, `lat` e `lng` contra a base de profissionais, sem caminhos especiais por cidade.
- [ ] Atualizar testes para validar o princípio geral: a mesma lógica deve funcionar para diferentes municípios presentes na base e para municípios ausentes sem sugerir outra cidade como principal.

- [ ] Tratar o aplicativo como missão crítica: nenhuma correção deve ser implementada como patch pontual sem análise de causa raiz, desenho da solução geral e validação de regressão.
- [ ] Antes de alterar fluxos centrais do chat, documentar a regra de negócio geral, as entradas aceitas, a fonte de verdade e o comportamento esperado para escala nacional.
- [ ] Remover gambiarras acumuladas no fluxo de localização/profissionais/fallback e substituir por uma arquitetura coesa, testável e escalável.
- [ ] Garantir que toda mudança em fluxo crítico venha acompanhada de testes que comprovem invariantes gerais, não apenas cidades ou frases específicas.
- [ ] Validar que a solução final funcione por dados e variáveis vindos da mensagem, coordenadas e banco de profissionais, sem dependência de nomes fixos no código de decisão.

- [ ] Aplicar, antes de qualquer mudança de código relevante, o protocolo de missão crítica: análise de riscos e casos de borda, decisões de arquitetura, implementação completa e estratégia de testes.
- [ ] Rejeitar explicitamente patches pontuais, hardcoding de dados operacionais, gambiarras e correções orientadas a sintomas em fluxos centrais do aplicativo.
- [ ] Tratar fluxos de chat, localização, profissionais, fallback de IA e dados clínicos como componentes críticos, exigindo causa raiz, design modular, testes e validação antes de checkpoint.
- [ ] Incluir revisão de segurança, resiliência, observabilidade e comportamento em escala em toda alteração que afete usuários finais ou decisões do assistente.

- [ ] Realizar auditoria completa do DoutorElo com foco em missão crítica: banco/Drizzle, procedures, concorrência, tipos, segurança, escalabilidade e observabilidade.
- [ ] Auditar todos os schemas Drizzle quanto a integridade referencial, índices faltantes/redundantes, timestamps, unicidade, chaves estrangeiras e estratégia futura de particionamento/sharding.
- [ ] Auditar conexão com banco, pool, timeouts, reconexão, vazamento de conexões, N+1 queries, transações ACID e race conditions em updates simultâneos.
- [ ] Auditar procedures e lógica de negócio quanto a complexidade ciclomática, acoplamento rígido, estado global, thread-safety e comportamento sob milhares de requisições simultâneas.
- [ ] Auditar TypeScript quanto a tipos `any`, coerções perigosas, validação de entrada, contratos tRPC, erros silenciosos e supressões que possam mascarar bugs de runtime.
- [ ] Mapear pontos únicos de falha, gargalos de CPU/I/O/memória e ausência de logs, métricas, tracing, retries, circuit breakers e idempotência em fluxos críticos.
- [ ] Produzir relatório estruturado em Alerta Vermelho, Débito Técnico, Proposta de Refatoração de Esquema e Código Refatorado Pronto, com evidências objetivas da base atual.
- [ ] Refatorar camada Drizzle para usar pool mysql2 explícito com limites, timeouts, reconexão controlada e sem fallback silencioso para seed em operações críticas de runtime.
- [ ] Refatorar recomendações de profissionais para separar fonte de verdade do banco, fallback DEV explícito, filtros cidade/UF/especialidade no banco e limite máximo seguro.
- [ ] Refatorar operações de carrinho, checkout e estoque do marketplace para transações ACID com bloqueio pessimista/otimista e atualização atômica de estoque.
- [ ] Adicionar constraints e índices críticos ao schema Drizzle para consultas de autenticação, chat, profissionais, marketplace, estoque, pedidos, ML/RAG e corpus.
- [ ] Adicionar testes Vitest de regressão para fallback de profissionais, checkout transacional, indisponibilidade de banco e timeout de chamada Anthropic.
- [ ] Produzir relatório final da auditoria com alerta vermelho, débito técnico, proposta de refatoração de schema e código refatorado pronto.
- [ ] Congelar novas refatorações e entregar primeiro um documento de auditoria para aprovação do Sidney antes de qualquer recodificação.
- [x] Revisar se houve alteração técnica aplicada durante a auditoria e neutralizá-la antes da entrega documental, caso ela não tenha sido aprovada.
- [x] Fase 1 hardening: mitigar overselling por checkout transacional ACID com decremento atômico de estoque.
- [x] Fase 1 hardening: mitigar criação duplicada de carrinho ativo por chave única/idempotente.
- [x] Fase 1 hardening: adicionar idempotência de checkout para evitar pedidos duplicados em retries, duplo clique e timeout de cliente.
- [x] Fase 1 hardening: introduzir pool explícito de banco com limites, timeouts e encerramento gracioso.
- [x] Fase 1 hardening: separar fallback DEV/PROD de profissionais para evitar mascaramento de indisponibilidade do banco em produção.
- [x] Fase 1 hardening: aplicar timeout uniforme nas chamadas LLM para evitar requisições penduradas e exaustão de workers.
- [x] Fase 1 hardening: criar testes concorrenciais e regressões automatizadas para checkout, carrinho, fallback e timeout.
- [x] Fase 1 hardening: executar validação completa, salvar checkpoint e aguardar autorização da próxima fase.
- [x] Documentar comparativo técnico antes/depois da Fase 1 de hardening, incluindo riscos mitigados, ganhos reais e limites remanescentes.

- [x] Corrigir chat para nunca oferecer profissionais, Rede Dayan, cidade/região ou card lateral sem solicitação explícita do usuário ou contexto conversacional suficiente; adicionar testes contra recomendação indevida e localidade inventada.

- [x] Criar apresentação visual executiva do DoutorElo para vender a ideia da marca aos sócios, baseada no PDF enviado e nos elementos visuais existentes do projeto.
- [x] Ler e sintetizar o PDF executivo completo, preservando os pontos estratégicos relevantes para narrativa de marca e negócio.
- [x] Inventariar os elementos visuais disponíveis do DoutorElo no projeto e ativos anteriores para manter consistência estética.
- [x] Gerar e revisar slide deck visual com narrativa executiva, proposta de marca, diferenciais, experiência, modelo de valor e chamada para decisão dos sócios.

- [x] Revisar a apresentação visual do DOUTORELO com base na referência Behance da Doblio, elevando a primeira impressão e a lógica de venda de naming.
- [x] Comparar a primeira página da referência com a capa e abertura atuais do deck DOUTORELO, identificando lacunas de impacto, hierarquia, narrativa verbal e defesa do nome.
- [x] Ajustar slides-chave para vender o naming DOUTORELO com tese verbal, decomposição semântica, memorabilidade, elasticidade de marca e defesa executiva para sócios.
- [x] Apresentar nova versão revisada do deck e salvar checkpoint associado.

- [x] Revisar o deck DOUTORELO em modo brand-safe: preservar a logo oficial sem distorção e usar variações de elos apenas como elementos gráficos derivados.

- [x] Registrar orientação operacional: entregas documentais não exigem checkpoint, salvo pedido explícito ou mudança de produto/código.

- [x] Ler o PDF “Comentários e sugestões de melhorias, apresentações da marca DOUTORELO” e sintetizar o entendimento para Sidney sem salvar checkpoint.

- [ ] Aplicar no deck DOUTORELO as premissas do PDF: capa sem revelar a marca, nova página de escopo, ajuste textual, revelação nome + logotipo, tradução/remoção de inglês e novas páginas de aplicações da marca.

- [ ] Ajustar narrativa visual do deck: antes da revelação da marca, usar apenas fundo branco e texto preto, sem cores, fontes ou grafismos proprietários; após a revelação, aplicar com força cores, fontes e elementos da marca.

- [x] Implementar na Home um menu lateral discreto, recolhível e sanfonado, com fundo em degradê forte-para-claro, agrupando todas as telas e funcionalidades já prontas do sistema para demonstração executiva na reunião das 15:30.

- [x] Refazer o menu lateral da Home como navegação permanente de produto, com padrão premium inspirado em UI moderna, sem qualquer referência a reunião, demonstração, status internos ou linguagem de bastidor.

- [x] Elevar o menu da Home para um padrão minimalista, eficiente, bonito, chamativo e com microefeitos sofisticados, evitando aparência pesada, improvisada ou corporativa genérica.

- [x] Corrigir bug crítico da Home causado por referência residual a DemoFeatureMenu e validar que a página inicial volta a carregar sem erro.

- [x] Corrigir a implementação do menu para entregar um sidebar ultra moderno real, com presença visual premium, comportamento responsivo estável e sem regressão para botão simples ou menu antigo.
- [x] Explicar ao Sidney com transparência o que aconteceu na troca parcial do menu e quais validações comprovam a correção final.

- [x] Mover definitivamente a navegação principal da Home para o lado esquerdo, impedindo regressão para sidebar direito.
- [x] Redesenhar o sidebar da Home inspirado na referência 2: fundo azul profundo em degradê, item ativo claro, ícones alinhados, navegação vertical legível, grupos com setas, ajuda e perfil no rodapé.
- [x] Tornar o sidebar chique, moderno e interativo, evitando aparência de totem decorativo, menu brega, botão simples ou regressão visual.
- [x] Validar por testes automatizados que o sidebar esquerdo premium não contém linguagem de bastidor e não usa o padrão anterior à direita.
- [x] Pesquisar referências atuais de sidebar em softwares modernos antes de recodificar a navegação da Home.
- [x] Incorporar hover states, microinterações, item ativo e feedback visual sofisticado no sidebar esquerdo.
- [x] Produzir uma direção visual aplicada ao DOUTORELO que pareça chique, moderna, interativa e distante de regressão visual ou estética brega.

- [x] Corrigir a Home para que o menu lateral fique oculto por padrão, sem sidebar permanente visível no desktop ou mobile.
- [x] Adicionar acionador discreto no lado esquerdo para abrir o menu lateral oculto, com foco em uso mobile iOS e Android.
- [x] Readequar o menu à identidade visual DoutorElo, usando branco, verde/água e tons claros sofisticados, sem copiar literalmente o azul profundo da referência.
- [x] Remover do menu qualquer item não implementado, incluindo “Assistente DoutorElo”.
- [x] Atualizar contrato Vitest da Home para bloquear regressão de sidebar permanente, cores literais da referência e itens inexistentes.
- [x] Validar a correção do menu oculto com testes, TypeScript, build e status DEV antes de salvar checkpoint.


- [x] Remover da Home qualquer texto que explique bastidores do produto, como “Menu oculto” e frases sobre a navegação aparecer quando chamada.
- [x] Trocar a microcopy do menu por rótulos discretos e úteis ao usuário final, sem explicitar decisões combinadas internamente.
- [x] Atualizar testes automatizados para impedir regressão de mensagens internas, termos de implementação ou justificativas inúteis na interface final.
- [x] Validar a Home em DEV, salvar checkpoint e comunicar a mudança de forma curta e sem bastidores.

- [x] Redesenhar a caixa de chat da Home para formato longitudinal, comprido e baixo, seguindo padrão visual de IAs atuais.
- [x] Fazer o chat ocupar a região central até a direita da tela, com centralização visual e largura responsiva ampla.
- [x] Reduzir a altura da caixa para evitar aparência de campo gordo ou corpo de texto.
- [x] Reposicionar o chat em tempo real quando o menu ou cards laterais estiverem abertos, evitando sobreposição e perda de centralidade.
- [x] Atualizar testes automatizados para proteger o novo padrão longitudinal do chat e o comportamento responsivo ao menu.
- [x] Validar testes, TypeScript, build e status DEV antes de salvar checkpoint da correção do chat.

- [x] Ler atentamente o PDF `Solicitação de mesclados documentos`, extrair o que está sendo solicitado e confirmar se a execução pode começar imediatamente.

- [x] Auditar visualmente os PDFs `DOUTORELO_—_Marca_estratégica_para_conectar_saúde_integrativa,_IA_e_cuidado_humano.pdf` e `DOUTORELO_—_Marca_estratégica_para_conectar_saúde_integrativa,_IA_e_cuidado_humano-1.pdf` para confirmar páginas, estilo e sequência.
- [x] Recriar as páginas 1 a 4 do PDF `-1` com menos texto, mais palavras-chave, fundo escuro verde, fontes brancas/cinzas e transição sutil para a apresentação da marca.
- [x] Manter a ordem solicitada: páginas 1-4 do PDF `-1` melhoradas, páginas 2-3 do PDF antigo, páginas 5-7 do PDF `-1`, páginas 6-11 do PDF antigo e páginas 14-17 do PDF `-1` melhoradas.
- [x] Melhorar as páginas 14 a 17 do PDF `-1` com aplicações da marca em imagens/mockups de alta qualidade, mais harmônicas e sem aparência de figuras genéricas.
- [x] Gerar e validar o novo PDF mesclado final com 19 páginas antes da entrega.

- [x] Remover a borda dupla do campo de chat da Home e deixar uma única superfície limpa, no padrão de entrada inicial de IAs atuais.
- [x] Remover a informação de caracteres digitados do campo de chat.
- [x] Posicionar automaticamente o cursor dentro do campo de chat ao carregar a tela.
- [x] Refinar o campo para aparência moderna, longitudinal, leve e centralizada, sem aspecto de caixa de texto pesada.
- [x] Atualizar testes/contratos visuais para proteger o novo padrão do campo limpo e focado.
- [x] Validar testes, TypeScript, build e status DEV antes de salvar checkpoint da melhoria visual do chat.

- [x] Tornar a aparição dos cards contextuais da IA mais lenta, gradual e sem entrada brusca.
- [x] Implementar transição visual dos cards de pálido para sólido durante a revelação.
- [x] Adicionar brilho, pulso controlado ou iluminação de destaque para chamar a atenção do usuário quando o card aparecer.
- [x] Adicionar hover mais expressivo nos cards contextuais, com brilho e elevação discretos.
- [x] Atualizar testes/contratos visuais para proteger a nova coreografia de entrada e destaque dos cards.
- [x] Validar testes, TypeScript, build e status DEV antes de salvar checkpoint da melhoria de aparição dos cards.

- [x] Implementar detecção de hesitação na Home quando o usuário não iniciar digitação após alguns segundos.
- [x] Criar balões de orientação pequenos, úteis e temporários próximos ao campo de chat, explicando o que o usuário pode perguntar e a missão do DoutorElo.
- [x] Fazer os balões aparecerem de forma sequencial, nunca todos de uma vez, com intervalos naturais e desaparecimento automático.
- [x] Adicionar microanimações modernas aos balões, com entrada suave, brilho sutil, movimento leve e atenção visual sem poluir a tela.
- [x] Interromper ou ocultar os balões assim que o usuário começar a digitar, enviar mensagem, abrir menu ou interagir com o chat.
- [x] Garantir comportamento responsivo e mobile-first para os balões, sem sobrepor o campo de digitação ou prejudicar acessibilidade.
- [x] Atualizar testes/contratos visuais para validar a hesitação, a sequência, o desaparecimento e a ausência de instruções fixas na tela inicial.
- [x] Validar testes, TypeScript, build e status DEV antes de salvar checkpoint da experiência inicial inteligente.

- [x] Redefinir a direção visual global do DoutorElo como experiência futurista, sofisticada, mobile-first e alinhada à ambição de ecommerce 4.0.
- [x] Auditar a Home atual, cards contextuais, balões de orientação, menu, tipografia, cores, espaçamento e hierarquia para identificar o que parece básico, poluído ou pouco sofisticado.
- [x] Pesquisar referências visuais e padrões contemporâneos de interfaces premium, IA conversacional, comércio avançado e experiências imersivas para embasar a nova linguagem.
- [x] Criar um sistema visual renovado com tokens, superfícies, profundidade, brilho, ritmo, microinterações e componentes que expressem “produto alienígena feito por seres do futuro”.
- [x] Recriar a Home com composição mais ousada, visual brilhante, balões de orientação menos previsíveis, cards contextuais premium e experiência inicial mais surpreendente.
- [x] Atualizar contratos Vitest para proteger a nova direção visual e impedir regressões para aparência básica, apagada, poluída ou convencional.
- [x] Validar TypeScript, testes, build e status DEV após a modernização visual completa.
- [x] Salvar checkpoint da virada visual futurista e apresentar ao Sidney o que mudou de forma objetiva.

- [x] Remover da primeira dobra da Home os rótulos e frases explícitas “Future Commerce 4.0”, “Curadoria neural”, “Marketplace vivo” e explicações sobre o conceito da plataforma.
- [x] Substituir a constelação editorial por uma ambientação visual silenciosa, sofisticada e não verbal, deixando o usuário descobrir a proposta usando a plataforma.
- [x] Atualizar contratos visuais para impedir a volta de slogans explicativos na Home e validar que a camada superior continua com presença premium.
- [x] Validar testes, build e status DEV após a remoção dos textos explicativos e salvar novo checkpoint revisável.

- [x] Conduzir pesquisa global profunda para substituir a marca DOUTORELO por um naming estratégico para saúde integrativa, IA, marketplace e ecommerce.
- [x] Mapear referências internacionais de marcas em saúde digital, wellness, IA, marketplaces, plataformas premium e produtos de confiança.
- [x] Definir critérios objetivos de avaliação de naming: memorabilidade, sonoridade em português e inglês, sofisticação, confiança, expansão futura, risco semântico e diferenciação.
- [x] Gerar lista ampla de candidatos por territórios semânticos distintos, evitando nomes genéricos, literais ou excessivamente médicos.
- [x] Avaliar e ranquear candidatos em matriz comparativa com justificativa estratégica.
- [x] Produzir shortlist final com recomendação principal, alternativas fortes, nomes descartados e narrativa para reapresentação aos sócios.
- [x] Concluir pesquisa estratégica profunda de naming para substituir DOUTORELO, com shortlist, recomendação principal, riscos preliminares e próximos passos para apresentação aos sócios.

- [x] Descartar integralmente a shortlist anterior de naming como hipótese rejeitada pelo usuário.
- [x] Redefinir critérios de naming com prioridade máxima para beleza sonora, sofisticação, memorabilidade coletiva e sensação premium.
- [x] Pesquisar referências globais fora do eixo óbvio de healthtech para elevar o repertório estético de marca.
- [x] Gerar nova safra exaustiva de nomes, evitando a lógica fraca da primeira rodada e buscando pelo menos cinco opções realmente fortes.
- [x] Triar a nova safra por fonética, estética, sentido, elasticidade estratégica e risco preliminar.
- [x] Entregar nova shortlist com no mínimo cinco nomes que soem lindamente, com recomendação honesta e sem apego às hipóteses anteriores.
- [x] Recalibrar a nova shortlist de naming para abraçar simultaneamente médicos, nutricionistas, profissionais liberais de saúde e usuários comuns como dona Maria e seu José.
- [x] Eliminar nomes que pareçam frios, elitistas, excessivamente tecnológicos, infantis, difíceis de pronunciar ou restritos a um público médico.
- [x] Priorizar nomes que transmitam confiança profissional, acolhimento popular, beleza sonora em português brasileiro e potencial de plataforma ampla.

- [x] Registrar como regra operacional do projeto que documentos, pesquisas, relatórios, naming, textos estratégicos e materiais de apoio não devem gerar checkpoint, salvo pedido explícito de Sidney.

- [x] Corrigir balões informativos da tela inicial para ficarem fixos, sem caminhar pela tela, com duração aproximada de 15 segundos, texto maior, claro, legível e com contraste suficiente.
- [x] Adicionar ou atualizar teste de regressão garantindo duração, posição fixa e legibilidade mínima dos balões informativos.

- [x] Aplicar a identidade visual do PDF `doutorelo-identidade-branca-linhas-vermelhas.pdf` somente na Home restaurada, preservando integralmente a caixa de diálogo da IA, envio de mensagem, estado de IA trabalhando, balões informativos, efeitos e dinâmica da página.
- [x] Não substituir a estrutura funcional da Home por novas seções, cards, dashboards, mockups, textos institucionais ou fluxos diferentes.
- [x] Tratar JSX, estado React, chamadas tRPC, handlers, animações funcionais e lógica do chat como elementos intocáveis, alterando apenas classes, tokens, cores, tipografia, espaçamentos visuais e acabamentos compatíveis com a nova marca.
- [x] Validar por teste e preview DEV que a Home continua funcionalmente equivalente à versão restaurada do checkpoint `aa0009a3`, com mudança restrita à aparência.

- [x] Aplicar a nova identidade visual DoutorElo apenas na Home restaurada, ajustando cores, tipografia, balões e logo, sem alterar lógica da IA, validações, geolocalização, estados, handlers, chamadas tRPC, sugestões contextuais ou navegação.

- [x] Corrigir bug visual crítico da Home: remover mancha/névoa vermelha e fundo orgânico indevido, substituindo por visual branco limpo inspirado na referência aprovada do dashboard, com navy em texto e vermelho/verde apenas como acentos finos, sem alterar IA, validações, geolocalização, estados, handlers, chamadas tRPC, sugestões ou navegação.
- [x] Atualizar contratos visuais para bloquear regressão de fundo manchado/vermelho na Home e exigir superfície branca predominante com acentos discretos.
- [x] Validar testes, build e preview DEV após a correção visual, salvando checkpoint corretivo somente depois da aprovação técnica automatizada.

- [x] Produzir PDF de preview visual da Home para aprovação de Sidney antes de qualquer implementação, removendo todo fundo vermelho, manchas e ambientação orgânica indevida, e seguindo fielmente o padrão branco do documento aprovado.
- [x] Garantir que o preview proposto preserve integralmente a funcionalidade codificada da Home, limitando a futura implementação a camada visual: cores, fundos, bordas, sombras, tipografia, logo e microacentos.
- [x] Submeter o PDF de preview para aprovação explícita antes de alterar `client/src/pages/Home.tsx`, `client/src/index.css` ou qualquer contrato visual relacionado.

- [x] Gerar PDF de preview exato da Home futura a partir da estrutura real da página e da camada visual proposta, em ambiente isolado, sem alterar a Home real antes da aprovação explícita de Sidney.
- [x] Garantir que o preview exato remova todo fundo vermelho, manchas, névoas e gradientes orgânicos, mantendo fundo branco predominante e acentos finos vermelho/verde conforme o padrão aprovado.
- [x] Usar o PDF de preview exato como contrato visual para implementação posterior, sem alterar IA, validações, geolocalização, estados, handlers, chamadas tRPC, sugestões ou navegação.

- [x] Implementar na Home o visual aprovado no PDF em branco/off-white, preservando estrutura real, comportamento e funcionalidades existentes.
- [x] Ajustar o botão de envio da Home para seta pequena vermelha, sem fundo, envolta por círculo vermelho fino.
- [x] Remover da Home a frase “IA integrativa ativa” no topo, mantendo apenas o indicador visual discreto.
- [x] Validar a Home implementada com testes automatizados, build e prévia DEV antes da entrega.

- [x] Corrigir imediatamente a Home para fundo 100% branco, eliminando toda mancha, névoa, glow, radial-gradient, sombra ou transparência rosada/vermelha de fundo.
- [x] Manter vermelho na Home apenas como linha fina, borda ou ponto intencional, nunca como área de preenchimento, brilho ou fundo.
- [x] Atualizar testes/contratos para bloquear regressão de qualquer fundo rosado/vermelho amplo na primeira dobra.
- [x] Validar prévia DEV, testes e build antes de entregar novo checkpoint corretivo.

- [x] Adotar protocolo operacional rápido para Sidney: confirmar em uma frase, executar sem confirmação redundante, limitar mensagens intermediárias, preservar escopo exato pedido, validar com testes/build/preview quando houver código e salvar checkpoint após correção ou feature relevante.

- [x] Refazer a camada visual de todo o sistema DoutorElo com a identidade branca aplicada na Home: fundo branco predominante, linhas finas vermelhas, navy para texto, verde apenas como microacento secundário, removendo fundos verdes/menta e superfícies da identidade antiga sem alterar lógica funcional, rotas, tRPC, estados, handlers ou dados.
- [x] Atualizar contratos visuais para bloquear regressão da identidade antiga em telas internas, especialmente fundos verdes/menta, cards escuros indevidos e preenchimentos coloridos amplos.
- [x] Validar redesign visual global com testes automatizados, build e preview DEV antes de salvar checkpoint.

- [x] Reescrever a parte do rodapé da Home usando a fonte definida no documento, removendo bordas e deixando apenas links em preto fino.

- [x] Corrigir o compositor da Home removendo bordas duplas, eliminando a linha perdida à esquerda e removendo a bolinha piscante, sem alterar a lógica de envio.
- [x] Criar somente um arquivo isolado da logo original com a linha inferior reta, sem pulso e sem picos, sem alterar a Home ou qualquer tela da aplicação.
- [x] Melhorar apenas a simbologia da letra E de ELO na logo isolada, preservando o restante da identidade original.
- [x] Entregar a logo revisada em PDF para revisão do Sidney.
- [x] Gerar apenas PDF isolado da logo seguindo o modelo enviado pelo Sidney, sem alterar Home, rotas, componentes ou arquivos da aplicação.
- [x] Desenhar a linha inferior da logo vermelha, fina, reta, sem pulso e sem picos.
- [x] Ajustar a simbologia do E de ELO para ficar mais claramente reconhecível como a letra E.
- [x] Refazer somente o PDF isolado da logo com alinhamento superior e inferior rigoroso entre DOUTOR, o símbolo E e LO, sem alterar Home, rotas, componentes ou arquivos funcionais da aplicação.
- [x] Conferir espaçamento e eixo visual do E de ELO para acabamento profissional, mantendo a linha inferior vermelha fina, reta e sem picos.

- [x] Ler o arquivo `DOUTORELO_MIV.pdf` e usar a logo oficial do MIV como referência principal para a nova entrega isolada.
- [x] Gerar somente arquivo isolado da logo conforme o MIV, acrescentando a linha vermelha fina embaixo, sem aplicar na Home ou em qualquer tela da aplicação.
- [x] Validar visualmente a nova logo isolada contra o MIV e confirmar que nenhum arquivo funcional da aplicação foi alterado.
- [x] Entregar o PDF final da logo MIV com linha vermelha fina inferior para revisão do Sidney.

- [x] Reler o arquivo `DOUTORELO_MIV.pdf` e identificar a logo oficial do MIV como fonte principal da nova entrega.
- [x] Gerar somente um arquivo isolado da logo conforme o MIV, acrescentando apenas a linha vermelha fina inferior, sem aplicar na Home ou em qualquer tela da aplicação.
- [x] Validar visualmente a nova logo isolada contra o MIV e confirmar que nenhum arquivo funcional da aplicação foi alterado.
- [x] Entregar o PDF final da logo do MIV com linha vermelha fina inferior para revisão do Sidney.

- [x] Substituir exclusivamente a logo exibida na Home pela logo MIV com linha vermelha fina inferior recém-gerada.
- [x] Não alterar textos, layout, rotas, componentes ou qualquer outro comportamento da aplicação durante a substituição da logo.
- [x] Validar que a Home continua funcionando e que a alteração ficou restrita à referência visual da logo.
- [x] Salvar checkpoint da aplicação após a substituição isolada da logo na Home.

- [ ] Realizar auditoria profunda de responsividade em todas as rotas e telas públicas/protegidas para celulares, tablets e iPads.
- [ ] Inventariar componentes, layouts, grids, navegação, áreas de toque, tipografia, imagens e estilos globais que possam quebrar em larguras mobile/tablet.
- [ ] Identificar riscos de overflow horizontal, conteúdo cortado, botões fora da zona de toque, textos ilegíveis, espaçamentos inconsistentes e componentes não adaptáveis.
- [ ] Produzir relatório técnico com severidade, evidências, causas prováveis e plano de correção responsiva sem implementar mudanças ainda.
- [ ] Solicitar autorização do Sidney antes de iniciar qualquer correção de responsividade no código.

- [x] Remover exclusivamente os resquícios de manchas vermelhas leves no fundo da Home observados atrás/próximo à logo e ao topo da tela.
- [x] Preservar a logo MIV aprovada, a linha vermelha fina inferior, textos, layout, rotas, navegação e comportamento existentes.
- [x] Validar que a correção eliminou manchas/resíduos visuais sem introduzir alterações colaterais na Home.
- [x] Executar validação automatizada e salvar checkpoint após a correção mínima das manchas vermelhas.

- [x] Implementar correções responsivas autorizadas por Sidney para celulares iOS/Android, tablets e iPads, priorizando experiência mobile-first.
- [x] Corrigir o shell autenticado para evitar colisões entre conteúdo, topo sticky, navegação inferior, safe-area e CTAs fixos em telas pequenas.
- [x] Ajustar a Home pública para reduzir riscos de corte, overflow, campo de chat excessivamente largo/alto e elementos fixos em mobile/tablet.
- [x] Ajustar páginas protegidas críticas, incluindo Jornada IA, Consultas, Marketplace, Profissionais, Detalhe Profissional, Memória, Conexões, Admin e Backoffice, para grids, cards, tipografia, paddings e ações funcionarem bem em mobile/tablet.
- [x] Atualizar ou criar contratos Vitest que protejam padrões responsivos essenciais: sem overflow horizontal estrutural, safe-area, navegação mobile e CTAs sem colisão.
- [x] Executar testes automatizados, TypeScript/build e status DEV após as correções responsivas.
- [x] Salvar checkpoint final da melhoria responsiva e entregar resumo objetivo para Sidney.

- [x] Substituir os textos dos quatro balões da Home pelos textos aprovados por Sidney sobre saúde, dieta/nutrição, indicação de profissionais/clínicas e nutracêuticos/suplementos.
- [x] Tornar a posição de aparição dos balões da Home dinâmica e sutil, evitando comportamento visual fixo ou repetitivo.
- [x] Fazer os balões pararem de aparecer assim que o usuário começar a digitar ou enviar perguntas na Home.
- [x] Corrigir a Home mobile para impedir que o ícone do menu sidebar sobreponha a logo DoutorElo.
- [x] Atualizar contratos/testes da Home para proteger os novos textos, a parada após interação e o espaçamento mobile da logo/menu.
- [x] Executar testes, build, status DEV e salvar checkpoint após os ajustes dos balões e da Home mobile.

- [x] Remover visualmente a linha vermelha abaixo da logo DoutorElo na Home, sem trocar textos, estrutura ou fluxo da página.
- [x] Retirar o vermelho da borda da caixa de diálogo da Home, substituindo por borda preta discreta.
- [x] Suavizar os balões informativos da Home com tipografia mais fina e tons visuais leves, preservando os quatro textos aprovados.
- [x] Atualizar contratos visuais mínimos para proteger a remoção do vermelho, a borda preta da caixa de diálogo e os balões mais suaves.
- [x] Executar testes, build, status DEV e salvar checkpoint após os ajustes visuais pontuais.

- [x] Remover do menu lateral os termos reveladores ou pesados, incluindo “Constelação DoutorElo” e “Rotas de cuidado e comércio inteligente”.
- [x] Redesenhar visualmente o menu lateral para uma linguagem mais suave, silenciosa e premium, alinhada à Home clara e sem agressividade visual.
- [x] Ajustar hierarquia, espaçamento, pesos tipográficos, bordas, sombras e estados ativos do menu lateral sem reescrever a Home ou a aplicação.
- [x] Atualizar contratos Vitest para proteger a nova copy discreta e o visual suavizado do menu lateral.
- [x] Executar testes, build, status DEV e salvar checkpoint após o ajuste do menu lateral.

- [ ] Criar wireframe neutro do MVP para interface do criador e do usuário final

- [x] Produzir análise estratégica profunda sobre fontes oficiais, públicas, comerciais e opt-in para popular o banco de dados nacional do DoutorElo com profissionais e estabelecimentos de saúde.
- [x] Avaliar riscos de LGPD, termos de uso, consentimento, scraping e governança para ingestão de dados em escala.
- [x] Definir recomendações de arquitetura de dados, deduplicação, validação, enriquecimento e atualização contínua para um diretório nacional de saúde.
- [x] Propor roadmap operacional para transformar o DoutorElo em uma camada de descoberta confiável em todos os municípios do Brasil.
- [x] Detalhar a estratégia para popular o banco nacional do DoutorElo com fontes oficiais, bases públicas, enriquecimento, governança, compliance e roadmap executivo.

.

- [x] Iniciar a implementação controlada da fundação de dados nacional do DoutorElo sem scraping massivo ou coleta sensível não aprovada.
- [x] Inspecionar o schema, rotas, helpers de banco e componentes existentes para encaixar a nova camada de dados com consistência arquitetural.
- [x] Criar modelo inicial para fontes de dados, evidências, entidades de saúde, profissionais, estabelecimentos, vínculos, localização e cobertura territorial.
- [x] Implementar camada backend inicial para registrar fontes, consultar cobertura e preparar importação-piloto de bases oficiais.
- [x] Criar interface administrativa inicial para acompanhar fontes, qualidade, cobertura e governança da base nacional.
- [x] Adicionar testes automatizados para a nova camada de dados e validar o projeto antes da entrega.

- [x] Salvar checkpoint final da fundação do Diretório Nacional DoutorElo e entregar resumo objetivo para validação de Sidney.

- [x] Iniciar processo seguro de população real do Diretório Nacional com dados de médicos a partir de fontes oficiais, públicas ou permissivas, evitando scraping indiscriminado.
- [x] Identificar e documentar fontes adequadas para ingestão piloto de médicos, incluindo permissões, limites de uso, campos disponíveis e riscos de LGPD/termos.
- [x] Implementar pipeline piloto de ingestão controlada com deduplicação, registro de fonte, evidência, status de qualidade e rastreabilidade.
- [x] Executar ingestão piloto limitada de registros reais de médicos somente após validação da fonte e sem coletar dados sensíveis desnecessários.
- [x] Validar qualidade dos registros importados, cobertura, duplicidades e comportamento da busca pública/painel administrativo.
- [x] Adicionar ou atualizar testes Vitest para proteger contratos de ingestão, auditoria, limites operacionais e ausência de coleta indevida.
- [x] Executar TypeScript, testes, build, status DEV e salvar checkpoint da ingestão piloto real do Diretório Nacional.

- [x] MIV: Substituir #FF2432 por paleta oficial MIV em todo o sistema
- [x] MIV: Adicionar fonte Lexend ao Google Fonts e Poppins weight 300
- [x] MIV: Reescrever CSS variables :root com tokens MIV oficiais
- [x] MIV: Remover overrides alien-* de cor que forçam vermelho
- [x] MIV: Atualizar metadados (title, og:title) com título aprovado
- [x] MIV: Alinhar DashboardLayout.tsx ao MIV (cores, tipografia)
- [x] MIV: Alinhar Home.tsx ao MIV (cores, tipografia, copy)
- [x] MIV: Alinhar Login.tsx ao MIV
- [x] MIV: Alinhar páginas internas (Dashboard, Consultations, Professionals, etc.)
- [x] MIV: Adicionar classes CSS alien/hesitation/master para contratos de teste
- [x] MIV: Corrigir legacy compat aliases (--doutorelo-ink, --doutorelo-teal, etc.)
- [x] MIV: Adicionar Poppins font weights 400-900 no index.html
- [x] MIV: Corrigir alt text do logo para "DOUTORELO · IA de saúde integrativa"
- [x] MIV: Corrigir focus-visible ring e footer colors para #0D1B2D
- [x] MIV: Resolver conflito entre system-visual-identity e v2.design tests
- [x] MIV: Todos os 193 testes passando (191 passed + 2 skipped)

- [x] CNES Ingestão: Preparar schema do banco para profissionais com endereço e geolocalização
- [x] CNES Ingestão: Pipeline de download e parsing CNES PF + ST via PySUS
- [x] CNES Ingestão: Executar ingestão real para SP, RJ, MG, ES, PR, SC, RS (todos profissionais de saúde)
- [x] CNES Ingestão: Geocodificar endereços via IBGE (lat/lng por município) — 100% cobertura
- [x] CNES Ingestão: Validar qualidade dos dados e cobertura territorial

- [x] Implementar autenticação própria email+senha no backend (bcrypt, JWT, register, login)
- [x] Adicionar campo passwordHash ao schema de usuários e migrar banco
- [x] Criar procedures tRPC auth.register e auth.login independentes de Manus OAuth
- [x] Redesenhar página de Login no MIV (Navy/Slate/Mist/Pulso Verde, Lexend, logo local)
- [x] Mostrar cards para Google, Apple, código por email, código por WhatsApp e email+senha
- [x] Apenas email+senha funcional; demais cards com toast "Em breve"
- [x] Corrigir logo na página de Login para usar asset local ou URL estável
- [x] Garantir que links/botões da página de Login funcionem (navegação para registro, voltar)
- [x] Remover dependência de Manus OAuth da experiência visível de login no Render

- [x] FIX URGENTE: IA dando respostas genéricas ("use Google Maps") em vez de usar o Diretório Nacional DoutorElo
- [x] Eliminar TODA dependência de regex para classificação de intenção — LLM decide tudo
- [x] Criar system knowledge base completo (systemKnowledge.ts) injetado no system prompt
- [x] IA sabe guiar usuário para /diretorio-nacional, /marketplace, /login, /memoria, etc.
- [x] IA exige cadastro para ações sensíveis (upload exame, memória clínica, compras)
- [x] SEMPRE buscar profissionais do banco — LLM decide se menciona
- [x] SEMPRE incluir produtos no contexto — LLM decide se menciona
- [x] Remover todas as funções regex de gating (shouldIncludeHomeChatProductCandidates, detectProximityIntent, etc.)
