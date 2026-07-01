# Plano Mestre de Implementação do DOUTORELO

**Autor:** SIDNEY (PMO SENIUM)  
**Data:** 02 de maio de 2026  
**Produto:** **DOUTORELO**  
**Objetivo:** transformar a visão estratégica do DOUTORELO em um sistema funcional, persistente, seguro e emocionalmente memorável.

## Direção executiva

O DOUTORELO não deve ser implementado como “mais um chatbot de saúde”. A implementação deve partir de uma tese mais forte: **o DOUTORELO é uma casa inteligente da saúde integrativa da pessoa**, onde dúvidas, sintomas, hábitos, exames, consultas, profissionais, recomendações educativas e histórico passam a viver no mesmo lugar. A IA deve ser percebida como inteligência ambiente: ela organiza, resume, prepara e orienta com prudência, mas não deve roubar o protagonismo da experiência.

A prioridade técnica mais importante não é criar mais telas. É construir a **memória longitudinal** do usuário. Sem memória, o produto responde; com memória, o produto acompanha. Essa distinção muda tudo: percepção de valor, retenção, confiança, possibilidade de agenda médica, análise de exames, indicadores e recorrência.

> **Princípio central de implementação:** cada nova funcionalidade deve transformar ansiedade difusa em clareza acionável. Se uma tela, resposta ou fluxo não reduz confusão, não aumenta confiança ou não melhora a preparação do usuário para cuidar de si, ela não deve entrar agora.

## Sequência recomendada

A implementação deve seguir uma ordem rigorosa. Primeiro, construímos a fundação de dados e a experiência de conversa estruturada. Depois, criamos histórico, painel autenticado e continuidade. Só então avançamos para médicos reais, exames, indicadores, avaliações e marketplace transacional. Essa ordem protege a promessa da marca e evita lançar superfícies bonitas sem substância operacional.

| Fase | Nome | Objetivo | Entrega percebida pelo usuário | Prioridade |
|---|---|---|---|---:|
| 0 | Alinhamento de promessa | Ajustar produto, linguagem e arquitetura de informação | “Entendi claramente o que o DOUTORELO faz” | Imediata |
| 1 | Memória clínica mínima | Criar a espinha dorsal persistente do usuário | “Minha saúde agora tem um lugar” | Imediata |
| 2 | Conversa estruturada | Transformar triagem em mapa visual de clareza | “Minha dúvida virou um plano organizado” | Imediata |
| 3 | Área do usuário | Criar painel, linha do tempo e biblioteca pessoal | “Consigo voltar, acompanhar e evoluir” | Alta |
| 4 | Rede profissional | Criar médicos persistentes, perfis e agenda inicial | “Posso encontrar alguém confiável” | Alta |
| 5 | Exames e documentos | Upload, armazenamento e leitura educativa segura | “Entendo meus exames sem pânico” | Alta |
| 6 | Indicadores e evolução | Registrar sinais e mostrar progresso longitudinal | “Vejo padrões e mudanças ao longo do tempo” | Média |
| 7 | Confiança social e comercial | Avaliações, produtos, pedidos e regras de separação clínica | “Existe um ecossistema confiável em volta” | Posterior |

## Fase 0 — alinhamento de promessa, navegação e linguagem

Esta fase prepara o sistema para não prometer mais do que entrega. A landing já tem uma direção visual e editorial forte, mas a navegação pública deve começar a refletir a arquitetura real do produto: **Conversa**, **Memória**, **Rede**, **Exames**, **Indicadores** e **Conta**. O objetivo é fazer o visitante entender que o DOUTORELO conecta partes dispersas da saúde, não apenas responde perguntas.

| Entregável | Descrição | Critério de aceite |
|---|---|---|
| Arquitetura pública revisada | Ajustar seções e CTAs para refletirem módulos reais | Nenhuma promessa pública deve depender de feature inexistente sem sinalização adequada |
| Vocabulário oficial | Fixar DOUTORELO como nome único e padronizar microcopy | Não deve aparecer alternância confusa com DOCTORELO, Doutor·Elo ou Saúde Integrativa IA como produto principal |
| Régua de promessa | Separar “já disponível”, “em construção” e “visão” | Landing deve vender ambição sem parecer que tudo já está operacional |

## Fase 1 — memória clínica mínima e schema longitudinal

