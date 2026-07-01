# Plano de Implementação da IA Mestre do Doutorelo

**Data:** 05 de maio de 2026  
**Projeto:** Doutorelo — IA de saúde integrativa  
**Autor estratégico:** SIDNEY — PMO SENIUM.AI  
**Status:** Documento estratégico de referência, atualizado com as diretrizes dos áudios do Leydson e com a regra operacional de validação com Sidney antes de qualquer implementação funcional

## 1. Visão central

A **IA Mestre** do Doutorelo deve ser implementada como uma camada de orquestração progressiva, não como mais um chatbot competindo com a resposta principal. Sua função é observar a conversa, compreender intenção, consultar memória, identificar oportunidades de cuidado, acionar ferramentas e sugerir ações de interface no momento certo. Ela deve preservar a naturalidade do chat que já voltou a funcionar bem, evitando reintroduzir fallbacks, pós-processamentos rígidos ou intervenções artificiais sobre respostas válidas.

> A IA Mestre deve nascer como uma camada lateral e silenciosa. Primeiro ela observa; depois sugere discretamente; depois aciona componentes; depois conecta usuários a profissionais associados, marketplace, checkout, upload e leitura assistiva de exames.

A metáfora operacional é a de uma **regente de orquestra**. O Claude, GPT ou outro modelo fundacional forte atua como músico virtuoso, com capacidade de linguagem, raciocínio e interpretação. A IA Mestre conduz o conjunto: decide quando usar modelo textual, quando consultar banco de dados, quando acionar geolocalização, quando exibir um card, quando sugerir um profissional associado, quando abrir um formulário, quando chamar marketplace e quando permanecer em silêncio.

## 2. Princípios de implementação

O plano deve seguir uma maturidade progressiva. A primeira obrigação é **não quebrar o fluxo limpo atual**: mensagens dentro de escopo passam pelo filtro pré-Claude e seguem ao modelo principal sem enriquecimento oculto, sem fallback clínico e sem pós-processamento. Toda nova capacidade da IA Mestre deve ser testada como camada separada e só pode interferir na experiência quando houver contrato explícito, confiança suficiente e aprovação de produto.

| Princípio | Decisão prática |
|---|---|
| Preservar o chat limpo | Nenhuma camada nova deve reescrever a resposta principal sem aprovação explícita. |
| Começar em modo observador | A IA Mestre inicialmente produz decisões internas, mas não aparece para o usuário. |
| Intervir pouco e bem | A ação padrão deve ser `none`; sugestões aparecem apenas quando há contexto claro. |
| Ser mobile-first | Cards, links, botões, mapas e formulários devem funcionar bem em iOS e Android. |
| Priorizar a rede humana | Recomendar profissionais associados deve ser tratado como eixo primordial, não como módulo secundário. |
| Separar saúde de comércio | Sugestões comerciais devem ser transparentes, não prescritivas e não diagnósticas. |
| Escalar complexidade por fases | Texto vem antes de card; card vem antes de agendamento; agendamento vem antes de fluxos clínicos mais sensíveis. |
| Auditar decisões | Toda intervenção deve poder ser analisada por intenção, confiança, resultado, segurança e conversão. |

## 3. Necessidade primordial — Rede Dayan por geolocalização

A recomendação de **médicos, nutricionistas e clínicas associados à rede do Dr. Dayan Siebra** deve ser tratada como uma necessidade primordial do app. O Doutorelo não deve ser apenas um chat de orientação: ele precisa se tornar uma ponte inteligente entre a necessidade real do usuário e a rede humana de profissionais liberais da saúde cadastrados na base do aplicativo.

A lógica central é simples e poderosa: quando o usuário conversa sobre uma necessidade de saúde, a IA Mestre identifica a demanda, classifica a especialidade provável, solicita ou usa a geolocalização com consentimento e mapeia quais profissionais associados estão próximos, ativos, disponíveis e aderentes ao caso. A recomendação não deve parecer uma propaganda genérica; deve surgir como continuidade natural da conversa, conectando o usuário a uma pessoa ou clínica capaz de acolher aquela necessidade.

| Elemento primordial | Decisão estratégica |
|---|---|
| Rede associada | Somente profissionais e clínicas vinculados à rede do Dr. Dayan devem ser recomendados. |
| Geolocalização | A localização do usuário deve ser usada com consentimento explícito e finalidade clara. |
| Especialidade | A recomendação deve cruzar necessidade detectada, especialidade, abordagem e perfil do profissional. |
| Proximidade | O sistema deve priorizar profissionais próximos, mas permitir teleatendimento quando aplicável. |
| Confiança | A IA Mestre deve explicar de forma simples por que aquele profissional apareceu. |
| Segurança | A recomendação deve ser convite ao acompanhamento, não diagnóstico nem garantia de resultado. |
| Mobile-first | A experiência deve ser curta: permitir ver profissional, rota, contato ou solicitação de consulta em poucos toques. |

## 4. Fluxo conceitual da recomendação geolocalizada

A recomendação geolocalizada deve ser desenhada como uma decisão da IA Mestre, não como uma busca manual isolada. O usuário pode pedir explicitamente um profissional, mas o sistema também deve detectar oportunidades contextuais. Por exemplo, se a conversa indicar necessidade nutricional, metabólica, hormonal, sono, dor, ansiedade, emagrecimento, performance, exames alterados ou acompanhamento de rotina, a IA Mestre pode sugerir discretamente que existem profissionais associados próximos ou disponíveis online.

| Etapa | O que acontece | Saída esperada |
|---|---|---|
| Detecção de necessidade | A IA Mestre analisa a mensagem e identifica tema, urgência, intenção e especialidade provável. | `professional_interest` ou `professional_recommendation_opportunity`. |
| Consentimento de localização | O app solicita permissão para usar localização aproximada ou permite informar cidade/bairro manualmente. | Latitude/longitude aproximada ou localização textual normalizada. |
| Consulta à base | O sistema consulta médicos, nutricionistas e clínicas ativos na rede associada. | Lista elegível por especialidade, status e cobertura. |
| Ranqueamento | A IA Mestre cruza proximidade, especialidade, disponibilidade, modalidade e adequação ao caso. | Ranking transparente de profissionais recomendados. |
| Exibição mobile | O app mostra card compacto com nome, especialidade, cidade, distância, modalidade e CTA. | “Ver perfil”, “Solicitar consulta”, “Como chegar” ou “Atendimento online”. |
| Registro auditável | O sistema registra por que a recomendação foi feita e se houve clique, contato ou agendamento. | Métricas de utilidade, conversão e qualidade da recomendação. |

Essa camada deve respeitar uma diferença importante: a IA pode sugerir **quem pode ajudar**, mas não deve afirmar que determinado profissional é obrigatório, que resolverá o problema ou que substitui avaliação individual. A linguagem deve permanecer cordial, humana e segura: “posso te mostrar opções próximas”, “talvez faça sentido conversar com”, “há profissionais associados nessa área”, “se quiser, vejo quem atende perto de você”.

## 5. Modelo de dados recomendado para profissionais, clínicas e localização

O schema atual já possui dados de consultas e especialidade em `careAppointments`, mas a recomendação geolocalizada exige uma base dedicada e pesquisável para profissionais e clínicas. O ideal é estruturar esse cadastro em tabelas próprias, com campos suficientes para busca por especialidade, geografia, modalidade de atendimento, vínculo com a rede associada e status operacional.

| Entidade | Campos recomendados | Finalidade |
|---|---|---|
| `professionals` | `id`, `name`, `slug`, `professionType`, `specialties`, `licenseNumber`, `bio`, `approach`, `networkStatus`, `active` | Representar médicos, nutricionistas e outros profissionais associados. |
| `clinics` | `id`, `name`, `slug`, `description`, `networkStatus`, `active` | Representar clínicas ou espaços de atendimento ligados à rede. |
| `professionalLocations` | `professionalId`, `clinicId`, `address`, `city`, `state`, `postalCode`, `latitude`, `longitude`, `serviceRadiusKm` | Permitir busca por proximidade, cidade e raio de atendimento. |
| `professionalServices` | `professionalId`, `serviceName`, `specialty`, `modality`, `durationMinutes`, `acceptsOnline`, `active` | Mapear serviços disponíveis por especialidade e modalidade. |
| `professionalAvailability` | `professionalId`, `locationId`, `weekday`, `startTime`, `endTime`, `capacity`, `active` | Sustentar disponibilidade futura e solicitação de consulta. |
| `professionalRecommendations` | `userId`, `professionalId`, `needType`, `distanceKm`, `score`, `reason`, `createdAt` | Auditar recomendações, cliques e melhoria contínua. |

A recomendação geolocalizada deve evitar depender apenas de texto livre. Especialidades, modalidades e status precisam ter vocabulário controlado para ranqueamento consistente. A descrição humana continua importante para confiança, mas a decisão operacional deve se apoiar em campos estruturados.

## 6. Contrato inicial da IA Mestre para recomendações profissionais

O contrato da IA Mestre deve incluir intenções e ações específicas para a rede de profissionais. Isso permite que a recomendação geolocalizada entre gradualmente, primeiro como observação, depois como sugestão textual, depois como card e finalmente como solicitação real de consulta.

