# Análise de riscos: localização e busca de profissionais

## Análise de Riscos e Casos de Borda

O risco central identificado é arquitetural: o fluxo runtime do chat contém uma lista fixa de municípios para extrair localização da mensagem. Isso transforma dados operacionais em regra de código, impede escala nacional e cria divergência entre a fonte de verdade real, que deve ser a base de profissionais, e a interpretação do chat. Em um sistema de missão crítica, esse padrão é inaceitável porque cada novo município exigiria alteração de código, teste específico e redeploy, aumentando a probabilidade de regressão.

| Área | Risco identificado | Impacto | Estratégia correta |
|---|---|---|---|
| Extração de localização | Lista fixa no roteador com municípios específicos. | Usuários de municípios fora da lista não são reconhecidos corretamente. | Extrair `city` e `state` por padrão linguístico genérico e/ou campo explícito, nunca por catálogo hardcoded no roteador. |
| Fonte de verdade | Runtime sabe cidades que deveriam estar apenas na base de profissionais. | Código e banco podem divergir. | Usar banco/base de profissionais como única fonte de cobertura. |
| Fallback de cidade | Se não houver match local, ranking pode cair para estado ou base total. | O sistema pode sugerir outra cidade como se fosse resposta local. | Quando a cidade foi explicitamente solicitada, só retornar profissionais daquela cidade/UF; se vazio, responder ausência local honestamente. |
| Testes | Testes com nomes de cidades podem mascarar exceções manuais. | Falsa confiança de cobertura nacional. | Testes devem provar invariantes gerais: entrada dinâmica, filtro por base, ausência honesta e proibição de hardcoding no runtime. |
| Observabilidade | Falhas de extração podem ser silenciosas. | Produto aparenta funcionar, mas responde com resultados errados. | Manter razões de match e estados explícitos de ausência/necessidade de localização. |

O caso de borda mais importante é o usuário escrever uma cidade válida que exista no banco, mas sem enviar `city` e `state` como campos separados. O sistema precisa transformar a mensagem em variáveis de localização de modo genérico. Outro caso crítico é o usuário escrever uma cidade que não existe na base; nesse cenário o comportamento correto não é inventar proximidade, mas informar que não encontrou profissional local na base disponível.

## Decisões de Arquitetura

A correção deve remover nomes de cidades do runtime crítico. O roteador não deve conhecer municípios específicos. A mensagem do usuário pode alimentar uma extração genérica por padrões textuais, por exemplo expressões como `em <cidade>-<UF>`, `em <cidade>, <UF>`, `cidade de <cidade>, <UF>` ou `na cidade de <cidade> <UF>`. Quando o front-end enviar `city` e `state` explicitamente, esses campos têm precedência sobre a inferência textual.

A busca de profissionais deve receber apenas variáveis: `city`, `state`, `lat`, `lng` e `need`. A função de ranking deve ter uma política explícita: se `city` foi informada, o conjunto candidato deve ser restrito a essa cidade e UF quando a UF existir; se não houver resultados, retornar lista vazia. Se apenas `state` foi informado, pode ranquear dentro do estado. Se só coordenadas foram informadas, pode ranquear por distância. Se nada foi informado e não há intenção de proximidade explícita, pode usar a base geral de forma educativa, sem afirmar proximidade.
