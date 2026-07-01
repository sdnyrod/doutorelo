# Reconstrução do Motor de IA do Chat — Padrões Aproveitados do Crew CWM

Este documento registra a decisão técnica de reconstruir o motor conversacional do chat público a partir de uma arquitetura limpa, inspirada nos padrões de engenharia de IA que deram certo no Crew CWM. O Crew permanece apenas como referência metodológica; nenhuma regra de construção civil deve ser copiada para o domínio de saúde integrativa.

| Padrão do Crew CWM | Adaptação para o chat de saúde integrativa |
|---|---|
| Princípios de design documentados no início do módulo | Cada módulo do novo motor deve declarar seus princípios: não diagnosticar, não prescrever, não expor bastidores, validar antes de responder e acionar fallback seguro quando necessário. |
| Wrapper LLM com temperatura 0, retry e parsing seguro | Toda chamada LLM do chat deve passar por um wrapper único, com saída estruturada, tentativas controladas e fallback se o JSON vier inválido. |
| Regras determinísticas antes do LLM | Intenção, urgência, prescrição, pedido de diagnóstico e mensagens sociais devem ser classificados por regras antes da geração. |
| Roteamento pré-LLM por decision tree | O motor deve decidir o modo de resposta antes do prompt: saudação, sintoma, hábito, exame, urgência, prescrição, pergunta geral, continuidade ou fallback. |
| Interceptor pós-LLM | A resposta gerada precisa ser bloqueada ou corrigida se contiver diagnóstico fechado, prescrição, bastidores, excesso de perguntas ou fuga do tema. |
| Detecção determinística de alucinação | O sistema deve pontuar sinais como estudos inventados, percentuais específicos sem fonte, listas de medicamentos, promessas clínicas e autoridades falsas. |
| Validação por contrato de domínio | A resposta só pode ser entregue se passar por regras explícitas de segurança, utilidade, idioma, foco temático e formato. |
| Regeneração controlada | Se a primeira resposta falhar na validação, regenerar uma vez com prompt mais restritivo; se falhar de novo, usar fallback determinístico. |
| JSON schema strict | A geração do LLM deve retornar uma estrutura previsível, com campos obrigatórios e sem propriedades extras. |
| Contexto dinâmico | O prompt deve considerar perfil e contexto recente quando disponíveis, mas sem depender disso para ser seguro. |
| Testes baseados em bugs reais | A suíte deve conter casos de saudação, sintoma comum, urgência, pedido de remédio, diagnóstico direto, usuário irritado, continuidade vaga, exames, bastidores e alucinação. |

A ordem de execução será: primeiro criar a suíte de aceitação, depois definir o contrato TypeScript, depois implementar os módulos do pipeline e, por fim, conectar o novo motor ao endpoint público do chat. A implementação antiga deve deixar de ser usada pelo chat.