```ts
type MasterAIIntent =
  | "health_question"
  | "exam_upload_interest"
  | "supplement_interest"
  | "professional_interest"
  | "professional_recommendation_opportunity"
  | "clinic_interest"
  | "signup_interest"
  | "marketplace_interest"
  | "general_chat"
  | "out_of_scope";

type MasterAIInterventionType =
  | "none"
  | "text_suggestion"
  | "footer_link"
  | "button"
  | "professional_card"
  | "clinic_card"
  | "map_preview"
  | "form"
  | "upload"
  | "product_offer";

type MasterAIProfessionalMatch = {
  specialtyNeed: string;
  locationMode: "device_geolocation" | "manual_city" | "unknown";
  latitude?: number;
  longitude?: number;
  city?: string;
  maxDistanceKm?: number;
  acceptsTelehealth?: boolean;
  urgencyLevel: "routine" | "soon" | "urgent_redirect";
};
```

Na versão silenciosa, a IA Mestre deve apenas registrar que teria recomendado um profissional. Na versão visível, ela pode sugerir: “Se quiser, posso ver profissionais associados próximos de você para esse tipo de acompanhamento.” Na versão com cards, ela pode exibir duas ou três opções, sempre com explicação objetiva do motivo da seleção.

## 7. Roadmap por maturidade

A implementação deve ser dividida em fases pequenas, com validação e testes a cada etapa. O objetivo é transformar gradualmente o chat em uma porta de entrada viva para jornada, cadastro, upload, profissionais, marketplace, carrinho e checkout, sem perder confiança. A rede geolocalizada entra cedo no roadmap por ser um dos pilares centrais de valor do produto.

| Fase | Nome | O que entra | O que fica proibido nesta fase | Resultado esperado |
|---|---|---|---|---|
| 0 | Base protegida | Congelar contrato atual do chat limpo e filtro pré-Claude | Reintroduzir fallback, persona pesada ou pós-processamento | Segurança para evoluir sem quebrar o que funcionou. |
| 1 | IA Mestre textual silenciosa | Classificador de intenção, escopo, oportunidade e confiança, incluindo oportunidades de profissional | Mostrar produto, card, formulário ou alterar resposta | Logs internos dizendo “o que eu sugeriria”. |
| 2 | Sugestões textuais discretas | Links ou frases pequenas no rodapé do chat, incluindo “ver profissionais associados” | Checkout, upload real, venda agressiva ou encaminhamento forçado | Primeiro contato visível da IA Mestre com o usuário. |
| 3 | Geolocalização consentida e base de rede associada | Permissão de localização, cidade manual, cadastro estruturado de médicos, nutricionistas e clínicas | Ranqueamento opaco ou recomendação fora da rede associada | Fundamento real para recomendar profissionais por proximidade e especialidade. |
| 4 | Ações de interface simples | Botões como “Enviar exame”, “Criar cadastro”, “Ver profissionais” e “Usar minha localização” | Diagnóstico, prescrição ou análise de arquivo | Chat começa a conduzir jornada. |
| 5 | Cards contextuais | Cards de profissional, clínica, consulta, suplemento ou cadastro | Compra automática ou recomendação clínica forte | Conversa vira navegação inteligente. |
| 6 | Marketplace contextual | Produto elegível, estoque, preço, carrinho e oferta segura | Prometer tratamento ou cura | Venda direta dentro da conversa, com linguagem responsável. |
| 7 | Checkout simplificado | Carrinho, resumo, confirmação e checkout | Pagamento complexo antes de validação UX | Fluxo comercial moderno e curto. |
| 8 | Upload seguro | Consentimento, armazenamento, metadados e status do arquivo | Interpretação clínica profunda ainda | Usuário envia PDF, PNG ou JPG com segurança. |
| 9 | Leitura de exames | OCR/PDF parser, extração de biomarcadores, resumo assistido | Diagnóstico fechado ou prescrição | Exames viram dados estruturados e conversa útil. |
| 10 | Imagens clínicas sensíveis | Classificação visual cautelosa e triagem de risco | Diagnóstico por imagem ou conduta medicamentosa | Ferimentos/imagens entram apenas com governança forte. |
| 11 | Aprendizado operacional | Métricas, feedback, eventos, melhoria de prompts e decisões | Aprendizado cego sem auditoria | IA Mestre melhora com uso real. |

## 8. Fase 0 — Base protegida

A Fase 0 existe para preservar a conquista recente: o chat voltou a funcionar de forma limpa. Antes de adicionar qualquer inteligência orquestradora, precisamos manter testes de regressão que garantam que mensagens válidas continuam indo ao modelo principal sem enriquecimento indesejado e que mensagens claramente fora do escopo continuam sendo bloqueadas antes da chamada externa.

| Critério | Exigência |
|---|---|
| Mensagem válida | Deve seguir ao modelo principal sem prompt estrutural novo. |
| Mensagem fora de escopo | Deve ser bloqueada antes da chamada externa. |
| Pós-processamento | Deve permanecer ausente salvo aprovação explícita. |
| Fallback | Não deve reaparecer como mecanismo de resposta padrão. |
| Testes | Devem falhar se uma camada nova interferir indevidamente no fluxo limpo. |

## 9. Fase 1 — Comportamento da IA Mestre: responder, observar e sugerir sem vender

A Fase 1 deve consolidar a IA Mestre como uma camada de inteligência contextual que entende a intenção do usuário antes de sugerir qualquer ação. O objetivo não é fazer o chat vender mais; é fazer o chat **entender melhor, responder com menos fricção e só abrir caminhos laterais quando houver encaixe real**. Essa fase precisa corrigir três riscos já observados: responder com cidade errada, sugerir suplementos sem contexto e transformar uma busca objetiva por profissionais em conversa clínica desnecessária.

A regra central passa a ser: **pergunta direta recebe resposta direta; conversa de saúde recebe cuidado primeiro; comércio só aparece por intenção clara ou contexto validado**. Essa regra deve ser tratada como contrato de produto, critério de teste e limite de implementação. A IA Mestre pode observar sinais de oportunidade, mas não deve confundir oportunidade com permissão para empurrar produto, suplemento, consulta ou cadastro.

| Modo de intenção | Sinal típico do usuário | Resposta correta | Ação proibida |
|---|---|---|---|
| Pedido direto de catálogo | “Me mostre profissionais em Natal”, “Tem nutricionista em Sobral?”, “Lista de médicos online da rede.” | Entregar lista objetiva, respeitando cidade, especialidade e modalidade solicitadas. | Fazer triagem clínica antes da lista, sugerir cidade diferente ou vender produto antes de responder. |
| Conversa sobre saúde | “Estou cansado”, “Durmo mal”, “Meu exame veio alterado”, “Tenho ansiedade.” | Acolher, explicar de forma útil, organizar próximos passos e só sugerir profissional se houver contexto suficiente. | Transformar sintoma genérico em oferta automática de suplemento, consulta ou produto. |
| Contexto implícito de indicação | O usuário relata um problema e informa cidade, pede ajuda prática ou demonstra desejo de acompanhamento humano. | Convidar de forma discreta: “se fizer sentido, posso te mostrar profissionais próximos”. | Mostrar card invasivo sem explicar o motivo ou sem respeitar a localidade informada. |
| Interesse explícito em produto | “Vocês têm suplemento para comprar?”, “Quero ver produtos”, “Tem algo para rotina de sono?” | Mostrar categoria ou produto apenas como apoio opcional, com transparência comercial e sem promessa terapêutica. | Prescrever, prometer cura, diagnosticar ou induzir compra por medo. |
| Fora de escopo | Política, finanças puras, tecnologia genérica, entretenimento sem ponte de saúde. | Redirecionar com cordialidade para saúde integrativa, rotina, corpo, mente ou bem-estar. | Chamar profissionais, produtos ou comunidade para um assunto que não tem ponte com saúde. |

### 9.1. Regra de intenção direta: pedido direto não vira triagem

Quando o usuário pede uma lista, cidade, especialidade, modalidade ou perfil profissional, a IA Mestre deve agir como **busca conversacional objetiva**. Isso é especialmente importante porque parte do público chegará como seguidor do Dr. Dayan e já saberá o que procura. Criar fricção nesse momento reduz confiança e passa a sensação de que o sistema não escutou o pedido.

| Entrada do usuário | Conduta esperada | Exemplo de resposta adequada |
|---|---|---|
| “Me mostre profissionais em Natal.” | Usar Natal-RN como filtro principal e listar profissionais disponíveis naquela cidade. | “Claro. Em Natal-RN, posso te mostrar estas opções da Rede Dayan por especialidade...” |
| “Tem nutricionista funcional em Sobral?” | Filtrar por cidade e especialidade; se não houver, dizer a verdade e oferecer alternativa transparente. | “Encontrei opções de nutrição funcional em Sobral-CE. Se quiser, também posso filtrar por atendimento online.” |
| “Quero médico online da rede.” | Priorizar modalidade online; pedir cidade apenas se ela melhorar a recomendação. | “Posso te mostrar profissionais com teleatendimento. Se você me disser sua cidade, também ordeno por proximidade.” |
| “Quem atende ansiedade em Natal?” | Interpretar como possível necessidade de profissional, mas sem prometer resultado clínico. | “Posso te mostrar profissionais em Natal-RN que atuam com cuidado integrativo e saúde mental/rotina, sem prometer diagnóstico.” |

A correção mais importante dessa regra é a localidade. Se o usuário disse Natal, a IA não pode substituir por Maringá. Se a base não tiver profissionais suficientes em Natal, a resposta correta é assumir a lacuna: “não encontrei opções suficientes em Natal-RN na base atual; posso te mostrar atendimento online ou cidades próximas, se você quiser”. A cidade sugerida como alternativa precisa ser apresentada como alternativa, nunca como se fosse a cidade pedida.

