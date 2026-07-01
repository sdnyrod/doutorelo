# Comparativo Técnico Final — Antes e Depois da Fase 1 de Hardening do DoutorElo

**Projeto:** DoutorElo — Saúde Integrativa IA DEV  
**Checkpoint funcional da Fase 1:** `ec61209a`  
**Escopo:** comparar o estado anterior e posterior da Fase 1, explicitando riscos mitigados, ganho real de robustez e limites remanescentes.  
**Governança:** este documento não inicia nova refatoração. A próxima fase permanece condicionada à autorização explícita de Sidney.

## 1. Riscos mitigados antes da leitura de código

A Fase 1 tratou riscos de núcleo, especialmente aqueles que aparecem sob concorrência, instabilidade externa e operação real. O foco foi proteger marketplace, banco, IA e regressões automatizadas antes de avançar para temas mais amplos, como observabilidade completa, filas, circuit breaker e particionamento.

| Risco crítico | Antes da Fase 1 | Depois da Fase 1 | Resultado esperado |
|---|---|---|---|
| **Overselling** | Dois checkouts simultâneos podiam disputar a última unidade sem bloqueio suficiente. | Checkout transacional com `FOR UPDATE` e decremento atômico de estoque. | Apenas uma compra deve vencer a última unidade. |
| **Carrinho ativo duplicado** | Corridas em múltiplas abas ou cliques podiam criar mais de um carrinho ativo. | `activeCartKey` e índice único em `marketplaceCarts`. | Um usuário converge para um único carrinho ativo. |
| **Pedido duplicado por retry** | Timeout, duplo clique ou reenvio podiam gerar novo pedido. | `idempotencyKey` e índice único por usuário em `marketplaceOrders`. | Repetições da mesma tentativa retornam o mesmo pedido quando aplicável. |
| **Worker preso por LLM** | Chamada externa podia ficar pendurada sem timeout uniforme. | `AbortController`, timeout nomeado e limpeza em `finally`. | Latência externa vira erro controlado, não bloqueio indefinido. |
| **Fallback mascarando falha de banco** | Seed de desenvolvimento podia esconder indisponibilidade real. | Separação explícita entre DEV e PROD. | Produção passa a falhar de modo mais honesto e auditável. |
| **Vazamento de conexões** | O ciclo de vida do pool estava menos explícito. | Pool `mysql2` com encerramento gracioso no bootstrap. | Menor risco de conexões órfãs em restart/deploy. |
| **Regressão invisível** | Testes não atacavam suficientemente corrida concorrente no marketplace. | Sete testes de hardening e contratos de fonte. | Falhas críticas ficam detectáveis antes de release. |

## 2. Sumário executivo

Antes da Fase 1, o DoutorElo já era uma aplicação funcional, com React 19, Tailwind 4, Express 4, tRPC 11, Drizzle ORM, MySQL/TiDB, autenticação, marketplace, triagem com IA, perfis profissionais e backoffice. A arquitetura tinha separação de camadas e boa base para evolução. O problema não era ausência de produto; era ausência de garantias suficientes nos pontos onde produção real costuma falhar: concorrência, idempotência, timeout externo e fallback operacional.

Depois da Fase 1, o sistema passou a ter contratos persistentes e verificáveis para os pontos de maior risco. Carrinho ativo e idempotência de pedido agora são reforçados pelo banco; checkout e estoque são protegidos por transação; chamadas LLM possuem timeout uniforme; fallback de profissionais respeita ambiente; e os testes cobrem corridas críticas. O uso de transações é a abordagem apropriada para executar múltiplas operações dependentes como uma unidade lógica com commit ou rollback, conforme documentado pelo Drizzle ORM.[1]

