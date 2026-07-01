# Wireframe conceitual da tela principal do DOUTORELO

**Abordagem:** conversa primeiro, sistema depois  
**Objetivo:** transformar a primeira experiência em um chat de saúde simples, imediato e acolhedor, revelando a sofisticação do sistema conforme a conversa evolui.  
**Status:** wireframe conceitual para validação antes de implementação visual.

## 1. Tese da tela

A tela principal do DOUTORELO deve se comportar como uma experiência conversacional moderna. O usuário não deve chegar a uma plataforma cheia de módulos que ele precisa entender antes de começar. Ele deve chegar a uma pergunta simples, digitar sua dúvida de saúde e ver a conversa nascer na própria tela.

> **Princípio-mãe:** o usuário começa com uma dúvida; o DOUTORELO transforma essa dúvida em cuidado organizado.

A sofisticação do produto não desaparece. Ela fica em segundo plano, pronta para emergir quando fizer sentido. A tela inicial deve ser simples como um chat, mas o comportamento interno deve ser clínico, progressivo e estruturado.

## 2. Estado A — Tela inicial antes da primeira pergunta

Neste primeiro estado, o produto precisa parecer leve, quase óbvio. O centro da tela é uma caixa de pergunta. A navegação existe, mas não compete com a conversa. As funcionalidades aparecem como sugestões discretas, não como exigência de entendimento prévio.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ DOUTORELO                                                     Entrar  Criar conta │
│                                                                              │
│                                                                              │
│                 Seu ponto de partida para qualquer dúvida de saúde            │
│                                                                              │
│              ┌──────────────────────────────────────────────────┐            │
│              │ Qual é a sua dúvida sobre saúde?                  │            │
│              │                                                  │            │
│              │                                         [Enviar] │            │
│              └──────────────────────────────────────────────────┘            │
│                                                                              │
│              [Sintoma] [Exame] [Medicamento] [Suplemento] [Hábitos]          │
│                                                                              │
│        Respostas educativas. Não substitui atendimento médico.                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Elemento | Função na experiência |
|---|---|
| Logo DOUTORELO | Dá identidade e confiança, sem excesso institucional. |
| Entrar / Criar conta | Fica disponível, mas não bloqueia o primeiro contato. |
| Headline | Comunica que qualquer dúvida de saúde pode começar ali. |
| Campo central | É o elemento dominante da tela. Ele deve parecer a ação natural. |
| Chips iniciais | Ajudam quem não sabe como começar, mas não tomam o protagonismo. |
| Aviso clínico discreto | Define limite de segurança sem assustar o usuário. |

## 3. Estado B — Após a primeira pergunta: a tela vira chat

Assim que o usuário envia a primeira pergunta, a interface deve fazer uma transição clara: a landing deixa de ser uma vitrine e passa a ser uma conversa. A resposta da IA aparece na área central, com histórico, campo fixo inferior e sugestões contextuais.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ DOUTORELO                                         Conversa atual   Entrar      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Usuário                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ Paracetamol faz mal para o fígado?                                   │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  DOUTORELO                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ Pode fazer mal em algumas situações, principalmente em doses altas,  │    │
│  │ uso repetido ou quando há doença no fígado ou consumo de álcool.     │    │
│  │ Para te orientar melhor, posso entender rapidamente seu contexto?    │    │
│  │                                                                      │    │
│  │ Qual sua idade? Você tomou qual dose? Usa algum outro remédio?       │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [Tenho exame do fígado] [Uso outros remédios] [Quero saber dose segura]      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ Escreva sua resposta ou nova dúvida...                         [→]  │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Comportamento | Decisão de UX |
|---|---|
| A primeira resposta não deve ser genérica | Ela responde à pergunta e inicia anamnese mínima. |
| A IA não deve despejar formulário | Ela faz poucas perguntas relevantes, em tom conversacional. |
| O chat deve manter continuidade | O usuário percebe que começou uma conversa real, não uma busca isolada. |
| As sugestões devem ser contextuais | Os chips mudam conforme o tema: sintomas, exame, medicamento, hábito ou especialista. |

## 4. Estado C — Cadastro contextual, não barreira inicial