> Regra rígida de localidade: **cidade informada pelo usuário é filtro forte, não preferência fraca**. A IA Mestre só pode ampliar para teleatendimento, região próxima ou outra cidade quando declarar explicitamente que não encontrou resultado suficiente na cidade pedida e pedir autorização para expandir.

### 9.2. Regra de não-venda: suplemento e produto só com contexto explícito ou validado

A Fase 1 deve proteger a confiança do usuário contra recomendações comerciais prematuras. Em saúde, vender cedo demais pode parecer oportunismo, assustar o cliente e enfraquecer a autoridade do ecossistema. Por isso, a IA Mestre não deve sugerir suplementos, produtos ou marketplace apenas porque detectou palavras como sono, cansaço, ansiedade, emagrecimento, energia, intestino, dor ou exame.

| Situação | O que a IA pode fazer | O que a IA não pode fazer |
|---|---|---|
| Usuário relata cansaço sem pedir produto | Acolher, organizar hipóteses de rotina, sugerir observar sono, alimentação, exames e acompanhamento profissional quando adequado. | Sugerir suplemento, dose, marca, carrinho ou produto como resposta inicial. |
| Usuário pergunta “qual suplemento tomar?” | Explicar que não deve prescrever; pedir contexto e orientar conversa com profissional. | Indicar dose, produto específico ou promessa de efeito. |
| Usuário pede “produtos disponíveis” | Mostrar marketplace/categorias quando aprovado, com aviso de que são opções comerciais de apoio à rotina. | Usar linguagem de tratamento, cura, diagnóstico ou substituição de avaliação. |
| Usuário está vulnerável, ansioso ou assustado | Priorizar segurança, clareza e encaminhamento humano. | Usar gatilho emocional para converter consulta, produto ou assinatura. |

Essa regra não impede venda contextual. Ela apenas define que a venda legítima deve nascer de **utilidade percebida**, não de pressão. Quando houver dúvida, a IA Mestre deve ficar silenciosa comercialmente. Quando houver encaixe real, a linguagem deve ser opcional: “se fizer sentido para você”, “posso te mostrar”, “há uma opção no app que pode apoiar sua organização”, e nunca “você precisa”, “é essencial comprar” ou “isso resolve”.

### 9.3. Persuasão ética: “vender sem vender” como confiança, não manipulação

A pesquisa de Cialdini apresenta sete princípios de influência — reciprocidade, escassez, autoridade, consistência, simpatia, prova social e unidade — como atalhos comportamentais que podem aumentar a chance de uma pessoa aceitar uma proposta quando usados de forma ética.[1] Para o Doutorelo, esses princípios não devem virar gatilhos agressivos de conversão. Eles devem virar uma camada de **comunicação confiável, sutil e auditável**.

| Princípio | Uso ético na IA Mestre | Limite obrigatório |
|---|---|---|
| Reciprocidade | Entregar valor antes de pedir algo: resumir, organizar, explicar e reduzir fricção. | Não usar “ajudei você, então compre/agende” como pressão. |
| Autoridade | Mostrar credenciais verificáveis de profissionais, vínculo com a rede e limites da orientação. | Não transformar autoridade em promessa clínica ou diagnóstico. |
| Consistência | Propor microcompromissos voluntários: confirmar cidade, escolher modalidade, salvar objetivo. | Não empurrar sequência de passos que o usuário não pediu. |
| Simpatia | Usar tom humano, próximo, cordial e semelhante à comunicação acolhedora do Dr. Dayan. | Não simular intimidade falsa nem manipular fragilidade emocional. |
| Prova social | Exibir avaliações, relatos ou indicadores apenas quando forem reais, consentidos e auditáveis. | Não inventar números, depoimentos ou popularidade. |
| Unidade | Construir senso de pertencimento à comunidade Dayan quando essa fase for aprovada. | Não criar culto, exclusão ou pressão de grupo. |
| Escassez | Usar somente escassez operacional verdadeira, como poucos horários disponíveis. | Nunca criar urgência artificial em saúde, produto ou consulta. |

O Modelo de Comportamento de Fogg reforça que uma ação ocorre quando motivação, habilidade e prompt convergem no mesmo momento.[2] Na prática, isso significa que a IA Mestre deve propor **microações fáceis**, não grandes saltos. Se o usuário pediu uma lista em Natal, a motivação e a habilidade já estão claras; o prompt correto é listar. Se o usuário apenas relata sono ruim, a microação correta pode ser organizar sintomas ou perguntar cidade, não vender suplemento.

| Estado do usuário | Microação aceitável | Por que respeita o usuário |
|---|---|---|
| Alta intenção e pedido direto | Mostrar lista, perfil ou filtro imediatamente. | Remove fricção e honra a intenção explícita. |
| Interesse moderado e contexto de saúde | Perguntar uma informação mínima ou oferecer próximo passo opcional. | Mantém controle com o usuário. |
| Baixa clareza ou vulnerabilidade | Responder com acolhimento e permanecer sem oferta. | Evita exploração de fragilidade. |
| Desejo explícito de comprar | Mostrar opção comercial com transparência e limites. | Atende demanda real sem mascarar venda como prescrição. |

Tecnologias persuasivas em saúde exigem cuidado adicional porque usuários vulneráveis podem sofrer perda de autonomia, privacidade ou agravamento de comportamentos quando o desenho incentiva ações inadequadas.[3] Portanto, a IA Mestre deve ter uma trava ética: **a conversão nunca vale mais do que autonomia, consentimento, segurança e confiança**.

### 9.4. Contrato decisório mínimo da Fase 1

Antes de qualquer implementação, Sidney deve validar que a IA Mestre seguirá um contrato decisório simples e testável. Esse contrato deve classificar a mensagem em pelo menos quatro dimensões: intenção, localidade, contexto clínico/comercial e ação permitida.

| Dimensão | Pergunta interna da IA Mestre | Saída esperada |
|---|---|---|
| Intenção | O usuário pediu catálogo, orientação, produto, comunidade ou conversa geral? | `catalog_direct`, `health_guidance`, `product_explicit`, `implicit_referral`, `answer_only`. |
| Localidade | Há cidade, estado, bairro, modalidade online ou consentimento de localização? | Usar localidade explícita como filtro forte; pedir dado mínimo se faltar. |
| Contexto | Existe contexto suficiente para sugerir profissional, formulário, upload ou produto? | Sugerir apenas o menor próximo passo útil; caso contrário, responder e observar. |
| Segurança | Há risco, vulnerabilidade, pedido de prescrição, urgência ou dado sensível? | Priorizar limite clínico, encaminhamento humano ou silêncio comercial. |
| UX | A sugestão deve aparecer no texto, em quick reply, card lateral, formulário ou não aparecer? | Escolher o componente menos invasivo possível. |

A implementação futura dessa fase deve começar em modo auditável. Primeiro, a IA Mestre classifica e registra a decisão sem alterar a resposta principal. Depois, se Sidney aprovar, passa a exibir sugestões discretas. Só depois deve abrir cards, formulários, perfis ou marketplace. Essa sequência evita remendo pontual e permite medir se a decisão melhora a experiência.

## 10. Fase 2 — Base de Profissionais da Rede Dayan: localidade forte, especialidades mínimas e dados confiáveis

A Fase 2 deve transformar a Rede Dayan em uma base mínima confiável para testes de recomendação geolocalizada. O objetivo não é criar uma rede real completa de imediato, mas criar uma base DEV suficientemente estruturada para validar comportamento da IA Mestre, UX de catálogo, filtros por cidade, especialidade, modalidade e futuras avaliações.

A base precisa nascer com uma regra operacional: **em ambiente DEV, usar dados fictícios ou dados públicos previamente verificados e autorizados; em produção, usar apenas profissionais validados, com consentimento, credenciais checadas e política de publicação**. Não é recomendável usar nomes reais, fotos reais ou contatos reais sem autorização explícita, porque isso criaria risco reputacional e jurídico antes de a governança estar definida.

### 10.1. Perfil mínimo do profissional

Cada profissional da Rede Dayan deve possuir um perfil mínimo, suficiente para o usuário decidir se quer ver mais detalhes, mas sem prometer resultado clínico. Esse perfil deve ser compatível com os áudios do Leydson, que destacaram foto, nome, especialidade, região, online/presencial e avaliações como elementos essenciais de confiança.

| Campo | Obrigatório em DEV | Observação de produto |
|---|---:|---|
| Foto/avatar | Sim, podendo ser placeholder fictício. | Em produção, foto real só com autorização. |
| Nome | Sim, fictício em DEV. | Evitar nomes reais sem consentimento. |
| Especialidade | Sim. | Deve usar taxonomia padronizada. |
| Tipo profissional | Sim. | Médico, nutricionista, dentista, clínica, pediatra etc. |
| Cidade e UF | Sim. | Deve ser usado como filtro forte. |
| Bairro/endereço aproximado | Desejável. | Endereço completo só quando autorizado. |
| Modalidade | Sim. | Presencial, online ou híbrido. |
| Vínculo Rede Dayan | Sim. | Publicado, em validação, parceiro, fictício DEV. |
| Avaliações | Planejado. | Entrar apenas com identidade, moderação e consentimento. |
| Contato/CTA | Sim em DEV como fluxo simulado. | Produção exige canal operacional real. |

