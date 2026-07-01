# Revisão mobile V4

A revisão mobile começou com captura headless simples em `--window-size=390,844`, que sugeriu dois problemas objetivos: o texto de apoio do hero parecia ultrapassar a área útil e a navegação inferior parecia esconder o quinto item. As primeiras correções reduziram padding, larguras e espaçamentos do hero e da navegação inferior.

Depois disso, um diagnóstico por DevTools Protocol mostrou que a captura headless simples não representava um telefone real: o Chromium estava usando `innerWidth=500` apesar do screenshot solicitado em 390px. Essa diferença fazia a imagem parecer recortada no lado direito. Para validar corretamente, foi criada uma captura por `Emulation.setDeviceMetricsOverride` com **390px reais de largura CSS**, 844px de altura e `deviceScaleFactor=1`.

Na captura validada por emulação real, a página apresentou `innerWidth=390`, `scrollWidth=390`, hero entre `left=16` e `right=374`, e os cinco itens da navegação inferior ficaram visíveis: **Início**, **IA**, **Médicos**, **Saber** e **Rituais**. Portanto, a versão mobile final não apresenta overflow horizontal mensurado nesse viewport.

A correção final tornou a barra inferior baseada em `w-screen` no mobile, reduziu espaçamentos e tamanhos de rótulos/ícones em telas estreitas, e manteve largura máxima apenas a partir do breakpoint `sm`. O resultado preserva o tom leve da V4, evita overflow horizontal e mantém o acesso aos cinco módulos principais.

| Evidência | Finalidade |
|---|---|
| `/home/ubuntu/webdev-static-assets/reviews/v4_mobile_review.png` | Primeira captura, usada para detectar cortes aparentes. |
| `/home/ubuntu/webdev-static-assets/reviews/v4_mobile_review_after.png` | Captura intermediária após ajustes iniciais. |
| `/home/ubuntu/webdev-static-assets/reviews/v4_mobile_review_final.png` | Captura headless simples ainda afetada pela largura mínima do Chromium. |
| `/home/ubuntu/webdev-static-assets/reviews/v4_mobile_review_nav_final.png` | Captura após ajuste da navegação, ainda com limitação do método simples. |
| `/home/ubuntu/webdev-static-assets/reviews/v4_mobile_review_cdp.png` | Captura validada por emulação mobile real de 390px. |