| Camada | Antes | Depois | Ganho real |
|---|---|---|---|
| Banco/conexão | Menor controle explícito de pool e shutdown. | Pool `mysql2` explícito e encerramento gracioso. | Mais previsibilidade operacional. |
| Carrinho | Regra de carrinho ativo dependia mais da aplicação. | Chave única estrutural para carrinho ativo. | Menos duplicidade sob corrida. |
| Checkout | Fluxo funcional, mas vulnerável a interleavings. | Transação ACID com locks e reconsulta idempotente. | Integridade maior em concorrência. |
| Estoque | Disputa pela última unidade era risco crítico. | Bloqueio e decremento atômico. | Redução forte de overselling. |
| IA | Timeout não estava uniformizado entre helper e rota direta. | Abort controlado nos dois caminhos. | Menor risco de saturação por provedor externo. |
| Profissionais | Fallback poderia confundir ambiente de teste e produção. | Fallback DEV/PROD explícito. | Falha real fica mais detectável. |
| Testes | Cobertura menos direcionada a corrida real. | Testes concorrenciais e contratos estáticos. | Regressões críticas ficam auditáveis. |

## 3. Como o sistema estava antes

O sistema anterior já tinha uma organização técnica coerente: schema em `drizzle/schema.ts`, acesso a dados em `server/db.ts`, contracts tRPC em `server/routers.ts`, helper de IA em `server/_core/llm.ts` e testes Vitest. Essa base permitia evoluir sem uma reescrita ampla. A vulnerabilidade estava nos caminhos críticos, que ainda dependiam demais do fluxo feliz e não impunham todas as regras de integridade no banco.

No marketplace, a sequência “localizar carrinho, inserir item, gerar pedido, reduzir estoque e finalizar” parecia correta em teste manual linear. Porém, em alta concorrência, duas requisições podem ler o mesmo estado antes de qualquer escrita consolidada. Sem chave única para carrinho ativo, sem chave idempotente de checkout e sem bloqueio transacional nas linhas de carrinho, pedido e inventário, o sistema ficava exposto a pedidos duplicados, estoque inconsistente e carrinhos divergentes.

Na IA, o risco era operacional. Uma chamada externa sem timeout uniforme pode consumir worker por tempo excessivo. Em produto com chat público, isso é especialmente sensível, porque latência do provedor, lentidão de rede e picos de uso acontecem no caminho mais visível ao usuário. Sem abort controlado, a aplicação pode degradar mesmo quando a regra de negócio está correta.

No fallback de profissionais, o risco era de confiabilidade. Dados de seed ajudam em DEV, mas em produção podem esconder uma indisponibilidade real do banco. Em sistema crítico, falha real deve aparecer como falha real, não como resposta artificialmente preenchida.

## 4. Como o sistema ficou depois

A Fase 1 transformou regras críticas em contratos explícitos. A integridade do carrinho passou a depender de `activeCartKey` com índice único. A idempotência do pedido passou a depender de `idempotencyKey` com índice único por usuário. O checkout passou a operar em transação e a bloquear linhas relevantes com `FOR UPDATE`. A camada LLM passou a abortar chamadas demoradas. O pool MySQL passou a ter ciclo de vida mais claro. Os testes passaram a validar cenários que antes dependeriam de teste manual ou sorte.

A migração `drizzle/0008_curved_pandemic.sql` também foi desenhada de forma aditiva. Ela adiciona colunas, saneia carrinhos ativos legados e só depois cria constraints. Essa ordem é importante porque reduz o risco de quebrar a migração por dados históricos inconsistentes. O uso de pool de conexão é uma prática esperada em aplicações Node.js com MySQL, pois permite reutilização e controle de conexões em vez de abrir uma conexão nova por operação.[2]

| Arquivo | Mudança principal | Valor arquitetural |
|---|---|---|
| `server/db.ts` | Pool explícito, fallback DEV/PROD, carrinho ativo idempotente e checkout transacional. | Centraliza a robustez do caminho de dados. |
| `drizzle/schema.ts` | `activeCartKey`, `idempotencyKey` e índices únicos. | Move integridade crítica para o banco. |
| `drizzle/0008_curved_pandemic.sql` | Migração aditiva com saneamento pré-constraint. | Reduz risco sobre dados legados. |
| `server/_core/llm.ts` | Timeout uniforme com `AbortController`. | Evita espera indefinida em provedor externo. |
| `server/routers.ts` | Idempotência no contrato de checkout e timeout Anthropic direto. | Remove divergência entre helper e rota direta. |
| `server/_core/index.ts` | Encerramento gracioso do pool. | Melhora comportamento em ciclo de vida do servidor. |
| `server/marketplace.hardening.test.ts` | Testes concorrenciais e contratos de fonte. | Torna regressões críticas verificáveis. |

