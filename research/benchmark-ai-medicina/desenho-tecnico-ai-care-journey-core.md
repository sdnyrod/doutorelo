# Desenho técnico do AI Care Journey Core do DOUTORELO

## Princípio de implementação

A implementação deve transformar o DOUTORELO de um chat isolado em um **copiloto de jornada de saúde governado**. O núcleo não deve depender de um provedor específico de IA; deve registrar cada decisão clínica assistiva, cada execução de modelo, cada bloqueio de segurança e cada resumo longitudinal relevante. O objetivo é criar uma base que permita trocar ou comparar modelos no futuro sem alterar a experiência clínica nem comprometer auditoria.

## Contratos centrais

| Contrato | Decisão técnica | Critério verificável |
|---|---|---|
| Sessão governada | Toda conversa clínica assistiva deve ter uma sessão persistida com status, consentimentos, severidade, confiança, versão de política e estado de escalonamento humano. | Deve existir procedimento autenticado para criar/continuar sessão e retornar metadados de governança. |
| Execução de modelo | Toda tentativa de LLM deve ser representada como execução auditável, ainda que tenha fallback determinístico. | Deve haver helper que registre provedor lógico, prompt, schema, status, latência, violações e se houve fallback. |
| Segurança clínica | Red flags, pedidos de prescrição e baixa confiança devem bloquear ou limitar a IA antes da geração livre. | Testes devem provar que urgência e prescrição não invocam LLM nem persistem resposta indevida. |
| Memória longitudinal | A sessão deve alimentar memória clínica apenas com dados seguros, resumidos e sem prescrição. | O backend deve salvar eventos com metadados de política e sem depender de texto bruto irrestrito para auditoria. |
| Gateway de modelos | O código de produto deve chamar uma interface interna, não diretamente um provedor externo. | Deve existir módulo de gateway com provedor inicial interno e estrutura preparada para OpenAI/Claude futuramente. |
| Transparência ao usuário | A UI deve explicar que a resposta é educativa, limitada, auditada e com humano no circuito quando necessário. | A página deve exibir badges de severidade, confiança, política, fallback e próximo passo seguro. |

## Escopo de implementação inicial

A primeira entrega de código deve priorizar o backend e a experiência mínima confiável, sem tentar resolver telemedicina, marketplace, exames ou integrações externas neste ciclo. O escopo adequado é: criar o **Model Gateway**, criar persistência auditável para sessões e execuções, expor um procedimento de jornada governada, reaproveitar os guardrails existentes, adicionar testes de contrato e conectar uma tela mobile-first simples ao fluxo.

## Sequência segura de codificação

1. Corrigir qualquer erro estrutural existente que impeça testes ou TypeScript.
2. Adicionar schema auditável mínimo e tipos exportados.
3. Criar helpers de persistência e gateway sem alterar fluxos antigos.
4. Criar procedimento protegido `careJourney` usando guardrails existentes.
5. Adicionar testes antes de refinar a UI.
6. Implementar tela de chat governado com estados claros.
7. Rodar testes, checagem TypeScript e status do ambiente antes do checkpoint.

## Decisão sobre Claude e ChatGPT

A implementação inicial **não deve acoplar** DOUTORELO a Claude ou ChatGPT. O produto deve nascer com uma camada `Model Gateway`, usando o provedor server-side atual como motor inicial, mas já registrando `logicalProvider`, `modelCapability`, `promptId`, `schemaName` e `fallbackReason`. Isso permite, em fase posterior, fazer avaliação clínica A/B entre ChatGPT, Claude e outros modelos sem reescrever a jornada.