### 10.2. Matriz mínima de cobertura para testes

A matriz de cobertura mínima deve contemplar as cidades prioritárias definidas por Sidney e Leydson: **Natal-RN, Maringá-PR, Cianorte-PR e Sobral-CE**. Para validar a lógica sem viés de cidade errada, cada cidade precisa ter pelo menos dois profissionais por especialidade integrativa prioritária. Isso gera uma base mínima de 48 registros fictícios em DEV.

| Cidade prioritária | Nutricionista Funcional | Endocrinologista | Dentista | Cardiologista | Clínico Geral | Pediatra | Total mínimo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Natal-RN | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Maringá-PR | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Cianorte-PR | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Sobral-CE | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| **Total DEV mínimo** | **8** | **8** | **8** | **8** | **8** | **8** | **48** |

Essa matriz não deve ser interpretada como rede real pronta. Ela é um instrumento de teste para garantir que a IA Master consiga responder corretamente a pedidos diretos, filtrar por cidade e não “puxar” profissionais de outra localidade por ausência de dados. Depois da validação de Sidney, a população DEV pode ser feita com nomes fictícios e avatares genéricos, enquanto a base real segue fluxo separado de curadoria.

### 10.3. Correção da lógica de localidade

A falha “usuário em Natal recebeu sugestão de Maringá” deve ser tratada como bug de produto e de contrato, não apenas como bug de código. A causa provável pode estar em uma destas camadas: extração de cidade, consulta ao banco, ranking, fallback de seed, ordenação por score, texto do polidor ou card lateral. Antes de codar, a análise técnica deve mapear todas essas camadas para evitar remendo pontual.

| Camada | Pergunta de diagnóstico antes de implementar | Critério de aceite |
|---|---|---|
| Interpretação da mensagem | A cidade foi extraída corretamente do texto do usuário? | “Natal” vira Natal-RN, não cidade vazia nem Maringá. |
| Consulta de dados | A query filtra por cidade/UF antes de ordenar? | Resultado primário contém apenas profissionais elegíveis na cidade pedida. |
| Ranking | O score favorece cidade exata acima de especialidade genérica? | Profissional de outra cidade nunca vence cidade exata quando há opção local. |
| Fallback | O sistema sabe responder quando não há profissional local? | Informa lacuna e pede permissão para expandir. |
| Polimento textual | O texto final preserva a mesma cidade do resultado estruturado? | O assistente não troca cidade ao reescrever a resposta. |
| UI/card lateral | O card exibido corresponde à lista/texto? | Texto e card apontam para a mesma localidade. |

A regra de ranking deve seguir esta ordem: primeiro cidade e UF exatas; depois especialidade solicitada; depois modalidade solicitada; depois disponibilidade; depois avaliações; depois proximidade regional; por último teleatendimento e alternativas. Cidades próximas só entram quando a cidade exata não tiver cobertura suficiente e a IA explicar a expansão.

### 10.4. Plano de população DEV

O plano de população DEV deve ser pequeno, auditável e reversível. Ele deve começar com a matriz de 48 profissionais fictícios, sem avaliações públicas reais. Cada registro precisa ser rastreável como `dev_fictional`, para impedir confusão com rede real. A primeira validação não precisa de fotos reais, agenda real nem contato real; precisa apenas demonstrar que a IA Master respeita localidade, especialidade e modalidade.

| Microincremento | Resultado esperado | Validação com Sidney |
|---|---|---|
| Mapear modelo atual de profissionais | Confirmar quais campos já existem no schema, seed e procedures. | Sidney valida se o modelo atende ao perfil mínimo. |
| Definir taxonomia de especialidades | Padronizar as seis especialidades prioritárias e sinônimos. | Sidney valida nomes exibidos ao usuário. |
| Criar matriz fictícia DEV | Preparar 48 registros mínimos, sem uso de dados reais sensíveis. | Sidney aprova cidades, especialidades e formato. |
| Testar busca direta por cidade | Consultas por Natal, Maringá, Cianorte e Sobral retornam apenas a cidade certa. | Sidney valida exemplos de resposta. |
| Testar fallback honesto | Cidade sem cobertura informa lacuna e pede autorização para expandir. | Sidney valida linguagem. |
| Planejar avaliações | Definir identidade do paciente, moderação, privacidade e anti-fraude. | Não implementar até aprovação específica. |

### 10.5. Relação com avaliações, perfil de paciente e comunidade

As avaliações e o perfil de paciente são importantes, mas não devem entrar antes de o catálogo mínimo funcionar. A sequência segura é: primeiro lista correta por cidade; depois perfil mínimo do profissional; depois CTA de interesse; depois avaliações autenticadas; depois perfil de paciente; por fim comunidade com presença curada do Dr. Dayan. Antecipar comunidade antes de corrigir localidade e catálogo criaria uma experiência social em cima de dados frágeis.

Essa fase também deve obedecer à regra de microincrementos: cada passo deve caber em até 5 minutos, com máximo excepcional de 7 minutos, e só deve ser executado depois de Sidney validar o microescopo. Nenhuma alteração técnica deve ser feita apenas para “consertar Natal”; o conserto precisa respeitar interpretação, dados, ranking, fallback, texto, UI e testes.

## 11. Fase 3 — Geolocalização consentida e base da rede associada

A geolocalização precisa entrar como fase própria, porque ela sustenta a promessa primordial de recomendar profissionais associados. Antes de exibir cards, o app precisa resolver três fundamentos: consentimento de localização, base estruturada de profissionais/clínicas e algoritmo inicial de correspondência por especialidade e proximidade.

O sistema deve permitir dois caminhos: geolocalização do dispositivo e localização manual. A opção manual é importante para usuários que não autorizam GPS, estão em desktop, querem buscar em outra cidade ou estão ajudando um familiar. O uso da localização deve ser explicado com clareza, sem fricção excessiva.

| Requisito | Critério de aceite |
|---|---|
| Consentimento | O usuário entende que a localização será usada para encontrar profissionais associados próximos. |
| Alternativa manual | O usuário pode informar cidade, estado ou bairro sem ativar localização do dispositivo. |
| Base ativa | Só aparecem profissionais com vínculo ativo, especialidade cadastrada e status publicado. |
| Cálculo de proximidade | O ranking considera distância aproximada em quilômetros quando latitude/longitude existir. |
| Especialidade | A necessidade do usuário é mapeada para uma ou mais especialidades elegíveis. |
| Teleatendimento | Profissionais online podem aparecer quando não houver opção próxima ou quando fizer sentido. |
| Auditoria | A recomendação registra necessidade detectada, critérios usados e resultado de interação. |

## 12. Fase 4 — Ações de interface simples

A Fase 4 transforma sugestões textuais em ações reais. O usuário pode clicar em botões como “Enviar exame”, “Completar cadastro”, “Ver profissionais”, “Usar minha localização”, “Informar minha cidade” ou “Ver clínicas associadas”. Essa etapa cria a ponte entre conversa e sistema sem ainda executar análise profunda de arquivos ou venda complexa.

| Ação | Componente | Resultado esperado |
|---|---|---|
| `suggest_signup` | Formulário leve de cadastro | Usuário começa a criar perfil sem sair do chat. |
| `suggest_exam_upload` | Botão ou painel de upload futuro | Usuário entende que pode enviar exame com privacidade. |
| `suggest_professional_search` | Botão de profissionais associados | Usuário inicia busca por especialidade e localização. |
| `request_location_permission` | Modal ou sheet mobile | Usuário autoriza localização ou escolhe busca manual. |
| `suggest_save_context` | Ação de salvar histórico | Conversa passa a alimentar memória com consentimento. |

## 13. Fase 5 — Cards contextuais

Na Fase 5 entram cards de produto, profissional, clínica, consulta ou cadastro. A IA Mestre decide quando o card é adequado, mas a interface precisa manter controle de densidade visual. Em mobile, um card grande pode atrapalhar a conversa; por isso, o card deve ser compacto, recolhível e contextual.

| Card | Quando pode aparecer | Cuidado principal |
|---|---|---|
| Profissional associado | Quando houver necessidade de orientação humana, especialidade compatível e localização suficiente | Explicar motivo da recomendação sem prometer resultado. |
| Clínica associada | Quando houver clínica ativa próxima ou adequada à demanda | Indicar localização, modalidade e CTA simples. |
| Produto/suplemento | Quando houver interesse explícito ou contexto forte | Não apresentar como tratamento ou prescrição. |
| Consulta | Quando o usuário pedir acompanhamento | Deixar claro que é opção, não obrigação. |
| Cadastro | Quando memória/perfil melhorar a experiência | Explicar benefício com linguagem simples. |

O card profissional deve conter, no mínimo, nome, profissão, especialidade principal, cidade/UF, distância aproximada quando houver, modalidade de atendimento, vínculo com a rede associada, breve descrição e CTA. Se houver mapa, ele deve ser complementar, nunca requisito para concluir a ação principal.

## 14. Fase 6 — Marketplace contextual

A Fase 6 conecta a IA Mestre ao marketplace. Ela deve consultar catálogo, estoque, preço, disponibilidade, categoria e elegibilidade antes de sugerir qualquer produto. O caso inicial ideal é **suplemento**, não medicamento, pois o risco regulatório e clínico é menor quando a linguagem é bem controlada.

A recomendação comercial deve ser contextual e transparente. O sistema pode dizer que existe uma opção disponível, mas não deve afirmar que o produto trata, cura ou substitui avaliação profissional. O produto aparece como apoio possível à rotina, nunca como conclusão diagnóstica.

