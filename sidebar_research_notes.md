# Pesquisa aplicada: sidebar esquerdo premium para DOUTORELO

A referência de UX da Nielsen Norman Group reforça que a navegação vertical deve ficar à esquerda em interfaces de leitura da esquerda para a direita, pois é mais notada, facilita escaneamento e suporta arquiteturas de informação amplas. O artigo também alerta contra esconder navegação em hamburger no desktop e contra depender apenas de ícones sem rótulos, porque isso aumenta custo cognitivo e reduz descoberta.

A referência da Aceternity UI mostra um padrão contemporâneo de sidebar que inicia compacto com ícones, expande suavemente no hover, organiza links em grupos primários e secundários, mantém perfil no rodapé e usa overlay em mobile. O aprendizado aplicável aqui é combinar presença fixa à esquerda no desktop com labels visíveis ou reveláveis, hover states ricos, item ativo evidente, agrupamento claro e transição fluida.

Direção aplicada ao DOUTORELO: substituir o totem direito por um painel esquerdo com fundo azul profundo em degradê, borda sutil translúcida, item ativo claro, ícones monoline, grupos com chevrons, microinterações de hover com deslocamento discreto, brilho suave e descrição contextual. No desktop, o sidebar deve ser visível à esquerda e ocupar espaço real de navegação; no mobile, deve abrir a partir da esquerda por um botão compacto. O visual deve evitar verde excessivamente chamativo, formato de cápsula decorativa, texto vertical inútil e qualquer aparência brega ou datada.

Fontes consultadas:
1. Nielsen Norman Group — Left-Side Vertical Navigation on Desktop: Scalable, Responsive, and Easy to Scan — https://www.nngroup.com/articles/vertical-nav/
2. Aceternity UI — Simple Sidebar With Hover — https://ui.aceternity.com/blocks/sidebars/simple-sidebar-with-hover

A documentação de sidebar da shadcn reforça que sidebars modernas precisam ser componentes estruturados, não apenas menus decorativos. O padrão recomendado separa Header, Content, Groups, Menu Items, Footer e Rail, permitindo estado colapsável, itens ativos, badges, submenus e navegação responsiva. Para o DOUTORELO, isso implica construir um componente com zonas claras: topo com marca/workspace, miolo com navegação agrupada e rodapé com ajuda e perfil.

A referência da Linear mostra uma tendência importante em produtos modernos: sidebars não são listas fixas sem contexto; elas se adaptam a fluxos de trabalho, permitem priorização, escondem o menos usado em “Mais” e comunicam notificações por ponto ou contagem. Para esta versão, não será implementada personalização completa, mas o design deve já nascer com estrutura escalável, grupos colapsáveis e indicadores discretos de atividade.

Critérios finais para implementação nesta rodada: sidebar fixo à esquerda em desktop; drawer vindo da esquerda no mobile; fundo azul-marinho em degradê com profundidade; item ativo em superfície clara; hover com brilho, deslocamento e contraste; grupos com setas rotativas; rótulos sempre legíveis no desktop; CTA de ajuda e perfil no rodapé; nenhum posicionamento à direita; nenhum texto vertical; nenhuma aparência de totem ou cápsula decorativa.

Fontes adicionais:
3. shadcn/ui — Sidebar component documentation — https://ui.shadcn.com/docs/components/sidebar
4. Linear — Personalized sidebar and new settings pages — https://linear.app/changelog/2024-12-18-personalized-sidebar
