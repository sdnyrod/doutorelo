# Auditoria de acesso do vídeo 121

Vídeo: `121_c7swyVubuHM` — **Projeto Renovação: [Gravação]: Resumo de Todas as Aulas**.

URL: https://www.youtube.com/watch?v=c7swyVubuHM

Duração registrada no manifesto: **2:30:18**.

## Evidências coletadas

A página pública do YouTube foi aberta em 2026-05-02 durante a auditoria. O vídeo aparece com título, canal **Dayan Siebra**, cerca de **10 mil visualizações**, descrição promocional e comentários públicos. No entanto, o player exibe a restrição: **“Sign in to confirm you’re not a bot. This helps protect our community.”**.

As tentativas automatizadas de reparo tiveram o seguinte resultado:

| Rota | Resultado | Observação |
|---|---|---|
| Reprocessamento multimodal com `manus-analyze-video` | Falhou | Erro de argumento inválido/LLM router após submissão do vídeo longo. |
| Extração via `youtube_transcript_api` | Falhou | YouTube bloqueou a recuperação de transcrição a partir do ambiente de nuvem. |
| Extração via `yt-dlp` sem baixar o vídeo | Falhou | YouTube exigiu login/anti-bot para confirmar que não é robô. |
| Busca web por ID/título | Sem transcrição útil encontrada | Resultado indexado principal foi a própria página do YouTube. |

## Decisão de auditoria

Este item deve permanecer marcado como **indisponível após reparo**, sem geração de conteúdo clínico inferido. A consolidação temática deve usar os **249 vídeos com análise profunda válida** e manter o vídeo 121 como lacuna rastreável, para eventual reprocessamento manual ou com cookies/login autorizados pelo usuário no futuro.
