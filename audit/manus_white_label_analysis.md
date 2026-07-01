# Auditoria de Desmarcação Manus — DOUTORELO

## Leitura executiva

A solicitação é legítima e estrategicamente importante. Eu a enxergo como uma exigência de **marca branca, confiança comercial e controle narrativo**: o cliente final deve perceber o DOUTORELO como um produto próprio, coerente, independente e profissional, sem pistas visíveis de que a construção técnica foi feita em uma plataforma de desenvolvimento terceirizada.

A auditoria encontrou três camadas diferentes. A primeira é **visível para qualquer usuário comum**, como textos de login e domínio público. A segunda é **visível para pessoas técnicas**, como código-fonte carregado no navegador, rotas de storage e scripts de runtime. A terceira é **estrutural da infraestrutura**, isto é, depende de configuração de publicação, domínio, autenticação e serviços internos, e não deve ser removida cegamente porque pode quebrar login, storage, analytics, preview ou deploy.

## Classificação dos achados

| Camada | Achado | Quem consegue perceber | Risco de revelar Manus | Classificação | Tratamento recomendado |
|---|---|---:|---:|---|---|
| Texto de login | O componente `ManusDialog.tsx` exibe “Entre com sua conta Manus” e “Entrar com Manus”. | Usuário comum, caso veja modal de autenticação. | Alto | Removível no código | Trocar por “Entrar com segurança”, “Continuar no DOUTORELO” ou “Acessar minha conta”. |
| Domínio publicado | O HTML publicado referencia `saudedev-apjfywob.manus.space` em canonical e Open Graph. | Usuário, cliente, buscador, auditor, compartilhamento em WhatsApp/LinkedIn. | Muito alto | Mitigável por domínio | Publicar em domínio próprio, por exemplo `app.doutorelo.com.br` ou `saude.doutorelo.com.br`. |
| Imagem social | O HTML publicado usa imagem social em `files.manuscdn.com`. | Quem inspeciona link preview ou HTML. | Alto | Mitigável por metadata/asset | Criar e configurar Open Graph/Twitter image própria em domínio DOUTORELO ou asset sem marca Manus no URL público. |
| Runtime público | O HTML contém `script id="manus-runtime"` e variável `window.__MANUS_HOST_DEV__`. | Auditor técnico via “ver código-fonte”. | Alto | Estrutural/mitigável com cautela | Não remover sem testar; investigar se o plugin é necessário para funcionamento no hosting. Se possível, condicionar/remover apenas em produção publicada. |
| Debug collector | `client/public/__manus__/debug-collector.js` e rota `/__manus__/logs` existem no DEV e no build local. | Técnico que inspeciona assets ou rotas. | Médio/alto | Parcialmente removível | Remover do build de produção se não for necessário; manter apenas no DEV, se indispensável para diagnóstico. |
| Storage de imagem | Logo da Home usa `/manus-storage/...`. | Técnico via DevTools/network. | Médio | Estrutural/mitigável | Usar rota proxy neutra, como `/media/...`, ou hospedar assets públicos em domínio próprio/CDN própria quando viável. |
| OAuth | Login usa variáveis `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` e callback `/api/oauth/callback`. | Técnico via bundle/network. | Médio/alto | Estrutural | A copy pode ser branca, mas o provedor de auth pode continuar percebível no redirecionamento. Para sumir totalmente, seria preciso autenticação própria ou provedor branded. |
| Dependência | `vite-plugin-manus-runtime` aparece em `package.json` e bundle/runtime. | Só quem acessa código ou DevTools avançado. | Médio | Estrutural | Não é problema para cliente comum, mas deve ser avaliado antes de remoção por possível dependência do deploy. |
| Backend interno | Arquivos `server/_core/*`, comentários e testes mencionam Manus, Forge, OAuth e storage. | Não visível ao usuário final, salvo se código for entregue. | Baixo no site publicado; alto se entregar repositório. | Removível/renomeável parcialmente | Para entrega de código, criar branch/zip sanitizado sem comentários, testes e nomes internos sensíveis. |
| DEV preview | URL DEV `manus.computer`/`manus.space` é inerente ao ambiente de preview. | Quem recebe link DEV. | Muito alto | Estrutural | Nunca enviar DEV link a cliente final; enviar somente domínio próprio publicado. |