O cadastro deve aparecer quando houver valor evidente. Em vez de bloquear o usuário logo no começo, o DOUTORELO deve primeiro demonstrar utilidade. Depois, quando a conversa já tiver contexto, a IA convida o usuário a salvar, acompanhar ou personalizar.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  DOUTORELO                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ Entendi. Como você mencionou uso recorrente de medicamento e exame,  │    │
│  │ posso salvar esta conversa no seu histórico de saúde para acompanhar │    │
│  │ com mais segurança nas próximas vezes.                               │    │
│  │                                                                      │    │
│  │ Criando uma conta, você pode voltar a este contexto, anexar exames   │    │
│  │ e receber orientações mais personalizadas.                            │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│           [Criar conta e salvar histórico]   [Continuar sem salvar]          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Este ponto é fundamental. O usuário não cria conta porque foi obrigado; ele cria porque entendeu que existe ganho real em manter histórico, receber continuidade e organizar o cuidado.

## 5. Estado D — Revelação progressiva do sistema

Depois que a conversa identifica uma intenção, o DOUTORELO revela ferramentas específicas. A plataforma deixa de ser um menu inicial pesado e passa a ser um conjunto de recursos ativados pela necessidade.

| Intenção detectada na conversa | Funcionalidade revelada | Como aparece no chat |
|---|---|---|
| “Estou com dor há três dias” | Anamnese guiada e alerta de risco | “Posso te fazer algumas perguntas rápidas para entender sinais de alerta?” |
| “Meu exame deu alterado” | Leitura e organização de exames | “Se quiser, você pode anexar o exame para eu te ajudar a entender os pontos principais.” |
| “Quero dormir melhor” | Registro de hábitos | “Posso transformar isso em um acompanhamento simples de sono?” |
| “Preciso de um médico” | Busca por especialista | “Posso te ajudar a procurar um especialista adequado para esse tipo de queixa.” |
| “Tomo suplemento X” | Pesquisa de suplemento | “Posso analisar benefícios, riscos e interações prováveis, com cuidado.” |

## 6. Estado E — Versão autenticada da tela principal

Quando o usuário já está cadastrado, a tela continua sendo chat-first. A diferença é que o sistema pode mostrar memória, histórico e atalhos laterais sem perder a simplicidade central.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ DOUTORELO                                      Histórico   Perfil   Sair       │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ Hoje          │                                                              │
│ Exames        │  Como posso te ajudar com sua saúde hoje?                    │
│ Hábitos       │                                                              │
│ Medicamentos  │  ┌──────────────────────────────────────────────────────┐    │
│ Especialistas │  │ Pergunte sobre sintomas, exames, remédios, hábitos... │    │
│ Plano cuidado │  │                                               [→]    │    │
│               │  └──────────────────────────────────────────────────────┘    │
│               │                                                              │
│               │  Sugestões com base no histórico:                            │
│               │  [Rever exame anterior] [Registrar sono] [Continuar conversa] │
│               │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

A lateral autenticada existe para usuários que já entenderam o sistema. Para o usuário novo, ela deve ser mínima ou inexistente. O chat é sempre o centro.

## 7. Hierarquia visual recomendada

| Prioridade | Elemento | Peso visual |
|---|---|---|
| 1 | Campo de pergunta/chat | Máximo. Deve dominar a primeira experiência. |
| 2 | Resposta da IA | Alta legibilidade, sensação de conversa viva. |
| 3 | Sugestões contextuais | Moderadas, úteis, discretas. |
| 4 | Cadastro contextual | Aparece só quando agrega valor. |
| 5 | Menus e módulos | Secundários, progressivos, sem poluir a entrada. |

## 8. Regra de ouro para implementação

O DOUTORELO não deve perguntar “qual módulo você quer usar?”. Ele deve perguntar **“qual é a sua dúvida sobre saúde?”** e, a partir da resposta, decidir qual módulo, trilha ou cuidado faz sentido revelar.

> **Wireframe em uma frase:** uma tela inicial simples como ChatGPT, conduzida com acolhimento clínico, que transforma cada conversa em uma jornada de cuidado progressivamente estruturada.