| Regra | Exigência |
|---|---|
| Produto ativo | Só sugerir itens publicados e disponíveis. |
| Estoque | Não oferecer produto sem disponibilidade. |
| Contexto | Só sugerir quando a conversa justificar. |
| Linguagem | Usar termos como “opção”, “apoio”, “se fizer sentido”. |
| Segurança | Não transformar suplemento em tratamento médico. |

## 15. Fase 7 — Carrinho e checkout simplificado

Na Fase 7, a venda dentro da conversa se torna operacional. O usuário deve conseguir adicionar ao carrinho a partir de um card ou link, revisar quantidade, ver resumo e iniciar checkout com o menor número possível de passos. Esta fase materializa o conceito de **venda direta na resposta da busca/conversa**.

O checkout deve ser simples, mas não apressado. Em saúde, a confiança vale mais do que a pressão comercial. A IA Mestre deve oferecer o caminho, mas a decisão final precisa permanecer claramente com o usuário.

| Etapa | Experiência desejada |
|---|---|
| Ver produto | Card contextual com preço, imagem e descrição curta. |
| Adicionar ao carrinho | Um clique, com confirmação visual discreta. |
| Revisar | Resumo simples, quantidade e total. |
| Checkout | Fluxo curto, claro e compatível com mobile. |
| Pós-compra | Confirmação, orientação de acompanhamento e suporte. |

## 16. Fase 8 — Upload seguro

A Fase 8 introduz upload, mas ainda sem análise profunda. O foco é infraestrutura, privacidade, consentimento, autenticação, armazenamento, metadados, status e associação do arquivo ao usuário. O sistema deve explicar por que o cadastro ou login melhora privacidade, continuidade e segurança.

| Elemento | Requisito |
|---|---|
| Consentimento | Usuário precisa entender o uso do arquivo. |
| Armazenamento | Arquivo deve ser salvo de forma segura, fora do bundle da aplicação. |
| Metadados | Registrar tipo, tamanho, usuário, data e finalidade. |
| Tipos aceitos | Começar com PDF, PNG e JPG. |
| Erros | Mensagens claras para arquivo inválido, grande ou ilegível. |

## 17. Fase 9 — Leitura de exames

Na Fase 9, os arquivos enviados passam a ser interpretados de forma assistiva. PDFs digitais podem ser extraídos por parser; PDFs escaneados e imagens devem passar por OCR ou visão multimodal. A IA Mestre deve transformar o conteúdo em dados estruturados: nome do exame, data, biomarcadores, valores, unidades, faixas de referência e observações.

A resposta ao usuário deve explicar o material em linguagem clara, sem fechar diagnóstico ou prescrever tratamento. O resultado ideal é que o usuário sinta que seus exames foram organizados e contextualizados para uma conversa mais inteligente. Quando a leitura indicar necessidade de acompanhamento, a IA Mestre pode conectar essa interpretação à rede geolocalizada de profissionais associados, sempre com linguagem de convite e nunca de determinação.

| Situação | Conduta da IA Mestre |
|---|---|
| PDF legível | Extrair texto e estruturar dados. |
| PDF escaneado | Usar OCR/visão antes da estruturação. |
| Imagem de exame nítida | Ler valores e unidades com cautela. |
| Imagem ilegível | Pedir novo arquivo, sem inventar dados. |
| Valores sensíveis | Explicar de forma assistiva e sugerir profissional associado quando necessário. |

## 18. Fase 10 — Imagens clínicas sensíveis

Imagens de ferimentos, pele ou sinais físicos devem entrar apenas depois que o sistema tiver maturidade de upload, consentimento e governança. A IA Mestre pode descrever sinais visíveis e orientar atenção profissional quando houver sinais preocupantes, mas não deve fechar diagnóstico por imagem nem recomendar medicamento.

| Tipo de imagem | Permitido | Não permitido |
|---|---|---|
| Ferimento | Descrever sinais visíveis e sugerir avaliação se houver alerta | Diagnosticar infecção específica ou prescrever conduta. |
| Pele | Sugerir acompanhamento quando houver preocupação | Afirmar natureza de lesão. |
| Inchaço/vermelhidão | Recomendar atenção proporcional ao risco percebido | Substituir avaliação clínica. |
| Imagem ilegível | Pedir nova foto com melhor iluminação | Supor detalhes não visíveis. |

## 19. Fase 11 — Aprendizado operacional e auditoria

A IA Mestre deve aprender com uso real, mas esse aprendizado precisa ser auditável. Não se trata de deixar a IA “mudar sozinha” sem controle. O sistema deve registrar eventos de decisão, exposição, clique, aceitação, rejeição, conversão, abandono e feedback. Esses dados alimentam melhorias de prompts, limiares de confiança, regras comerciais, qualidade de recomendação profissional e UX.

| Métrica | Finalidade |
|---|---|
| Intenção detectada | Avaliar se a IA Mestre compreende a conversa. |
| Especialidade sugerida | Medir se o mapeamento necessidade-especialidade faz sentido. |
| Profissional exibido | Auditar quem foi recomendado e por qual critério. |
| Distância e modalidade | Avaliar se proximidade e teleatendimento estão equilibrados. |
| Clique | Medir interesse real. |
| Solicitação de consulta | Medir conversão da rede associada. |
| Rejeição/ignorado | Detectar intervenções invasivas ou pouco úteis. |
| Feedback | Melhorar qualidade, segurança e adequação das recomendações. |
| Eventos de risco | Revisar casos sensíveis. |

## 20. Módulos técnicos previstos

A arquitetura deve ser modular. Cada peça entra no momento certo, reduzindo acoplamento e evitando que uma falha da IA Mestre comprometa o chat principal.

| Módulo técnico | Quando entra | Função |
|---|---:|---|
| `MasterAI Orchestrator` | Fase 1 | Decide intenção, confiança, risco e ação. |
| `Professional Matching Engine` | Fase 3 | Cruza necessidade, especialidade, localização, modalidade e rede associada. |
| `Geo Consent Layer` | Fase 3 | Solicita localização ou coleta cidade manual com consentimento claro. |
| `Network Directory` | Fase 3 | Mantém médicos, nutricionistas e clínicas associados, ativos e pesquisáveis. |
| `UIAction Engine` | Fase 4 | Traduz decisões em links, botões, cards, mapa e formulários. |
| `Recommendation Engine` | Fase 5 | Escolhe produtos, profissionais, clínicas ou jornadas possíveis. |
| `Marketplace Connector` | Fase 6 | Consulta catálogo, estoque, preço e elegibilidade. |
| `Cart/Checkout Connector` | Fase 7 | Adiciona item, revisa carrinho e inicia checkout. |
| `Secure Upload Pipeline` | Fase 8 | Armazena arquivos com consentimento e rastreabilidade. |
| `Document Intelligence` | Fase 9 | Lê PDFs, imagens de exames e estrutura resultados. |
| `Clinical Image Triage` | Fase 10 | Analisa imagens sensíveis com limites fortes. |
| `Learning/Audit Layer` | Fase 11 | Mede aceitação, rejeição, erro, conversão e segurança. |

## 21. Critérios de segurança e qualidade

A IA Mestre deve ser útil sem ser invasiva. Em especial, saúde, localização, recomendação profissional e comércio exigem uma fronteira clara entre informação, orientação, encaminhamento, recomendação comercial e conduta clínica. O sistema deve conectar usuários a profissionais associados com naturalidade, mas sem simular diagnóstico, garantia de resultado ou prescrição.

| Risco | Proteção necessária |
|---|---|
| IA Mestre interferir demais | Começar em modo silencioso e exigir confiança mínima. |
| Voltar fallback artificial | Teste de regressão bloqueando pós-processamento indevido. |
| Localização parecer invasiva | Pedir consentimento claro e oferecer busca manual por cidade. |
| Recomendar profissional fora da rede | Filtrar estritamente por vínculo ativo com a rede associada. |
| Ranqueamento injustificável | Registrar critérios de especialidade, distância, modalidade e disponibilidade. |
| Recomendação parecer diagnóstico | Usar linguagem de convite ao acompanhamento, não de determinação clínica. |
| Venda parecer prescrição | Linguagem comercial segura e separação entre suplemento e tratamento. |
| Produto errado aparecer | Checagem de estoque, categoria, elegibilidade e contexto. |
| Upload expor dados sensíveis | Consentimento, autenticação, armazenamento seguro e logs. |
| OCR inventar dados | Regra: se não leu com clareza, pedir novo arquivo. |
| Imagem clínica ser tratada como diagnóstico | Triagem visual e encaminhamento, sem diagnóstico fechado. |

## 22. Primeira entrega recomendada

A primeira entrega funcional deve ser pequena: **IA Mestre v0.1 — Observadora Textual**. Ela deve operar em modo silencioso e, no máximo, preparar sugestões textuais discretas para ativação posterior. A versão inicial pode trabalhar com quatro decisões: `none`, `suggest_signup`, `suggest_exam_upload` e `suggest_professional_search`. A decisão `suggest_product` deve ficar para etapa posterior, pois envolve catálogo, estoque, linguagem comercial e segurança regulatória.

