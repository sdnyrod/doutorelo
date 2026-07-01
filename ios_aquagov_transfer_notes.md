# Síntese de transferência — Relatório AquaGov para DoutoElo iOS

O relatório AquaGov recomenda uma estratégia iOS nativa, SwiftUI-first, com uso disciplinado de Liquid Glass, arquitetura modular, persistência offline-first, segurança como requisito de produto, inteligência local progressiva e integração seletiva com APIs Apple. Para o DoutoElo, a metáfora de produto muda de “centro operacional GIS” para “centro pessoal de cuidado integrativo”, mas a tese principal permanece: o app nativo deve ser mais do que uma webview, aproveitando recursos Apple para gerar percepção premium, confiança, fluidez, acessibilidade e segurança.

| Recomendação do AquaGov | Transferência para DoutoElo iOS | Adaptação necessária |
| --- | --- | --- |
| App iOS nativo SwiftUI-first | Adotar SwiftUI como camada principal do app DoutoElo | Substituir GIS-first por care journey-first, com chat, plano, histórico e rede de cuidado. |
| Liquid Glass moderado | Usar materiais nativos em navegação, composer do chat, cards e bottom sheets | Evitar excesso de transparência em textos clínicos e recomendações de saúde. |
| Offline-first com SwiftData | Persistir sessão, rascunhos, plano, consentimentos locais e cache de conteúdo | Dados sensíveis exigem criptografia, minimização e sincronização auditável. |
| IA local + backend | Usar Vision/Core ML/Foundation Models quando disponíveis e LLM backend para RAG/maestro | IA local deve apoiar captura, resumo e pré-processamento; decisão final passa por governança. |
| HealthKit com cautela | HealthKit é mais aplicável ao DoutoElo do que ao AquaGov, mas deve ser opt-in granular | Começar com leitura mínima e consentida de métricas relevantes, sem marketing ou compartilhamento indevido. |
| App Intents, Widgets e Live Activities | Criar presença fora do app para lembretes, check-ins, plano diário e continuidade de cuidado | Não expor informação sensível na Lock Screen sem controle explícito do usuário. |
| Segurança corporativa | Usar Keychain, passkeys, App Attest, DeviceCheck, Privacy Manifest e auditoria | Saúde exige padrão mais rigoroso que campo operacional: LGPD, consentimento e privacidade por design. |
| Distribuição por TestFlight e fases | Usar TestFlight para piloto clínico/produto e App Store quando houver maturidade | A distribuição deve considerar revisão de políticas de saúde da App Store e escopo regulatório. |

A conclusão técnica é que o DoutoElo iOS deve seguir quase todas as recomendações estruturais do AquaGov, mas com inversão de prioridade. No AquaGov, o protagonista é o mapa operacional; no DoutoElo, o protagonista deve ser a jornada conversacional de cuidado, enriquecida por histórico longitudinal, check-ins, anexos clínicos, HealthKit opt-in, notificações sensíveis, widgets discretos e uma experiência visual nativa Apple de alta confiança.