Esta é a primeira implementação crítica. O DOUTORELO precisa passar a lembrar do usuário de forma estruturada, consentida e útil. A memória mínima deve guardar perfil de saúde, eventos, conversas, resumos, documentos, exames, consultas, indicadores e consentimentos. A partir disso, a IA poderá deixar de responder de forma isolada e começar a organizar contexto.

| Modelo de dados | Função | Observações de segurança |
|---|---|---|
| Perfil de saúde | Dados básicos, objetivos, restrições, preferências e contexto integrativo | Deve ser editável e controlado pelo usuário |
| Eventos de saúde | Sintomas, dúvidas, notas, hábitos e marcos relevantes | Deve sustentar linha do tempo |
| Conversas e resumos | Histórico de triagens, respostas e mapas de clareza | Deve evitar armazenar respostas sem rastrear consentimento |
| Documentos e exames | Metadados e referência segura ao arquivo em storage | Não armazenar bytes no banco; usar storage |
| Consultas | Profissional, data, status, notas e preparação | Base para agenda e histórico |
| Indicadores | Peso, pressão, glicose, sono, energia e medidas futuras | Guardar data UTC e unidade |
| Consentimentos | Registro de aceites, finalidade e versão do texto | Necessário para confiança e governança |

O primeiro checkpoint técnico dessa fase deve ser um banco capaz de sustentar a promessa “tudo em um lugar”, mesmo que as telas ainda estejam simples. Depois disso, cada módulo novo passa a salvar algo real no histórico do usuário.

## Fase 2 — conversa estruturada e mapa de clareza

A triagem atual deve evoluir para um fluxo de alto valor percebido. Em vez de entregar uma resposta longa e textual, o DOUTORELO deve gerar um **Mapa de Clareza** com cards. Esse formato cria recompensa emocional imediata, porque o usuário vê o caos virar estrutura.

| Card | Papel na experiência | Exemplo de benefício |
|---|---|---|
| Resumo do que você contou | Espelha a situação com linguagem humana | O usuário sente que foi compreendido |
| O que merece atenção | Separa sinais importantes de ruído | Reduz ansiedade e aumenta prudência |
| Perguntas para levar ao profissional | Prepara consulta melhor | Aumenta sensação de controle |
| Próximo passo possível | Sugere ação segura e não prescritiva | Dá direção sem invadir conduta médica |
| Salvar no meu histórico | Fecha o ciclo da experiência | Transforma conversa em memória |

Essa fase deve preservar limites clínicos. O DOUTORELO não deve prescrever, diagnosticar ou prometer tratamento. A IA deve funcionar como organizadora educativa, preparadora de consulta e redutora de confusão.

## Fase 3 — área autenticada do usuário

Depois que a memória existir, precisamos dar ao usuário uma casa para ela. A área autenticada deve ter um painel inicial com sensação de calma, clareza e continuidade. O usuário deve conseguir voltar e perceber que o DOUTORELO sabe o que já foi contado, quais exames foram salvos, quais dúvidas foram organizadas e quais próximos passos ficaram pendentes.

| Tela | Entregável | Recompensa emocional |
|---|---|---|
| Painel de clareza | Visão geral de histórico, próximos passos e últimos registros | “Eu sei onde estou” |
| Linha do tempo | Eventos, conversas, exames, consultas e notas em ordem | “Minha história faz sentido” |
| Biblioteca pessoal | Documentos, exames e resumos salvos | “Nada importante se perdeu” |
| Preparação para consulta | Perguntas, resumo exportável e pontos de atenção | “Vou conversar melhor com o médico” |
| Configurações de privacidade | Controle do que é salvo e compartilhado | “Eu mando nos meus dados” |

Visualmente, essa área deve ser menos “dashboard corporativo” e mais **sala de cuidado digital**: espaçada, tátil, calma, com hierarquia clara e microinterações elegantes. A sensação buscada não é produtividade; é posse tranquila sobre a própria saúde.

## Fase 4 — rede de profissionais e agenda inicial

A rede profissional deve começar simples, mas real. O catálogo estático deve dar lugar a profissionais persistidos no banco, com especialidades, credenciais, localização, teleatendimento, disponibilidade e status de verificação. Antes de permitir avaliações ou marketplace avançado, o essencial é permitir descoberta confiável e pedido de agendamento.

