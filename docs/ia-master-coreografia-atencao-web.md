# IA Master — Coreografia de Atenção na Versão Web

Esta especificação define como a IA Master deve **responder**, **sugerir** e **aparecer visualmente** na experiência web do DOUTORELO. O princípio central é separar a conversa textual do ato de mostrar algo ao usuário. A resposta do chat deve permanecer humana, breve e útil; já as sugestões, cards, formulários e próximos passos devem ocupar as laterais do chat em desktop, surgindo com movimento suave, foco visual e presença suficiente para serem percebidos sem depender de rolagem.

> A IA Master não deve apenas disparar componentes. Ela deve encenar uma sugestão: perceber o momento, escolher o espaço certo, entrar com graça e sustentar a atenção sem interromper a conversa.

| Camada | Função no produto | Comportamento esperado |
|---|---|---|
| Resposta central | Conversar com o usuário | Mensagem curta, humana, sem tom defensivo, sem excesso de disclaimers e sem expor limitações internas quando o sistema possui contexto próprio. |
| Observação invisível | Interpretar intenção e oportunidade | Detectar quando há chance de cadastro, upload, recomendação profissional, produto, formulário ou continuidade de cuidado. |
| Painel lateral | Mostrar o que precisa ser percebido | Usar o lado direito do chat em desktop como área viva de sugestões; em telas menores, usar bloco abaixo apenas como fallback responsivo. |
| Movimento | Atrair atenção sem susto | Entrar com atraso sutil, fade, deslocamento lateral, leve escala, elevação e glow transitório. Nunca aparecer seco ou de supetão. |
| Persistência | Não esconder ações importantes | Manter a sugestão visível ao lado da conversa enquanto for relevante, sem exigir que o usuário role até o fim para descobri-la. |

## Regra de Produto

Quando o usuário fizer uma pergunta que envolva sintomas, cidade, Rede Dayan, exames, continuidade de cuidado, cadastro ou produto contextual, o chat deve executar duas ações coordenadas. Primeiro, o texto central responde de forma acolhedora e objetiva, reconhecendo o contexto e apontando o próximo passo em linguagem natural. Segundo, a IA Master mostra a sugestão lateral com presença visual, como se o sistema tivesse “percebido algo importante” e oferecesse uma ação útil.

## Regra de Linguagem

O retorno do Claude passa a ser tratado como matéria-prima, não como produto final. A mensagem exibida deve ser polida para evitar frases como “não tenho acesso”, “preciso ser transparente”, “não posso afirmar” ou blocos longos defensivos quando a própria aplicação já dispõe de dados DEV, candidatos fictícios ou contrato de sugestão contextual. A resposta final deve soar como uma interface inteligente do DOUTORELO, não como uma janela crua de LLM.

## Critérios de Aceitação

| Critério | Verificação esperada |
|---|---|
| Card lateral em desktop | Em largura web, a sugestão aparece ao lado do chat, não abaixo da conversa. |
| Fallback mobile | Em telas estreitas, a sugestão pode aparecer abaixo, mas com animação e destaque suficientes. |
| Entrada graciosa | A sugestão usa slide lateral, fade, leve escala, elevação e brilho transitório. |
| Resposta polida | A mensagem do assistente não vem com estrutura de markdown cru, emojis desnecessários, tom defensivo ou listas excessivas. |
| Contexto operacional | O Claude ou o polidor sabe que o sistema possui uma camada IA Master e uma base DEV de profissionais, evitando negar acesso ao próprio fluxo contextual. |