## 5. Ganho técnico por domínio

### 5.1 Banco e pool explícito

Antes, o banco funcionava para desenvolvimento e fluxo comum, mas havia menos controle explícito sobre política de pool, limites e shutdown. Isso pode não aparecer em baixa carga, mas importa em restart, deploy e aumento de tráfego. Depois, a aplicação passou a usar pool `mysql2` explícito e fechamento gracioso, reduzindo risco de conexões órfãs e tornando a operação mais auditável.

| Critério | Antes | Depois |
|---|---|---|
| Reutilização de conexão | Menos explícita no código auditado. | Pool configurado e centralizado. |
| Shutdown | Menos acoplado ao bootstrap. | Fechamento gracioso integrado ao servidor. |
| Diagnóstico | Mais dependente de sintomas externos. | Contrato de pool visível em código. |

### 5.2 Carrinho ativo idempotente

Antes, a aplicação tentava manter um carrinho ativo por usuário, mas o banco não impunha essa regra com uma chave única própria. Depois, `activeCartKey` tornou a regra estrutural. A aplicação calcula e usa a chave; o banco impede duplicidade. Esse é um ganho importante porque regras críticas não devem depender apenas da ordem ideal das requisições.

| Cenário | Antes | Depois |
|---|---|---|
| Duplo clique em adicionar item | Possível duplicidade de carrinho ativo. | Convergência para carrinho ativo único. |
| Abas simultâneas | Estado podia divergir. | Constraint reduz divergência. |
| Dados legados | Duplicidades poderiam persistir. | Migração preserva um ativo e abandona excedentes. |

### 5.3 Checkout transacional e estoque

Antes, o checkout podia sofrer com o padrão mais perigoso de marketplace: dois usuários disputando a última unidade. Depois, o fluxo bloqueia as linhas relevantes com `FOR UPDATE`, revalida estado e decrementa estoque dentro da transação. Se uma etapa falhar, a transação pode ser revertida, preservando consistência.

| Aspecto | Antes | Depois | Efeito |
|---|---|---|---|
| Última unidade | Corrida possível. | Linha de inventário bloqueada. | Reduz overselling. |
| Pedido parcial | Risco de estado intermediário. | Operação transacional. | Commit ou rollback coerente. |
| Reexecução | Podia gerar nova ordem. | Reconsulta idempotente. | Retry mais seguro. |

### 5.4 Idempotência de pedido

Antes, o backend não distinguia com força suficiente uma nova compra de uma repetição da mesma tentativa. Depois, `idempotencyKey` permite reconhecer retries e retornar o pedido já criado. Isso protege contra timeout do frontend, duplo clique, reload e reenvio automático.

| Evento | Antes | Depois |
|---|---|---|
| Timeout no frontend | Usuário podia tentar de novo e duplicar pedido. | Retry com mesma chave retorna pedido existente. |
| Duplo clique | Poderia disparar efeitos colaterais duplicados. | Constraint e reconsulta reduzem duplicidade. |
| Checkouts paralelos | Resultado incerto. | Teste valida mesmo pedido para mesma chave. |

### 5.5 Timeout uniforme de LLM

Antes, a resiliência da IA não estava uniformizada entre helper central e chamada direta. Depois, os dois caminhos usam `AbortController`, timeout nomeado e limpeza do timer em `finally`. O ganho é operacional: provedor externo lento deixa de prender indefinidamente o servidor.

| Componente | Antes | Depois |
|---|---|---|
| Helper central | Timeout não suficientemente uniformizado. | Timeout padronizado com erro controlado. |
| Rota direta Anthropic | Podia divergir do helper. | Mesmo padrão de abort. |
| Timer | Risco de limpeza inconsistente. | `clearTimeout` em `finally`. |

### 5.6 Fallback DEV/PROD de profissionais

Antes, fallback de seed podia ajudar em demonstração, mas também podia mascarar incidente real. Depois, desenvolvimento mantém flexibilidade e produção ganha fidelidade operacional. Essa mudança evita que indisponibilidade de banco seja confundida com dado real disponível.

| Ambiente | Antes | Depois |
|---|---|---|
| DEV | Seed útil para fluxo visual. | Seed permitido de forma explícita. |
| PROD | Risco de mascaramento. | Falha real tende a emergir. |
| Auditoria | Fonte podia ficar ambígua. | Comportamento por ambiente fica rastreável. |

