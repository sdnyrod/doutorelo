# QA editorial V5 — conforto, maturidade e confiança percebida

Esta revisão foi tratada como uma reconstrução editorial e de composição da primeira experiência, não como uma troca superficial de frases. O objetivo verificável foi substituir a linguagem defensiva sobre IA por uma interface mais direta, brasileira e confortável, mantendo segurança técnica em contratos, fluxo e estrutura interna.

| Critério revisado | Evidência objetiva | Resultado |
|---|---|---|
| Primeira dobra sem postura defensiva | Varredura de `Home.tsx` e `Admin.tsx` sem ocorrências visíveis de frases como “sem diagnóstico”, “sem prescrição”, “fallback humano”, “IA com limite”, “humano no circuito” e similares. | Aprovado |
| Hero com linguagem brasileira mais natural | Hero atualizado para “Saúde para organizar a vida com mais calma.”, apoio curto e CTAs diretos. | Aprovado |
| Confiança por fluxo, não por disclaimer | Consentimento, privacidade, rede médica e continuidade aparecem como elementos de produto. | Aprovado |
| Contrato verificável de conforto editorial | Adicionado `v5EditorialComfortContract` em `Home.tsx` e testes correspondentes em `server/v2.design.test.ts`. | Aprovado |
| Navegação sem cobrir CTA | Preview mostrou sobreposição da navegação inferior; componente foi ajustado para ser fixo apenas em mobile e estático em telas grandes. | Aprovado após correção |
| Testes automatizados | `pnpm test` executado com 3 arquivos e 29 testes passando. | Aprovado |
| Build de produção | `pnpm build` executado com sucesso; permaneceu apenas aviso de chunk grande do Vite, sem erro de compilação. | Aprovado |
| Estado do servidor | `webdev_check_status` retornou servidor em execução, sem erros de LSP/TypeScript e dependências OK. | Aprovado |

## Evidência visual do último preview

O último status capturou screenshot em `/home/ubuntu/screenshots/webdev-preview-1777670663.png`. A captura confirmou que o CTA principal ficou visível após a correção da navegação inferior em telas grandes.

## Limite honesto da validação

A sensação final de conforto do usuário é necessariamente subjetiva. O que foi concluído de forma verificável foi a transformação de linguagem, a retirada do discurso defensivo da camada visível, a correção de composição visual observada no preview e a criação de testes para impedir regressões. A aprovação final de conforto deve vir da revisão do usuário no preview.
