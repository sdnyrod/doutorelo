# Evidências dos próximos passos V4

Este registro documenta os três ajustes executados após a V4 refinada: microcopy mais sutil nos módulos, segunda variação editorial do hero e revisão mobile com correções objetivas.

## Microcopy alinhada ao tom leve e sutil

A Home passou a usar linguagem mais calma, humana e menos imperativa nos módulos principais. Exemplos implementados em `client/src/pages/Home.tsx`:

| Módulo | Microcopy final |
|---|---|
| Hero | “Uma pausa segura para cuidar de você.” / “IA com limite, médicos por perto e uma jornada de saúde que começa sem pressa.” |
| IA | Placeholder: “Conte, com calma, o que seu corpo está tentando dizer...” |
| Médicos | “Médicos como presença, não vitrine.” / “A IA organiza o início. O cuidado humano aprofunda.” |
| Saber | “Conteúdo que aproxima sem invadir.” / “Pequenas leituras para chegar com mais calma à conversa clínica.” |
| Rituais/marketplace | “Rituais claros, sem promessa clínica.” / “Produtos opcionais para a rotina. A orientação clínica segue separada.” |

O backoffice também foi suavizado em `client/src/pages/Admin.tsx`, com a tese “Sala serena · IA governada · operação humana” e a descrição “um bastidor claro para cuidado, risco e confiança trabalharem juntos”, mantendo governança, auditoria e separação clínico-comercial sem tom dramático.

## Segunda variação editorial do hero

Foi adicionada a seção `EditorialHeroVariant` abaixo do hero principal, marcada por `data-v4-editorial-hero-variant="quiet-editorial-comparison"`, para comparar uma entrada mais editorial sem poluir a primeira dobra aprovada. O texto principal da variação é: “Um cuidado que começa pequeno, mas muda o modo como você se escuta.” A variação preserva os dois CTAs essenciais e mantém a mensagem de segurança clínica sem aumentar a densidade da primeira dobra.

## Revisão mobile

A revisão mobile detectou uma limitação da captura headless simples, que usava `innerWidth=500` apesar de uma imagem solicitada em 390px. Para validação correta, foi criada uma captura por DevTools Protocol com `Emulation.setDeviceMetricsOverride` em 390px reais.

| Métrica validada | Resultado |
|---|---|
| `innerWidth` | 390px |
| `scrollWidth` | 390px |
| Hero | `left=16`, `right=374` |
| Navegação inferior | cinco itens visíveis: Início, IA, Médicos, Saber e Rituais |

A correção final da navegação usa largura total da viewport no mobile, reduz espaçamentos e tamanhos de rótulos/ícones em telas estreitas, e mantém largura máxima apenas a partir do breakpoint `sm`.
