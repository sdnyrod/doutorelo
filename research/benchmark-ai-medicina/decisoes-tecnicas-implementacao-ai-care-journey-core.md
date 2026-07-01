# Decisões técnicas de implementação — AI Care Journey Core

## Princípio de produto

O DOUTORELO será implementado como um **copiloto governado de jornada de saúde integrativa**, não como um chat médico genérico. A interface conversacional será apenas a camada visível de um núcleo controlado por jornada, segurança clínica, auditoria, memória longitudinal, RAG, avaliação contínua e humano no circuito.

## Decisões obrigatórias antes do código

| Área | Decisão | Implicação técnica |
|---|---|---|
| Modelo de IA | Não acoplar o produto a Claude, ChatGPT ou qualquer fornecedor único | Criar um gateway interno provider-agnostic antes de integrar provedores externos |
| Segurança clínica | Respostas devem passar por intake, red flags, escopo permitido, incerteza e fallback | Implementar regras determinísticas e retorno estruturado, não texto livre bruto |
| Auditoria | Toda execução de IA deve gerar rastros persistentes | Registrar sessão, turno, model run, safety event e feedback |
| UX | Mobile-first e guiada por jornada | Construir experiência de intake/chat com etapas, status de risco e próximos passos claros |
| RAG | O modelo não será fonte de verdade clínica | Preparar camadas para base versionada, citações e recuperação auditável |
| Evolução | Qualidade deve melhorar com dados e avaliação | Criar testes automatizados e estrutura para dataset de avaliação clínica |

## Sequência de implementação aprovada

A implementação deve começar pela estabilização do projeto, pois há um erro de build conhecido em `server/routers.ts`. Depois disso, a primeira entrega real será o núcleo auditável de IA: schema de banco, helpers de persistência, gateway de modelo, orquestrador clínico, rotas tRPC, UI mobile-first e testes.

## Critério de qualidade

Nenhuma resposta de IA deve ser tratada como produto final sem passar por validação de schema, guardrails de segurança, registro de auditoria e comunicação explícita de limites. O DOUTORELO deve educar, orientar e preparar o cuidado; ele não deve prometer diagnóstico, prescrição ou substituição profissional.
