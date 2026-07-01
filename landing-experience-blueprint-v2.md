# Arquitetura da nova landing — experiência extraordinária

**Projeto:** Saúde Integrativa IA DEV  
**Autor:** SIDNEY (PMO SENIUM)  
**Data:** 01 de maio de 2026

## Premissa de reconstrução

A nova landing deve ser desenhada como uma experiência de entrada em um sistema vivo de cuidado. A página precisa abandonar o padrão “hero + três cards + CTA” e construir uma narrativa visual com tensão, descoberta e recompensa. A pessoa deve sentir que entrou em um produto com visão, não em uma apresentação genérica de startup.

A estrutura será cinematográfica, responsiva e viável em React/Tailwind sem depender de assets pesados. A direção visual será criada por CSS, camadas vetoriais, gradientes, painéis translúcidos, animações sutis e microinterações. Isso evita banco de imagens genérico e dá à página uma assinatura própria.

## Fluxo narrativo

| Ato | Papel na experiência | Módulo na landing | Emoção desejada |
|---|---|---|---|
| **Ato 1 — O impacto** | Mostrar imediatamente que a marca tem visão e presença. | Hero “observatório vivo” com mapa orbital, partículas, pulso e cards flutuantes. | Estranhamento positivo, curiosidade e percepção premium. |
| **Ato 2 — A verdade humana** | Nomear o problema real sem jargão. | Seção “A saúde não acontece em abas separadas”. | Reconhecimento cultural: “isso fala da minha vida”. |
| **Ato 3 — O elo inteligente** | Demonstrar o papel do produto como camada de interpretação e aproximação. | Tríade visual pessoa-contexto-cuidado com linhas e painéis. | Clareza, confiança e desejo de entender mais. |
| **Ato 4 — O produto como instrumento** | Tornar o produto tangível sem cair em dashboard comum. | Console escuro com módulos de rotina, exames, conversa e acompanhamento. | Sensação de tecnologia viva e útil. |
| **Ato 5 — Responsabilidade clínica** | Elevar confiança e limitar promessas. | Faixa ética: IA amplia contexto; cuidado humano decide caminhos. | Seriedade, maturidade e segurança. |
| **Ato 6 — Convite final** | Fechar com ambição e ação. | CTA imersivo com frase memorável e botões. | Encantamento e vontade de avançar. |

## Microcopy final por seção

| Seção | Texto principal | Texto de apoio |
|---|---|---|
| Hero | **O cuidado ganha outra dimensão quando alguém entende o todo.** | **Doutor·Elo aproxima sintomas, exames, rotina e orientação profissional em uma experiência de saúde mais clara, contínua e responsável.** |
| Selos do hero | **Menos ruído na cabeça**; **Mais clareza para conversar**; **Um caminho possível agora** | Selos curtos, quase editoriais, para evidenciar maturidade. |
| Verdade humana | **A saúde não acontece em abas separadas.** | **Ela aparece no exame guardado, na consulta rápida, na dor que volta, na rotina que muda, na pergunta que ficou para depois. O Doutor·Elo nasce para costurar esse contexto sem transformar cuidado em atendimento automático.** |
| Elo inteligente | **Entre a dúvida e a decisão existe um elo.** | **Uma camada de inteligência que organiza a conversa, preserva nuance e ajuda cada pessoa a chegar melhor preparada ao próximo passo de cuidado.** |
| Produto | **Um painel para perceber o que mudou.** | **Não é sobre colecionar dados. É sobre perceber relações: o que mudou, o que se repete, o que merece atenção e o que precisa ser levado para uma conversa clínica.** |
| Ética | **IA para ampliar contexto. Cuidado humano para decidir caminhos.** | **A experiência foi pensada para apoiar clareza, vínculo e acompanhamento — não para substituir avaliação profissional.** |
| Fechamento | **Se o cuidado precisa ser integrativo, a experiência também precisa ser.** | **Conheça uma forma mais inteligente, sensível e brasileira de aproximar tecnologia e saúde.** |

## Sistema visual para implementação

A página deve usar um fundo de base `#07110F` ou semelhante, com camadas em verde mineral, azul profundo, âmbar clínico e branco leitoso. O hero deve ocupar quase a tela inteira, com um “núcleo” visual à direita: círculos orbitais, nós conectados, cartões translúcidos e um pulso luminoso central. À esquerda, o texto deve ser grande, com uma hierarquia que respira e CTAs em formatos distintos.

O layout deve ter assimetria intencional. Em telas grandes, texto e visual devem coexistir como instalação. Em telas menores, o sistema orbital vira uma peça compacta abaixo do texto. As animações devem ser suaves, com respeito a `prefers-reduced-motion`. A página precisa parecer sofisticada mesmo parada; as animações apenas acentuam a presença.

| Elemento visual | Execução sugerida | Propósito |
|---|---|---|
| **Mapa orbital** | CSS com divs absolutas, bordas translúcidas, gradientes radiais e pontos animados. | Criar assinatura visual alienígena, sem depender de imagem. |
| **Cards translúcidos** | Painéis com `backdrop-blur`, bordas minerais e sombras profundas. | Dar sensação de instrumento clínico premium. |
| **Linha de pulso** | SVG inline com animação de dash ou gradiente. | Sugerir vida, continuidade e leitura sem usar clichê de ECG comum. |
| **Grid atmosférico** | Padrões de `linear-gradient` no fundo. | Trazer precisão tecnológica e profundidade. |
| **Microinterações** | Hover com leve deslocamento, brilho e borda viva. | Encantar sem distrair. |

## Critérios de aceite

A reconstrução só deve ser considerada válida se a primeira dobra da página parecer claramente diferente da versão anterior, se a experiência visual tiver assinatura própria, se a narrativa abandonar benefícios genéricos e se a microcopy soar brasileira, madura e culturalmente consciente. A página deve evitar qualquer formulação que pareça tradução literal, inclusive “organize seus sinais”, “jornada de saúde” usada de forma vazia, “desbloqueie”, “potencialize” e “revolucione”.
