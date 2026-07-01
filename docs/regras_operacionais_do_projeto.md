# Regras operacionais do projeto DOUTORELO

Este documento registra decisões de trabalho que devem orientar próximas interações no projeto, especialmente quando Sidney pedir análises, documentos, ajustes estratégicos ou implementação técnica.

## Regra de checkpoints

Entregas exclusivamente documentais, análises estratégicas, refinamentos de plano, atualização de roadmap, notas de produto e arquivos Markdown de referência **não devem gerar checkpoint do projeto web** quando não houver melhoria funcional, alteração técnica relevante ou risco real que justifique rollback.

| Situação | Conduta correta |
|---|---|
| Documento, relatório, plano, análise ou refinamento estratégico sem mudança no sistema | Entregar o arquivo ou resumo para validação, sem salvar checkpoint. |
| Mudança funcional no produto, UI, backend, banco, testes, integrações ou experiência do usuário | Validar, testar e então salvar checkpoint quando fizer sentido como marco técnico. |
| Ajuste técnico arriscado, migração, refatoração relevante ou etapa que precise de ponto de restauração | Salvar checkpoint após validação adequada. |
| Pedido explícito de Sidney para não salvar checkpoint | Não salvar checkpoint, salvo se houver risco crítico e Sidney autorizar. |

A interpretação prática é simples: **checkpoint versiona o sistema, não a existência de um documento**. Quando o trabalho for apenas intelectual ou documental, a memória do projeto deve ser atualizada em arquivo, e a entrega deve ser feita sem criar nova versão do aplicativo.