## 6. Testes e validações

A Fase 1 adicionou `server/marketplace.hardening.test.ts` com sete testes focados nos contratos críticos. A suíte cobre carrinho ativo sob concorrência, checkout paralelo com mesma chave, overselling na última unidade, constraints de schema, transação com `FOR UPDATE`, pool/fallback e timeout LLM.

| Validação | Resultado registrado | Interpretação |
|---|---|---|
| `pnpm check` | Sucesso | TypeScript aceitou o estado final. |
| `pnpm test` | Sucesso | Suíte automatizada passou. |
| `pnpm build` | Sucesso | Build do projeto foi concluído. |
| Testes de hardening | 7/7 aprovados | Contratos críticos foram validados. |
| Checkpoint funcional | `ec61209a` | Estado técnico da Fase 1 congelado. |

## 7. Código completo entregue

Não há novo código a aplicar nesta resposta. O código completo, pronto e sem placeholders, está versionado no checkpoint `ec61209a`. Este documento apenas registra e compara a mudança já implementada.

| Categoria | Arquivos completos versionados |
|---|---|
| Banco e regras críticas | `server/db.ts` |
| Schema e migração | `drizzle/schema.ts`, `drizzle/0008_curved_pandemic.sql`, `drizzle/meta/0008_snapshot.json`, `drizzle/meta/_journal.json` |
| LLM e ambiente | `server/_core/llm.ts`, `server/_core/env.ts` |
| Bootstrap | `server/_core/index.ts` |
| Router | `server/routers.ts` |
| Testes | `server/marketplace.hardening.test.ts`, `server/homeChat.test.ts`, `server/professionalLocation.test.ts` |
| Documentação | `docs/auditoria-arquitetural-doutorelo-pre-refatoracao.md`, `docs/location-professional-search-architecture.md`, `docs/location-professional-search-risk-analysis.md` |
| Ajuste pontual de UI | `client/src/pages/Home.tsx` |

## 8. Limites remanescentes

A Fase 1 não encerra a arquitetura hiperescala. Ela endurece o núcleo mais perigoso para que fases posteriores façam sentido. Ainda permanecem itens de alta importância que devem ser analisados e aprovados separadamente antes de qualquer recodificação.

| Tema remanescente | Por que ficou para fase posterior | Prioridade sugerida |
|---|---|---|
| Índices globais em chat, ML, RAG e corpus | Exige análise de consultas reais, cardinalidade e volume. | Alta |
| Observabilidade estruturada | Requer desenho de logs, correlação, métricas e retenção. | Alta |
| Rate limiting e anti-abuso | Afeta chat público, autenticação, marketplace e custo de IA. | Alta |
| Circuit breaker externo | Complementa timeout, mas exige política de degradação. | Média/Alta |
| Filas assíncronas | Necessárias para workloads pesados e notificações. | Média/Alta |
| Auditoria completa de permissões por role | Exige revisão de todos os procedimentos e telas. | Média/Alta |
| Particionamento/sharding | Deve ser decidido com métricas reais de volume e acesso. | Média |

## 9. Conclusão

Antes da Fase 1, o DoutorElo estava funcional, mas carregava riscos típicos de sistemas que ainda não enfrentaram concorrência real: carrinho duplicado, checkout não idempotente, possível overselling, chamadas externas penduradas e fallback capaz de esconder falha de banco. Depois da Fase 1, esses pontos passaram a ter mecanismos explícitos de defesa: constraints, transações, locks, idempotência, pool controlado, timeout uniforme, fallback por ambiente e testes concorrenciais.

O ganho real é que a plataforma ficou menos dependente do fluxo feliz e mais resistente a comportamento de produção: retries, abas múltiplas, usuários simultâneos, latência externa, restart de servidor e falha de banco. Ainda há fases importantes, mas a base crítica de marketplace, conexão e IA ficou materialmente mais robusta.

## Referências

[1]: https://orm.drizzle.team/docs/transactions "Drizzle ORM Documentation — Transactions"  
[2]: https://sidorares.github.io/node-mysql2/docs "mysql2 Documentation — Node MySQL 2"