| Decisão v0.1 | Quando usar | Exibição ao usuário |
|---|---|---|
| `none` | Conversa normal sem oportunidade clara | Nada aparece. |
| `suggest_signup` | Usuário demonstra necessidade de continuidade, memória ou privacidade | Inicialmente apenas log; depois sugestão discreta. |
| `suggest_exam_upload` | Usuário menciona exame, laudo ou vontade de enviar arquivo | Inicialmente apenas log; depois link/botão leve. |
| `suggest_professional_search` | Usuário pede profissional, clínica, nutricionista, médico ou acompanhamento | Inicialmente apenas log; depois sugestão de localização/cidade e rede associada. |

A v0.1 deve ser acompanhada por testes que comprovem que a IA Mestre não altera a resposta principal, não chama componentes visuais sem contrato e não interfere em mensagens válidas dentro do escopo. Para a camada primordial de profissionais, os testes devem validar que a decisão silenciosa identifica intenção de buscar profissional, mas não consulta localização nem exibe card antes do consentimento e da fase aprovada.

## 23. Próximo passo antes de codar

Antes de implementar, o próximo artefato deve ser o **contrato exato da IA Mestre v0.1 — Observadora Textual com intenção profissional**. Esse contrato precisa definir tipos de intenção, exemplos de mensagens, decisões esperadas, limites de confiança, formato de `uiActions`, logs, testes de regressão e critérios de aceite. Só depois desse contrato estar aprovado a codificação deve começar.

O objetivo é manter a disciplina que funcionou na recuperação do chat: **uma camada por vez, aprovada antes de implementar, testada antes de evoluir**. A diferença estratégica agora é que a recomendação de profissionais associados por geolocalização deve permanecer no centro do desenho, desde a primeira classificação silenciosa até a futura experiência com mapa, cards e solicitação de consulta.


## 24. Consolidação executiva dos blocos conceituais pendentes

Esta seção consolida, de forma explícita, os blocos conceituais que precisam orientar a próxima etapa antes de qualquer codificação adicional. Ela não substitui o roadmap por maturidade; ela traduz o roadmap em decisões operacionais mais claras para produto, engenharia, dados, IA, marketplace e experiência mobile.

A premissa central permanece a mesma: a **IA Mestre** não deve competir com Claude, GPT ou outros modelos fundacionais. Ela deve ser uma arquitetura orquestradora que observa contexto, memória consentida, intenção, localização, catálogo, profissionais, clínicas, arquivos e componentes de interface para decidir quando ficar silenciosa, quando sugerir algo e quando acionar uma ferramenta.

| Bloco conceitual | Decisão consolidada | Dependência antes de implementar |
|---|---|---|
| Estrutura atual do app | O sistema já possui chat, catálogo de profissionais, agenda, marketplace, dashboard e backoffice; a camada geolocalizada ainda precisa de tabelas e rotas dedicadas. | Mapeamento técnico formal das rotas, tabelas e contratos existentes. |
| IA Mestre | Deve ser orquestradora, não modelo único; usa modelos fortes como Claude/GPT e serviços especializados no momento certo. | Contrato TypeScript de intenção, decisão, confiança e ação visual. |
| Rede Dayan | Recomendação de médicos, nutricionistas e clínicas associados é eixo primordial. | Cadastro estruturado de profissionais, clínicas, localização, especialidade, disponibilidade e vínculo ativo. |
| Marketplace contextual | Ofertas devem surgir como continuidade da conversa, sem prescrição e sem pressão comercial. | Catálogo ativo, estoque, preço, carrinho, elegibilidade, linguagem segura e auditoria. |
| Formulários contextuais | Devem aparecer ao lado ou abaixo do chat quando melhorarem privacidade, cadastro, exames ou continuidade. | Consentimento, autenticação, UX mobile e persistência de dados. |
| Upload multimodal | PDFs, PNGs, exames, imagens e fotos clínicas entram por fases, começando por armazenamento seguro. | Pipeline de upload, metadados, OCR/visão, validação e revisão de risco. |
| Governança ML/LLM | Toda sugestão precisa ser mensurável, auditável e aprovada por etapa. | Métricas, eventos, testes, revisão humana e critérios de bloqueio. |

## 25. Mapeamento conceitual da estrutura atual e lacunas

O próximo levantamento técnico deve mapear a implementação real de usuários, profissionais, clínicas, produtos, marketplace, carrinho, pedidos e checkout antes de qualquer evolução. O objetivo não é reescrever o sistema, mas saber exatamente o que já existe, o que está simulado, o que está persistido e o que precisa de nova modelagem.

| Área | Estado conceitual observado | Lacuna para IA Mestre |
|---|---|---|
| Usuários | Há autenticação, papel de usuário e fluxos protegidos. | Consentimento granular para localização, memória, upload e recomendações contextuais precisa ser associado às decisões da IA Mestre. |
| Profissionais | Há experiência de catálogo, perfil, especialidade e solicitação de consulta. | Falta consolidar base geolocalizada com latitude, longitude, clínica, raio de atendimento, teleatendimento, vínculo Dayan e disponibilidade operacional. |
| Clínicas | Devem existir como entidade própria da rede associada, não apenas como texto de perfil. | É necessário modelar clínicas, endereços, serviços, profissionais vinculados e status de publicação. |
| Marketplace | Há catálogo e linguagem comercial separada de prescrição. | A IA Mestre precisa de conector para elegibilidade, estoque, preço, categoria, contraindicação comercial e carrinho. |
| Carrinho e pedidos | Devem evoluir para fluxo curto, moderno e rastreável. | Checkout simplificado, status de pedido, confirmação e pós-compra ainda dependem de desenho operacional. |
| Chat | Fluxo limpo deve ser preservado como resposta principal. | A IA Mestre deve rodar lateralmente no início, sem reescrever a resposta do modelo. |
| Backoffice | Há base administrativa para operação. | Precisa ganhar gestão estruturada de rede associada, geolocalização, recomendações, auditoria e métricas de conversão. |

## 26. Modelo estratégico de venda contextual

A venda contextual deve ser entendida como **conveniência assistiva**, não como publicidade invasiva. O sistema não deve empurrar produtos; deve reconhecer quando a conversa naturalmente cria uma oportunidade de apoio prático. A IA Mestre observa intenção, histórico consentido, perfil, localização, etapa da jornada e qualidade do contexto para decidir se uma sugestão comercial é útil ou se deve permanecer silenciosa.

| Situação conversacional | Ação comercial aceitável | Ação proibida |
|---|---|---|
| Usuário pergunta sobre suplementação de forma explícita | Mostrar categoria ou produto como opção disponível, com linguagem de apoio à rotina. | Afirmar que o suplemento trata, cura ou substitui avaliação profissional. |
| Usuário relata exame alterado | Sugerir organização do exame e possível profissional associado. | Vender produto como resposta direta ao exame. |
| Usuário fala de sono, energia ou rotina | Oferecer conteúdo, formulário ou acompanhamento; produto só se houver intenção clara. | Transformar qualquer sintoma em oferta automática. |
| Usuário já está em card de produto | Permitir adicionar ao carrinho com resumo claro. | Criar urgência artificial ou promessa terapêutica. |
| Usuário demonstra desconforto ou risco | Priorizar cuidado humano e segurança. | Exibir oferta comercial no momento de vulnerabilidade. |

A IA Mestre deve possuir uma regra simples: **primeiro cuidado, depois conveniência, por último comércio**. Quando houver dúvida, a decisão correta é não oferecer produto. Quando houver oportunidade legítima, o texto deve ser transparente: “há uma opção no app que pode apoiar sua rotina, se fizer sentido para você”.

## 27. Formulários contextuais ao lado do chat

Formulários contextuais devem funcionar como pequenas extensões da conversa. Eles não devem parecer interrupções burocráticas. A IA Mestre só deve sugerir um formulário quando ele reduzir atrito, aumentar segurança ou permitir continuidade real, como completar cadastro, informar cidade, registrar objetivo, enviar exame, escolher profissional ou revisar dados antes de uma consulta.

| Formulário | Quando aparece | Dados mínimos | Regra de privacidade |
|---|---|---|---|
| Localização manual | Usuário quer profissional próximo e não concedeu GPS. | Cidade, estado e, opcionalmente, bairro. | Explicar que será usado apenas para encontrar rede associada. |
| Cadastro leve | Usuário quer continuidade, agendamento ou upload. | Nome, contato e aceite de termos aplicáveis. | Não coletar dado sensível sem consentimento explícito. |
| Envio de exame | Usuário menciona PDF, imagem ou laudo. | Tipo de arquivo, finalidade e consentimento. | Arquivo deve ser tratado como dado sensível. |
| Preferências de profissional | Usuário quer médico, nutricionista, clínica ou teleatendimento. | Especialidade, modalidade, cidade e disponibilidade desejada. | Usar apenas para recomendação e contato operacional. |
| Pré-consulta | Usuário solicita acompanhamento. | Queixa principal, objetivo e horário preferido. | Mostrar o que será compartilhado com a equipe. |

A interface ideal em mobile é um **sheet contextual**: curto, com poucos campos, botão claro e opção de fechar. Em desktop, o formulário pode surgir ao lado do chat, mantendo a conversa visível.

## 28. Contrato conceitual da IA Mestre

O primeiro contrato da IA Mestre deve decidir entre responder, sugerir cadastro, solicitar upload, indicar profissional, exibir produto, abrir formulário ou permanecer silenciosa. Essa decisão precisa ser estruturada, testável e reversível.

