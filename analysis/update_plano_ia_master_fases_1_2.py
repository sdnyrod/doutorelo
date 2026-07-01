from pathlib import Path

path = Path('/home/ubuntu/saude-integrativa-ia-dev/docs/plano_implementacao_ia_mestre.md')
text = path.read_text()
start_marker = '## 9. Fase 1 — IA Mestre textual silenciosa'
end_marker = '## 11. Fase 3 — Geolocalização consentida e base da rede associada'

start = text.index(start_marker)
end = text.index(end_marker)

replacement = '''## 9. Fase 1 — Comportamento da IA Mestre: responder, observar e sugerir sem vender

A Fase 1 deve consolidar a IA Mestre como uma camada de inteligência contextual que entende a intenção do usuário antes de sugerir qualquer ação. O objetivo não é fazer o chat vender mais; é fazer o chat **entender melhor, responder com menos fricção e só abrir caminhos laterais quando houver encaixe real**. Essa fase precisa corrigir três riscos já observados: responder com cidade errada, sugerir suplementos sem contexto e transformar uma busca objetiva por profissionais em conversa clínica desnecessária.

A regra central passa a ser: **pergunta direta recebe resposta direta; conversa de saúde recebe cuidado primeiro; comércio só aparece por intenção clara ou contexto validado**. Essa regra deve ser tratada como contrato de produto, critério de teste e limite de implementação. A IA Mestre pode observar sinais de oportunidade, mas não deve confundir oportunidade com permissão para empurrar produto, suplemento, consulta ou cadastro.

| Modo de intenção | Sinal típico do usuário | Resposta correta | Ação proibida |
|---|---|---|---|
| Pedido direto de catálogo | “Me mostre profissionais em Natal”, “Tem nutricionista em Sobral?”, “Lista de médicos online da rede.” | Entregar lista objetiva, respeitando cidade, especialidade e modalidade solicitadas. | Fazer triagem clínica antes da lista, sugerir cidade diferente ou vender produto antes de responder. |
| Conversa sobre saúde | “Estou cansado”, “Durmo mal”, “Meu exame veio alterado”, “Tenho ansiedade.” | Acolher, explicar de forma útil, organizar próximos passos e só sugerir profissional se houver contexto suficiente. | Transformar sintoma genérico em oferta automática de suplemento, consulta ou produto. |
| Contexto implícito de indicação | O usuário relata um problema e informa cidade, pede ajuda prática ou demonstra desejo de acompanhamento humano. | Convidar de forma discreta: “se fizer sentido, posso te mostrar profissionais próximos”. | Mostrar card invasivo sem explicar o motivo ou sem respeitar a localidade informada. |
| Interesse explícito em produto | “Vocês têm suplemento para comprar?”, “Quero ver produtos”, “Tem algo para rotina de sono?” | Mostrar categoria ou produto apenas como apoio opcional, com transparência comercial e sem promessa terapêutica. | Prescrever, prometer cura, diagnosticar ou induzir compra por medo. |
| Fora de escopo | Política, finanças puras, tecnologia genérica, entretenimento sem ponte de saúde. | Redirecionar com cordialidade para saúde integrativa, rotina, corpo, mente ou bem-estar. | Chamar profissionais, produtos ou comunidade para um assunto que não tem ponte com saúde. |

### 3.1. Regra de intenção direta: pedido direto não vira triagem

Quando o usuário pede uma lista, cidade, especialidade, modalidade ou perfil profissional, a IA Mestre deve agir como **busca conversacional objetiva**. Isso é especialmente importante porque parte do público chegará como seguidor do Dr. Dayan e já saberá o que procura. Criar fricção nesse momento reduz confiança e passa a sensação de que o sistema não escutou o pedido.

| Entrada do usuário | Conduta esperada | Exemplo de resposta adequada |
|---|---|---|
| “Me mostre profissionais em Natal.” | Usar Natal-RN como filtro principal e listar profissionais disponíveis naquela cidade. | “Claro. Em Natal-RN, posso te mostrar estas opções da Rede Dayan por especialidade...” |
| “Tem nutricionista funcional em Sobral?” | Filtrar por cidade e especialidade; se não houver, dizer a verdade e oferecer alternativa transparente. | “Encontrei opções de nutrição funcional em Sobral-CE. Se quiser, também posso filtrar por atendimento online.” |
| “Quero médico online da rede.” | Priorizar modalidade online; pedir cidade apenas se ela melhorar a recomendação. | “Posso te mostrar profissionais com teleatendimento. Se você me disser sua cidade, também ordeno por proximidade.” |
| “Quem atende ansiedade em Natal?” | Interpretar como possível necessidade de profissional, mas sem prometer resultado clínico. | “Posso te mostrar profissionais em Natal-RN que atuam com cuidado integrativo e saúde mental/rotina, sem prometer diagnóstico.” |

A correção mais importante dessa regra é a localidade. Se o usuário disse Natal, a IA não pode substituir por Maringá. Se a base não tiver profissionais suficientes em Natal, a resposta correta é assumir a lacuna: “não encontrei opções suficientes em Natal-RN na base atual; posso te mostrar atendimento online ou cidades próximas, se você quiser”. A cidade sugerida como alternativa precisa ser apresentada como alternativa, nunca como se fosse a cidade pedida.

> Regra rígida de localidade: **cidade informada pelo usuário é filtro forte, não preferência fraca**. A IA Mestre só pode ampliar para teleatendimento, região próxima ou outra cidade quando declarar explicitamente que não encontrou resultado suficiente na cidade pedida e pedir autorização para expandir.

### 3.2. Regra de não-venda: suplemento e produto só com contexto explícito ou validado

A Fase 1 deve proteger a confiança do usuário contra recomendações comerciais prematuras. Em saúde, vender cedo demais pode parecer oportunismo, assustar o cliente e enfraquecer a autoridade do ecossistema. Por isso, a IA Mestre não deve sugerir suplementos, produtos ou marketplace apenas porque detectou palavras como sono, cansaço, ansiedade, emagrecimento, energia, intestino, dor ou exame.

| Situação | O que a IA pode fazer | O que a IA não pode fazer |
|---|---|---|
| Usuário relata cansaço sem pedir produto | Acolher, organizar hipóteses de rotina, sugerir observar sono, alimentação, exames e acompanhamento profissional quando adequado. | Sugerir suplemento, dose, marca, carrinho ou produto como resposta inicial. |
| Usuário pergunta “qual suplemento tomar?” | Explicar que não deve prescrever; pedir contexto e orientar conversa com profissional. | Indicar dose, produto específico ou promessa de efeito. |
| Usuário pede “produtos disponíveis” | Mostrar marketplace/categorias quando aprovado, com aviso de que são opções comerciais de apoio à rotina. | Usar linguagem de tratamento, cura, diagnóstico ou substituição de avaliação. |
| Usuário está vulnerável, ansioso ou assustado | Priorizar segurança, clareza e encaminhamento humano. | Usar gatilho emocional para converter consulta, produto ou assinatura. |

Essa regra não impede venda contextual. Ela apenas define que a venda legítima deve nascer de **utilidade percebida**, não de pressão. Quando houver dúvida, a IA Mestre deve ficar silenciosa comercialmente. Quando houver encaixe real, a linguagem deve ser opcional: “se fizer sentido para você”, “posso te mostrar”, “há uma opção no app que pode apoiar sua organização”, e nunca “você precisa”, “é essencial comprar” ou “isso resolve”.

### 3.3. Persuasão ética: “vender sem vender” como confiança, não manipulação

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

### 3.4. Contrato decisório mínimo da Fase 1

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

### 4.1. Perfil mínimo do profissional

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

### 4.2. Matriz mínima de cobertura para testes

A matriz de cobertura mínima deve contemplar as cidades prioritárias definidas por Sidney e Leydson: **Natal-RN, Maringá-PR, Cianorte-PR e Sobral-CE**. Para validar a lógica sem viés de cidade errada, cada cidade precisa ter pelo menos dois profissionais por especialidade integrativa prioritária. Isso gera uma base mínima de 48 registros fictícios em DEV.

| Cidade prioritária | Nutricionista Funcional | Endocrinologista | Dentista | Cardiologista | Clínico Geral | Pediatra | Total mínimo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Natal-RN | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Maringá-PR | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Cianorte-PR | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| Sobral-CE | 2 | 2 | 2 | 2 | 2 | 2 | 12 |
| **Total DEV mínimo** | **8** | **8** | **8** | **8** | **8** | **8** | **48** |

Essa matriz não deve ser interpretada como rede real pronta. Ela é um instrumento de teste para garantir que a IA Master consiga responder corretamente a pedidos diretos, filtrar por cidade e não “puxar” profissionais de outra localidade por ausência de dados. Depois da validação de Sidney, a população DEV pode ser feita com nomes fictícios e avatares genéricos, enquanto a base real segue fluxo separado de curadoria.

### 4.3. Correção da lógica de localidade

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

### 4.4. Plano de população DEV

O plano de população DEV deve ser pequeno, auditável e reversível. Ele deve começar com a matriz de 48 profissionais fictícios, sem avaliações públicas reais. Cada registro precisa ser rastreável como `dev_fictional`, para impedir confusão com rede real. A primeira validação não precisa de fotos reais, agenda real nem contato real; precisa apenas demonstrar que a IA Master respeita localidade, especialidade e modalidade.

| Microincremento | Resultado esperado | Validação com Sidney |
|---|---|---|
| Mapear modelo atual de profissionais | Confirmar quais campos já existem no schema, seed e procedures. | Sidney valida se o modelo atende ao perfil mínimo. |
| Definir taxonomia de especialidades | Padronizar as seis especialidades prioritárias e sinônimos. | Sidney valida nomes exibidos ao usuário. |
| Criar matriz fictícia DEV | Preparar 48 registros mínimos, sem uso de dados reais sensíveis. | Sidney aprova cidades, especialidades e formato. |
| Testar busca direta por cidade | Consultas por Natal, Maringá, Cianorte e Sobral retornam apenas a cidade certa. | Sidney valida exemplos de resposta. |
| Testar fallback honesto | Cidade sem cobertura informa lacuna e pede autorização para expandir. | Sidney valida linguagem. |
| Planejar avaliações | Definir identidade do paciente, moderação, privacidade e anti-fraude. | Não implementar até aprovação específica. |

### 4.5. Relação com avaliações, perfil de paciente e comunidade

As avaliações e o perfil de paciente são importantes, mas não devem entrar antes de o catálogo mínimo funcionar. A sequência segura é: primeiro lista correta por cidade; depois perfil mínimo do profissional; depois CTA de interesse; depois avaliações autenticadas; depois perfil de paciente; por fim comunidade com presença curada do Dr. Dayan. Antecipar comunidade antes de corrigir localidade e catálogo criaria uma experiência social em cima de dados frágeis.

Essa fase também deve obedecer à regra de microincrementos: cada passo deve caber em até 5 minutos, com máximo excepcional de 7 minutos, e só deve ser executado depois de Sidney validar o microescopo. Nenhuma alteração técnica deve ser feita apenas para “consertar Natal”; o conserto precisa respeitar interpretação, dados, ranking, fallback, texto, UI e testes.

'''

updated = text[:start] + replacement + text[end:]

references_header = '## 39. Referências da atualização de persuasão ética e comportamento'
if references_header not in updated:
    refs = '''

## 39. Referências da atualização de persuasão ética e comportamento

[1]: https://www.influenceatwork.com/7-principles-of-persuasion/ "Dr. Robert Cialdini's Seven Principles of Persuasion — Influence at Work"
[2]: https://behaviordesign.stanford.edu/resources/fogg-behavior-model "Fogg Behavior Model — Stanford Behavior Design Lab"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC7317949/ "Two ethical concerns about the use of persuasive technology for vulnerable people — Bioethics / PubMed Central"
'''
    updated = updated.rstrip() + refs + '\n'

path.write_text(updated)
print('Documento atualizado:', path)
print('Caracteres antes:', len(text), 'depois:', len(updated))