| Camada | Implementação inicial | Critério de confiança |
|---|---|---|
| Perfil profissional | Nome, CRM/registro, especialidade, bio, abordagem e atendimento | Dados verificáveis e revisão administrativa |
| Busca | Filtros por especialidade, formato, cidade e disponibilidade | Resultado claro, sem prometer disponibilidade falsa |
| Agenda | Slots, solicitação de consulta e status | Fluxo simples de solicitação antes de transação completa |
| Preparação | Enviar resumo do usuário ao profissional com consentimento | Compartilhamento sempre explícito |

Essa fase deve ser tratada como infraestrutura de confiança, não como catálogo promocional. O usuário precisa sentir que o DOUTORELO não está empurrando qualquer profissional; está ajudando a encontrar alguém adequado com critérios claros.

## Fase 5 — exames, documentos e interpretação educativa

A análise de exames é uma das promessas mais fortes e mais sensíveis. Ela deve ser implementada com armazenamento seguro, extração de texto quando possível, resumo educativo, destaque de pontos para conversar com profissional e histórico de evolução. A linguagem deve evitar diagnóstico automático e interpretações absolutas.

| Passo | Experiência | Regra de segurança |
|---|---|---|
| Upload | Usuário envia PDF ou imagem de exame | Arquivo vai para storage, não para banco |
| Organização | DOUTORELO classifica tipo, data e contexto | Usuário confirma ou corrige metadados |
| Leitura educativa | IA explica termos e pontos de atenção | Não substituir laudo nem médico |
| Perguntas para consulta | Sistema gera perguntas úteis | Sempre orientar validação profissional |
| Histórico | Exame entra na linha do tempo | Comparações só quando houver base suficiente |

Essa fase pode gerar grande sensação de alívio. O design deve evitar alarmismo: cores, alertas e textos precisam transmitir seriedade serena, não urgência exagerada.

## Fase 6 — indicadores, evolução e continuidade

Com histórico, conversa, médicos e exames em andamento, o DOUTORELO pode começar a acompanhar indicadores. Aqui entram registros de peso, pressão, glicose, sono, energia, dor, humor, ciclo, hábitos e outros sinais relevantes. O objetivo não é criar obsessão por números, mas mostrar padrões com clareza.

| Indicador | Primeira versão recomendada | Valor percebido |
|---|---|---|
| Sono | Registro manual simples de qualidade e duração | Relacionar rotina com energia |
| Energia | Escala subjetiva diária ou semanal | Identificar padrões integrativos |
| Pressão/glicose/peso | Campos manuais com unidade e data | Criar histórico consultável |
| Sintomas recorrentes | Frequência, intensidade e contexto | Preparar conversas melhores |

A recompensa correta aqui é **continuidade**, não competição. O produto deve celebrar ciclos fechados: “você registrou informação suficiente para perceber um padrão”, e não “você bateu uma meta arbitrária”.

## Fase 7 — avaliações, marketplace e monetização

Avaliações e marketplace só devem entrar depois que a confiança principal estiver sólida. Produtos, suplementos e recomendações comerciais exigem separação rígida entre orientação educativa, conduta profissional e venda. O DOUTORELO pode ter marketplace, mas ele não deve parecer uma máquina de empurrar suplemento.

| Módulo | Quando implementar | Condição obrigatória |
|---|---|---|
| Avaliações de profissionais | Após consultas reais ou solicitações verificáveis | Moderação e autenticidade |
| Marketplace | Após regras claras de separação comercial | Avisos de não prescrição e transparência |
| Pagamentos | Quando fluxo de consulta/produto estiver definido | Termos, cancelamento e suporte operacional |
| Recomendações comerciais | Somente com cautela e rotulagem explícita | Nunca confundir publicidade com orientação clínica |

## Primeira frente prática de implementação

Minha recomendação é começarmos pela combinação **Fase 1 + Fase 2**, porque ela transforma imediatamente o DOUTORELO de vitrine em produto. Em termos práticos, isso significa construir o schema longitudinal mínimo, salvar conversas e gerar o primeiro Mapa de Clareza do usuário.

| Ordem | Tarefa inicial | Por que vem primeiro |
|---|---|---|
| 1 | Criar tabelas de perfil de saúde, eventos, conversas, resumos e consentimentos | Sem banco longitudinal, não existe continuidade |
| 2 | Criar procedures protegidas para salvar e listar histórico do usuário | A área autenticada precisa consumir dados reais |
| 3 | Transformar resposta da IA em estrutura de cards | A experiência deixa de parecer chatbot comum |
| 4 | Adicionar botão “salvar no meu histórico” | Fecha o ciclo emocional e técnico |
| 5 | Criar painel autenticado mínimo com linha do tempo | Mostra valor recorrente desde o começo |
| 6 | Testar schema, procedures, guardrails e renderização | Evita regressão em saúde, segurança e UX |