```ts
type MasterAIDecision = {
  intent:
    | "answer_only"
    | "suggest_signup"
    | "suggest_upload"
    | "suggest_professional"
    | "suggest_clinic"
    | "suggest_product"
    | "suggest_cart"
    | "ask_location"
    | "stay_silent";
  confidence: number;
  reason: string;
  shouldShowUI: boolean;
  uiAction:
    | "none"
    | "footer_text"
    | "quick_reply"
    | "side_form"
    | "professional_card"
    | "clinic_card"
    | "product_card"
    | "cart_summary"
    | "upload_panel"
    | "map_preview";
  safetyClass: "normal" | "sensitive" | "urgent" | "commercial";
  requiresConsent: boolean;
  requiredConsentType?: "location" | "health_data" | "file_upload" | "commercial_recommendation";
  auditTags: string[];
};
```

Na v0.1, esse contrato deve rodar sem alterar a resposta principal. O resultado deve ser usado para logs, testes e análise de qualidade. Apenas depois de validação prática a interface pode começar a exibir sugestões discretas.

## 29. Uso de Claude, GPT, modelos multimodais e serviços especializados

A IA Mestre deve usar modelos e serviços de forma modular. Claude ou GPT podem ser excelentes para linguagem, raciocínio e síntese, mas não devem carregar sozinhos responsabilidades como geolocalização, carrinho, estoque, consentimento ou persistência. Essas responsabilidades pertencem a ferramentas e bancos controlados pelo app.

| Capacidade | Melhor responsável | Papel da IA Mestre |
|---|---|---|
| Resposta conversacional | Claude/GPT ou provedor principal definido | Decidir se a conversa segue limpa ou se há ação lateral. |
| Classificação de intenção | Modelo leve, heurística ou LLM estruturado | Produzir decisão auditável com confiança. |
| Geolocalização | Serviço de localização, mapas e banco de profissionais | Solicitar consentimento e ranquear opções elegíveis. |
| Marketplace | Backend de catálogo, estoque, carrinho e pedidos | Decidir se há contexto suficiente para sugerir oferta. |
| PDF e OCR | Parser, OCR, visão multimodal e extração estruturada | Orquestrar leitura, checar confiança e acionar explicação. |
| Imagem clínica | Modelo visual especializado e regras de segurança | Limitar resposta a descrição cautelosa e encaminhamento quando necessário. |
| Aprendizado operacional | Eventos, métricas, avaliações e revisão humana | Ajustar limiares e priorizar melhorias, sem aprendizagem cega. |

A regra arquitetural é: **LLMs interpretam e comunicam; ferramentas executam; a IA Mestre decide o encaixe seguro entre ambos**.

## 30. Procedimento conceitual para documentos, PDFs, PNGs, exames e imagens clínicas

A leitura multimodal deve entrar em camadas. Primeiro o app recebe o arquivo com consentimento e segurança. Depois identifica tipo, qualidade, legibilidade e finalidade. Só então uma etapa especializada extrai ou interpreta o conteúdo. A IA Mestre consolida a informação em linguagem útil, sem diagnóstico fechado.

| Tipo de entrada | Pipeline conceitual | Saída permitida | Limite rígido |
|---|---|---|---|
| PDF digital | Upload seguro → extração textual → estruturação → resumo assistivo | Lista de exames, datas, valores, unidades e pontos para conversar. | Não diagnosticar nem prescrever. |
| PDF escaneado | Upload seguro → OCR → conferência de legibilidade → estruturação | Resumo com aviso de baixa confiança quando necessário. | Não inventar dado ilegível. |
| PNG/JPG de exame | Upload seguro → visão/OCR → extração cautelosa | Organização dos dados visíveis. | Se a imagem estiver ruim, pedir novo envio. |
| Foto de ferimento | Upload seguro → triagem visual cautelosa → sinais observáveis | Descrição de sinais visíveis e sugestão de avaliação quando aplicável. | Não nomear doença específica como certeza. |
| Documento clínico | Upload seguro → extração → resumo para continuidade | Síntese para o usuário e possível preparação de consulta. | Não expor dados sem consentimento. |

A IA Mestre deve conectar documentos à rede associada quando fizer sentido. Por exemplo, após organizar exames metabólicos, pode sugerir profissionais associados de nutrição, endocrinologia ou medicina integrativa próximos ao usuário, desde que haja consentimento e base cadastrada.

## 31. Fases detalhadas de evolução da IA Mestre

A evolução deve continuar gradual para impedir regressão do chat limpo. O primeiro ganho é análise textual silenciosa; depois vêm sugestões discretas; depois componentes; depois marketplace; depois checkout; depois multimodalidade.

| Etapa | Capacidade liberada | Critério para avançar |
|---|---|---|
| v0.1 | Observação textual silenciosa de intenção e oportunidade. | Não altera resposta principal e acerta intenções em testes. |
| v0.2 | Sugestões textuais discretas no rodapé ou quick replies. | Usuários entendem a sugestão sem sentir interrupção. |
| v0.3 | Formulários contextuais de localização, cadastro e pré-consulta. | Consentimento claro e baixa fricção mobile. |
| v0.4 | Cards de profissionais e clínicas da rede associada. | Ranking auditável por especialidade, localização e disponibilidade. |
| v0.5 | Cards de produtos e marketplace contextual. | Linguagem segura, estoque validado e separação de prescrição. |
| v0.6 | Carrinho e checkout simplificado. | Conversão possível sem pressão e com fluxo mobile curto. |
| v0.7 | Upload seguro de documentos e imagens. | Armazenamento, metadados e consentimento funcionando. |
| v0.8 | Leitura assistida de exames e documentos. | Extração confiável e fallback para baixa legibilidade. |
| v0.9 | Imagens clínicas sensíveis com triagem cautelosa. | Governança forte e revisão de riscos. |
| v1.0 | Aprendizado operacional contínuo. | Métricas e revisão humana sustentando melhoria sem opacidade. |

## 32. Critérios de teste, segurança, métricas e aprovação por etapa

Cada fase deve ter critérios objetivos. O projeto só deve avançar quando testes, métricas e revisão de produto demonstrarem que a nova camada agrega valor sem quebrar a experiência conversacional.

| Dimensão | Critério mínimo |
|---|---|
| Testes de regressão | Mensagens válidas continuam indo ao modelo principal sem pós-processamento indevido. |
| Testes de intenção | A IA Mestre diferencia profissional, clínica, suplemento, upload, cadastro, compra e fora de escopo. |
| Testes de localização | Nenhuma busca por GPS ocorre sem consentimento; busca manual funciona como alternativa. |
| Testes comerciais | Produto não aparece como prescrição, cura, diagnóstico ou substituto de profissional. |
| Testes multimodais | Arquivo ilegível não gera dado inventado; imagem clínica não vira diagnóstico fechado. |
| Métricas de utilidade | Cliques, aceites, rejeições, abandono e feedback medem se a sugestão ajuda. |
| Métricas de segurança | Eventos sensíveis, urgência, recusa, consentimento e bloqueios são auditados. |
| Aprovação de etapa | Produto, PMO e responsável técnico validam antes de tornar visível ao usuário. |

## 33. Decisão final desta etapa conceitual

A IA Mestre deve ser desenvolvida como **sistema operacional inteligente do Doutorelo**, e não como um prompt maior. Sua função estratégica é transformar uma conversa em jornada: entender necessidade, preservar confiança, acionar cadastro, localizar profissionais associados à rede do Dr. Dayan, sugerir clínicas, organizar exames, permitir upload, conectar marketplace e simplificar checkout.

A recomendação geolocalizada da rede Dayan permanece como prioridade estruturante. Sem ela, o app corre o risco de ser apenas um chat. Com ela, o Doutorelo se torna uma plataforma de conexão entre usuários, cuidado humano, inteligência conversacional, comunidade de pertencimento e ecossistema comercial responsável.

A partir desta atualização, nenhuma evolução da IA Mestre deve ser codificada sem validação prévia de Sidney. Cada incremento planejado deve caber em um ciclo curto de trabalho de até 5 minutos, admitindo no máximo 7 minutos quando houver uma dependência técnica inevitável. Essa regra protege o produto contra costuras grandes demais, acoplamentos frágeis e retrabalho por problemas técnicos descobertos tarde.

## 34. Atualização incorporada a partir dos áudios do Leydson

Os áudios do Leydson reforçam que a IA Mestre não deve ser vista apenas como uma inteligência que responde perguntas. Ela deve conduzir o usuário para dentro de um ecossistema de confiança, em que a conversa pode abrir caminho para **profissionais da Rede Dayan**, **perfis de pacientes**, **avaliações**, **relatos de evolução** e, em uma fase posterior, **comunidade com presença percebida do Dr. Dayan**. A leitura de produto é que a IA funciona como porta de entrada, a rede humana funciona como ponte de cuidado e a comunidade funciona como mecanismo de retenção emocional.

> Diretriz incorporada: a IA Mestre deve respeitar tanto o usuário que chega conversando sobre um problema de saúde quanto o seguidor do Dr. Dayan que já chega decidido e pede diretamente uma lista de profissionais de determinada localidade.

