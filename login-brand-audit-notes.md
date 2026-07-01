# Auditoria de marca do login DOUTORELO

Data: 2026-05-02.

## Achados iniciais em DEV

A tela pública acessada em `/login` apresenta a identidade DOUTORELO, a logo oficial transparente e quatro opções de entrada: Google, Apple, código por email e email/senha. No conteúdo extraído da tela não apareceu a palavra “Manus”. A página informa que a autenticação continuará em uma tela segura e que o DOUTORELO não pede a senha diretamente nessa página.

Foi observada uma inconsistência operacional no navegador: a navegação solicitada para `/login` retornou URL exibida como `/app`, enquanto o conteúdo renderizado continuou sendo a experiência de login. A tentativa de clicar no elemento indexado “Continuar com Google” falhou porque o elemento não foi localizado no momento do clique, exigindo nova visualização/inspeção antes de testar o handoff.

## Hipótese técnica

O arquivo `client/src/pages/Login.tsx` usa `getOAuthLoginUrl(nextPath)` diretamente quando o usuário escolhe qualquer método. Isso preserva a infraestrutura OAuth nativa, mas pode levar o usuário para uma tela técnica externa que ainda exibe marca Manus, dependendo do portal de autenticação. A correção deve manter o mecanismo técnico encapsulado, reforçar a copy DOUTORELO na página intermediária e criar contratos que impeçam texto visível como “Manus”, “Manus OAuth” ou “login via Manus” em superfícies públicas do app.

## Validação DEV pós-correção — 2026-05-02

A rota de entrada autenticada em DEV foi aberta diretamente. A superfície visível mostra **DOUTORELO** como marca, com título “Entrada segura e sem fricção”, opções “Continuar com Google”, “Continuar com Apple”, “Receber código por email” e “Entrar com email e senha”. A copy da etapa seguinte informa que o usuário continuará em uma etapa segura do DOUTORELO e não menciona Manus, Manus OAuth ou login via Manus. O navegador preservou retorno para `/app`, como esperado para acesso autenticado.

Validações automáticas realizadas nesta rodada: `pnpm vitest run server/v2.design.test.ts`, `pnpm test` e `pnpm build`. O status DEV indicou servidor em execução, LSP sem erros, TypeScript sem erros e dependências OK.