Essa frente é o menor salto com maior impacto. Ela não tenta implementar médicos, exames e marketplace de uma vez. Ela cria o coração do DOUTORELO: conversa que vira memória.

## Critérios de qualidade para cada entrega

Toda entrega do DOUTORELO deve passar por quatro filtros. O primeiro é **utilidade clínica segura**: o sistema ajuda sem prescrever indevidamente. O segundo é **memória**: se algo importante aconteceu, deve poder entrar no histórico. O terceiro é **clareza emocional**: o usuário deve sair menos confuso do que entrou. O quarto é **beleza funcional**: a UI deve parecer premium porque organiza melhor, não apenas porque tem efeitos visuais.

| Filtro | Pergunta de validação | Sinal de falha |
|---|---|---|
| Segurança | Isso pode ser entendido como diagnóstico ou prescrição? | Resposta imperativa, suplemento específico ou promessa terapêutica |
| Memória | Essa interação gera algo salvável e útil depois? | Fluxo termina e desaparece |
| Clareza | O usuário entende o próximo passo sem ler muito? | Texto longo, jargão ou card sem ação |
| Experiência | A interface acalma e orienta? | Ansiedade visual, excesso de CTAs ou dashboard frio |

## Riscos principais

O maior risco é tentar implementar tudo ao mesmo tempo. Isso criaria uma superfície ampla, mas rasa. O segundo risco é permitir que a IA vire protagonista demais, deslocando o DOUTORELO para a categoria de chatbot médico. O terceiro risco é antecipar promessas de médicos, exames ou recomendações antes de haver governança suficiente. O quarto risco é deixar marketplace e monetização contaminarem a percepção clínica.

| Risco | Impacto | Mitigação |
|---|---|---|
| Escopo amplo demais | Produto fica incompleto e difícil de testar | Começar por memória + conversa estruturada |
| Overclaim clínico | Perda de confiança e risco regulatório | Linguagem educativa, limites claros e encaminhamento humano |
| IA genérica | Experiência vira commodity | Estruturar outputs em mapas, histórico e próximos passos |
| Catálogo médico falso | Quebra de confiança | Diferenciar demonstração de profissionais verificados reais |
| Marketplace precoce | Aparência de venda disfarçada de cuidado | Separar comercial de orientação clínica desde o design |

## Decisões que preciso de você antes da implementação

Antes de iniciar código pesado, precisamos decidir três coisas. A primeira é o escopo do primeiro MVP funcional: recomendo **Memória + Conversa estruturada + Painel mínimo**. A segunda é o nível de dados de saúde que vamos permitir no primeiro ciclo: recomendo começar com perfil, sintomas, hábitos, notas e conversas, deixando exames para a fase seguinte. A terceira é o tom da experiência autenticada: recomendo uma estética de **sala de cuidado digital**, não dashboard médico tradicional.

| Decisão | Recomendação | Alternativa |
|---|---|---|
| Primeiro MVP funcional | Memória + Mapa de Clareza + Painel mínimo | Tentar incluir médicos e exames agora, com maior risco |
| Dados iniciais | Perfil, sintomas, hábitos, notas e conversas | Incluir exames desde o início, aumentando complexidade |
| Estética da área logada | Sala de cuidado digital premium | Dashboard clínico tradicional |
| IA | Organizar, resumir e preparar consulta | Responder livremente como chatbot amplo |
| Monetização | Adiar marketplace transacional | Acelerar produtos, com risco de percepção comercial |

## Recomendação final

Eu iniciaria a implementação do DOUTORELO pela seguinte tese operacional: **conversa que vira memória**. Essa frase deve guiar a primeira grande rodada de desenvolvimento. O usuário chega com ansiedade, conta algo, recebe um mapa claro, salva no histórico e passa a ter uma linha do tempo. A partir daí, médicos, exames, indicadores e marketplace deixam de ser módulos soltos e passam a orbitar uma experiência central.

Se você aprovar, a próxima rodada de implementação deve começar com a criação do schema longitudinal, procedures protegidas, testes automatizados e redesenho da triagem em cards salvos no histórico. Esse é o primeiro passo real para o DOUTORELO deixar de ser promessa e começar a se comportar como o ecossistema de cuidado descrito no documento.