## Interpretação estratégica

O ponto principal é que “não parecer Manus” não se resolve apenas trocando uma frase. É um programa de **white-label completo**. A experiência comum do usuário pode ser limpa rapidamente, mas uma pessoa técnica ainda consegue encontrar rastros se o site continuar publicado em domínio `manus.space`, se o HTML carregar runtime com nome Manus, se o login redirecionar para portal Manus, ou se os assets públicos forem servidos por URLs com `manus` no caminho ou domínio.

A abordagem correta é por camadas. Primeiro, limpar o que qualquer usuário vê. Segundo, reduzir rastros técnicos no frontend carregado pelo navegador. Terceiro, decidir o nível real de ocultação desejado: apenas marca branca para usuário final, ou também resistência à inspeção técnica por desenvolvedor, auditor ou concorrente.

## Plano recomendado

| Prioridade | Ação | Impacto | Risco técnico | Observação |
|---:|---|---:|---:|---|
| 1 | Trocar textos do modal de autenticação para linguagem DOUTORELO. | Alto | Baixo | Correção imediata e segura. |
| 2 | Configurar domínio próprio antes de apresentar ao mercado. | Muito alto | Baixo/médio | Essencial para não aparecer `manus.space` em URL, canonical e previews. |
| 3 | Criar metadata própria: title, description, canonical, OG image e Twitter image. | Alto | Baixo | Evita preview social com `files.manuscdn.com`. |
| 4 | Auditar build publicado e remover debug collector em produção, se dispensável. | Médio/alto | Médio | Deve ser testado porque a instrumentação ajuda no DEV. |
| 5 | Criar rota ou estratégia neutra para assets públicos. | Médio | Médio | `/media/logo...` transmite menos origem que `/manus-storage/...`. |
| 6 | Definir política de links: nunca enviar preview DEV para cliente final. | Alto | Baixo | Processo operacional, não apenas código. |
| 7 | Se for necessário ocultação técnica forte, avaliar auth própria ou provedor white-label. | Muito alto | Alto | É a parte mais estrutural; troca autenticação, sessão e possivelmente permissões. |
| 8 | Se entregar código a terceiros, gerar pacote sanitizado. | Alto | Médio | Remover comentários, testes internos e nomes de dependências quando permitido. |

## Minha recomendação objetiva

Eu não tentaria “apagar tudo” de uma vez, porque alguns rastros fazem parte da infraestrutura que mantém login, publicação, storage e runtime funcionando. O caminho profissional é estabelecer um alvo: **usuário final não percebe nada** como etapa imediata; **inspeção técnica superficial não encontra marcas óbvias** como etapa seguinte; e **ocultação técnica profunda** apenas se houver exigência jurídica, comercial ou de white-label contratual forte.

A primeira intervenção que eu recomendo implementar é simples: substituir o `ManusDialog` por um `SecureAccessDialog` com copy DOUTORELO, configurar domínio próprio e revisar metadata social. Isso já remove os pontos de maior exposição comercial. Depois, avançamos para runtime/debug/storage com testes cuidadosos para não quebrar o app.

## Decisão necessária

Para avançar com implementação, a decisão mais importante é escolher o nível de ocultação desejado:

| Nível | Objetivo | O que fica aceitável |
|---|---|---|
| Nível 1 — Cliente final | Usuário comum não vê Manus em texto, tela, domínio ou preview. | Pode haver rastros em DevTools avançado. |
| Nível 2 — Auditor técnico leve | Código-fonte HTML e Network não mostram `Manus` de forma óbvia. | Pode haver dependências internas inevitáveis. |
| Nível 3 — White-label rigoroso | Até inspeção técnica deve ter o mínimo possível de sinais. | Exige domínio próprio, metadata própria, assets neutros, possível auth própria e revisão de runtime. |

Minha leitura é que o DOUTORELO deveria mirar pelo menos o **Nível 2** antes de demonstrações comerciais relevantes, e considerar o **Nível 3** se houver parceiros, franquias, licenciamento ou venda enterprise.
