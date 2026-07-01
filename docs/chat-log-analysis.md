# Análise dos logs DEV do chat público

Autor: **Manus AI**

## Escopo

Esta nota registra a inspeção dos logs disponíveis em `.manus-logs/` durante a recalibragem do chat público do DOUTORELO. O objetivo era localizar respostas públicas reais do chat DEV que pudessem ser convertidas em regressões automatizadas.

## Logs inspecionados

| Arquivo | Conteúdo observado | Achado relevante |
|---|---|---|
| `.manus-logs/networkRequests.log` | Requisições HTTP recentes, principalmente autenticação e dashboard | Não havia chamadas `homeChat.send` preservadas no trecho disponível. |
| `.manus-logs/browserConsole.log` | Logs e erros de console do navegador | Não havia payloads de resposta pública do chat contendo termos como `Dayan`, `corpus`, `agente`, `maestro`, `orquestra`, `LLM`, `guardrail` ou `schema`. |
| `.manus-logs/devserver.log` | Reinícios do servidor e alterações de arquivos | Mostrou apenas reinícios associados a alterações no motor anterior, sem respostas públicas do paciente. |
| `.manus-logs/sessionReplay.log` | Eventos de sessão | Não trouxe conteúdo textual suficiente para reconstruir respostas clínicas completas. |

## Conclusão

O histórico completo disponível nesta sessão **não contém respostas públicas reais do chat suficientes para criar regressões diretamente a partir de logs**. Portanto, as regressões foram derivadas dos casos reais relatados durante a validação manual anterior, especialmente vazamento de bastidores, resposta genérica sobre insônia, dor de cabeça matinal e má digestão/refluxo.

## Decisão prática

Como os logs não preservavam payloads úteis do chat, a estratégia adotada foi fortalecer os testes por classes de falha observadas: **vazamento de bastidores**, **resposta longa/artificial**, **recomeço de anamnese**, **fallback genérico**, **diagnóstico fechado**, **dose/prescrição** e **advertência automática em caso verde**.
