# Auditoria visual da Home atual e direção de ruptura

A estrutura atual da Home é tecnicamente funcional, mas visualmente presa a uma linguagem previsível: fundo claro quase plano, menu lateral em painel tradicional, campo de chat centralizado, balões sequenciais que ocupam essencialmente a mesma região superior e cards de sugestão em formato de painel lateral convencional. Essa combinação explica a percepção de que o produto está “grosso” e pouco sofisticado: a experiência comunica cuidado básico, não ecommerce 4.0 com IA viva.

O problema principal não é apenas cor ou espaçamento. O problema é de **estrutura perceptiva**. A tela não cria descoberta, profundidade nem surpresa. O campo de texto ainda parece um formulário. Os balões funcionam como tooltips estáticos. O painel de sugestão parece card comum. O menu oculto preserva foco, mas ainda é um drawer de produto tradicional. Para atender ao briefing do Sidney, a Home precisa parecer um **portal de intenção inteligente**, com núcleo conversacional, camadas orbitais, módulos contextuais e sinais vivos que variam posição e comportamento.

## Pontos fracos identificados

| Área | Problema atual | Decisão de redesenho |
|---|---|---|
| Fundo | Gradientes suaves e seguros, com pouca assinatura visual. | Criar uma névoa bioluminescente com matriz radial, anéis orbitais, profundidade e brilho clínico controlado. |
| Chat | Composer limpo, mas ainda muito próximo de input padrão. | Transformar em “cápsula de comando” com aura, trilho espectral, camadas internas e ação mais energética. |
| Balões | Aparecem no mesmo lugar e repetem a gramática de tooltip. | Trocar para fragmentos orbitais com posições diferentes, alinhamentos diferentes e linguagem de sinais contextuais. |
| Cards | Painel lateral premium, porém convencional. | Recriar como “cápsula de próximo passo” com métrica de confiança, módulos internos e glow de material alienígena. |
| Menu | Drawer funcional, mas visualmente administrativo. | Recriar como “constelação de navegação”, preservando rotas, porém com superfície prismática, trilhas e itens mais premium. |
| Hierarquia | Tudo parece calmo demais e pouco memorável. | Aumentar contraste, textura, ritmo visual, camadas e microinterações sem comprometer acessibilidade. |

## Direção visual aprovada para implementação

A nova estética será **Medicina Bioluminescente Alienígena**, combinando branco laboratorial, névoa perolada, verde-água, ciano espectral, azul abissal e coral energético. A interface deve parecer feita por uma civilização futura que entende saúde, comércio inteligente e IA contextual, sem cair em dark sci-fi pesado nem em spa genérico.

O código deverá preservar os fluxos funcionais já existentes: `trpc.homeChat.send.useMutation`, envio por Enter, autofocus, geolocalização contextual, menu com rotas implementadas, proteção de acessibilidade e sugestão posterior à resposta. O redesenho será estrutural e visual, não uma remoção da lógica do produto.