| Ideia vinda dos áudios | Incorporação no plano da IA Mestre | Implicação prática |
|---|---|---|
| Catálogo de médicos com foto, nome, especialidade, região, online/presencial e avaliações | A Rede Dayan deixa de ser apenas recomendação abstrata e passa a exigir perfil profissional mínimo confiável. | O card de profissional deve evoluir para perfil navegável, com dados suficientes para decisão do usuário. |
| Paciente com perfil, identidade e avaliações | A avaliação deve ser tratada como parte de uma camada de confiança, não como nota anônima solta. | O perfil do paciente deve nascer com cuidado de privacidade e pode entrar depois do catálogo mínimo. |
| Compartilhamento futuro de resultados e experiências | A comunidade deve ser planejada como evolução de pertencimento, não como fórum genérico. | Relatos, resultados e interações precisam de moderação, consentimento e governança. |
| Proximidade emocional com o Dr. Dayan | A comunidade só tem valor se transmitir presença, curadoria e vínculo com a figura central do projeto. | Posts, respostas, recados e curadoria do Dr. Dayan devem ser pensados como ativos de retenção. |

A decisão de produto resultante é que a **Rede Dayan** deve entrar cedo, mas em microetapas. Primeiro, o sistema precisa responder bem a pedidos diretos de profissionais. Depois, pode mostrar perfis mínimos. Em seguida, pode aceitar avaliações autenticadas. Só depois deve avançar para perfil do paciente, relatos e comunidade.

## 35. Regra de intenção direta: pedido direto recebe resposta direta

Muitos usuários serão seguidores do Dr. Dayan e poderão chegar ao chat já sabendo o que querem. Nesse caso, a IA Mestre não deve criar fricção artificial, não deve forçar uma conversa clínica antes de entregar a informação e não deve transformar uma busca objetiva em jornada comercial. Se o usuário pede uma lista de profissionais por localidade, a resposta correta é entregar a lista disponível com objetividade, clareza e próximos passos simples.

| Tipo de entrada do usuário | Conduta correta da IA Mestre | Conduta proibida |
|---|---|---|
| “Me mostre profissionais em Maringá.” | Listar profissionais disponíveis em Maringá ou região próxima, com especialidade, modalidade e CTA para perfil. | Responder com explicação longa sobre saúde antes de mostrar a lista. |
| “Tem nutricionista da Rede Dayan em Sobral?” | Confirmar se há nutricionistas cadastrados e mostrar opções, ou explicar que não há cadastro disponível naquela localidade. | Empurrar produto, suplemento ou cadastro antes de responder. |
| “Quero médico online da rede.” | Mostrar profissionais com teleatendimento quando existirem, ou pedir apenas o dado mínimo que faltar. | Exigir geolocalização se a intenção já é online. |
| “Lista de médicos em Cianorte.” | Entregar lista direta e permitir refinar por especialidade se necessário. | Fazer triagem clínica obrigatória sem o usuário pedir. |
| “Quem atende ansiedade em Natal?” | Mostrar profissionais elegíveis por localidade e especialidade/abordagem, com linguagem de convite. | Prometer resultado ou dizer que aquele profissional resolverá o caso. |

Essa regra muda a prioridade de UX: quando a intenção é **busca objetiva**, o chat funciona como uma busca conversacional direta. Quando a intenção é **orientação em saúde**, o chat funciona como apoio informacional cuidadoso. Quando a intenção é **compra**, o chat pode abrir marketplace com segurança. A IA Mestre precisa distinguir esses três modos para não misturar cuidado, catálogo e comércio.

## 36. Regra de não-venda em conversas de saúde

Quando o usuário chega discutindo sintomas, exames, ansiedade, sono, rotina, emagrecimento, dor, cansaço ou qualquer problema de saúde, o papel primário do chat é **auxiliar**, não vender. A IA Mestre deve preservar a confiança da conversa e só sugerir próximos passos quando a própria conversa indicar utilidade real. Mesmo nesses casos, a linguagem deve ser de convite, nunca de empurrão.

| Modo conversacional | Prioridade | O que pode aparecer | O que não deve aparecer |
|---|---|---|---|
| Orientação em saúde | Ajudar o usuário a entender melhor o tema e organizar próximos passos. | Sugestão discreta de profissional, exame, cadastro ou conteúdo quando fizer sentido. | Oferta comercial automática, card invasivo ou recomendação com tom de urgência artificial. |
| Busca direta de profissional | Entregar resultado objetivo. | Lista, filtros, perfil profissional e opção de contato/solicitação. | Aula desnecessária, triagem obrigatória ou venda antes da lista. |
| Interesse explícito em produto | Mostrar opções com transparência. | Produto, categoria, preço, estoque e carrinho, se o marketplace estiver aprovado. | Promessa de cura, prescrição, substituição de avaliação profissional. |
| Comunidade/Dayan | Fortalecer vínculo e pertencimento. | Posts, relatos, comentários, recados e curadoria quando a fase estiver aprovada. | Usar emoção para pressionar compra ou consulta. |

A regra operacional é: **pergunta direta, resposta direta; problema de saúde, cuidado primeiro; comércio, somente quando houver intenção clara ou contexto validado**. Essa frase deve orientar o contrato da IA Mestre, os testes e a revisão de UX.

## 37. Método de trabalho: microincrementos validados com Sidney

A evolução do Doutorelo deve seguir uma disciplina de produto e engenharia baseada em microincrementos. Nenhuma implementação nova deve começar antes de validação explícita de Sidney sobre escopo, intenção e critério de aceite. Cada ação planejada deve caber em um ciclo de até **5 minutos de trabalho**, admitindo excepcionalmente **7 minutos** quando houver dependência técnica inevitável. Se uma tarefa parecer maior do que isso, ela deve ser quebrada antes de qualquer alteração em código.

| Regra operacional | Como aplicar | Por que importa |
|---|---|---|
| Nada de codar sem combinar | Antes de editar código, apresentar entendimento, microescopo e critério de aceite. | Evita construir funcionalidade desalinhada com a visão do produto. |
| Microincremento de 5 minutos | Cada passo deve ser pequeno, verificável e reversível. | Reduz risco de acoplamento e facilita correção de rota. |
| Máximo excepcional de 7 minutos | Só usar quando a etapa técnica não puder ser quebrada sem perder coerência. | Mantém ritmo sem criar blocos grandes demais. |
| Uma mudança, uma validação | Cada microetapa deve ter um resultado observável: documento atualizado, teste, contrato, UI mínima ou ajuste isolado. | Evita rede de retalhos e permite aprendizado rápido. |
| Planejamento antes de backlog técnico | Primeiro alinhar produto; depois traduzir em tarefa técnica. | Impede que a solução técnica mande na estratégia. |

Esse método deve ser tratado como parte do plano da IA Mestre. A IA Master, a Rede Dayan, o marketplace e a comunidade são módulos sensíveis e conectados. Se forem implementados em blocos grandes, o risco de costura frágil aumenta. Se forem implementados em microcamadas validadas, o projeto preserva controle técnico e coerência estratégica.

## 38. Microplano recomendado para incorporar Leydson sem criar retalhos

A incorporação das ideias do Leydson deve começar pela menor unidade de valor: responder bem quando alguém pede profissionais de uma localidade. Essa entrega é menor, mais segura e mais diretamente alinhada ao comportamento esperado dos seguidores do Dr. Dayan. Ela não exige comunidade completa, nem perfil de paciente completo, nem marketplace, nem checkout.

| Ordem | Microincremento | Critério de aceite | O que fica fora por enquanto |
|---:|---|---|---|
| 1 | Documentar e aprovar a regra “pedido direto recebe resposta direta”. | Sidney valida a regra e exemplos antes de qualquer código. | Banco novo, UI nova, avaliação e comunidade. |
| 2 | Mapear tecnicamente onde a base fictícia/DEV de profissionais já existe. | Saber se a lista vem de tabela, seed, constante ou procedure existente. | Criar novas tabelas antes de confirmar lacuna real. |
| 3 | Definir contrato textual da resposta direta de profissionais por localidade. | Ter exemplo aprovado de resposta para “profissionais em Maringá”. | Card, mapa, perfil detalhado e avaliação. |
| 4 | Se aprovado, ajustar apenas a decisão da IA Mestre para reconhecer busca direta. | A intenção direta não vira venda nem triagem clínica. | Catálogo completo e geolocalização automática. |
| 5 | Se aprovado, conectar a resposta direta à lista DEV existente. | O usuário recebe lista objetiva quando a localidade existir. | Avaliações autenticadas e perfil de paciente. |
| 6 | Se aprovado, permitir CTA “ver perfil” em item de profissional. | Cada profissional listado pode abrir perfil mínimo. | Agendamento real, pagamento e comunidade. |
| 7 | Só depois, planejar avaliações e perfil do paciente. | Avaliação tem identidade, privacidade e regra clara. | Relatos públicos e ranking social sem governança. |
| 8 | Por fim, planejar comunidade Dayan. | Comunidade tem proposta, moderação e presença/curadoria. | Fórum genérico sem vínculo emocional. |

A sequência acima não é autorização para codar. Ela é apenas o mapa de decisão. O próximo passo correto é Sidney validar se a primeira microetapa aprovada será: **pedido direto de lista por localidade**, **perfil profissional mínimo**, ou **ajuste da coreografia da IA Mestre**. Só depois dessa escolha uma tarefa técnica pequena deve ser aberta.

## 39. Referências da atualização de persuasão ética e comportamento

[1]: https://www.influenceatwork.com/7-principles-of-persuasion/ "Dr. Robert Cialdini's Seven Principles of Persuasion — Influence at Work"
[2]: https://behaviordesign.stanford.edu/resources/fogg-behavior-model "Fogg Behavior Model — Stanford Behavior Design Lab"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC7317949/ "Two ethical concerns about the use of persuasive technology for vulnerable people — Bioethics / PubMed Central"

