# Notas de auditoria interna — Saúde Integrativa IA

## Leitura crítica do estado atual

A aplicação atual tem uma base funcional válida para um MVP: PWA mobile-first, consentimento LGPD antes da triagem, triagem por IA com `invokeLLM` server-side e JSON Schema estrito, fallback determinístico, separação entre orientação educativa e marketplace comercial, médicos estáticos, conteúdo oficial e backoffice protegido. O estado técnico está coerente com uma primeira entrega navegável, mas a percepção visual e a profundidade de experiência ainda não alcançam o patamar de produto de referência mundial.

O layout atual é limpo, seguro e minimamente premium, mas depende demais de um repertório visual comum: cards translúcidos, gradiente suave, verde/teal médico, navegação inferior padrão e hero textual. A experiência comunica segurança, mas ainda não comunica inevitabilidade, sofisticação, autoridade clínica, tecnologia proprietária ou ecossistema completo. A crítica do usuário procede: para a ambição declarada, o design ainda parece mais um bom protótipo de startup do que uma plataforma de saúde integrativa e IA com percepção de liderança.

## Pontos fortes existentes

| Área | O que já está funcionando | Valor estratégico |
|---|---|---|
| Segurança clínica | Guardrails determinísticos, red flags, recusa de prescrição, incerteza explícita e fallback humano | Dá base para confiança e reduz risco de alucinação clínica |
| LLM estruturado | `invokeLLM` com `response_format` em JSON Schema, validação e pós-guardrails | Cria contrato verificável em vez de texto livre sem controle |
| LGPD | Consentimento obrigatório antes de dados sensíveis | Alinha produto a uma narrativa de privacidade por design |
| IA como copiloto | Copy evita diagnóstico e prescrição | Posicionamento mais seguro que “médico IA” |
| Marketplace | Avisos comerciais separam compra de conduta clínica | Reduz confusão regulatória e ética |
| Mobile-first | Navegação inferior e zona de polegar | Compatível com aquisição via redes sociais |

## Lacunas críticas

| Dimensão | Lacuna | Impacto percebido |
|---|---|---|
| UI/UX | Visual ainda básico, pouco memorável, sem storytelling visual, sem cenas, sem identidade proprietária | Baixa diferenciação; pode parecer template adaptado |
| Produto | Fluxos de médicos, conteúdo, consulta e loja são majoritariamente estáticos | A experiência não prova ainda a promessa de ecossistema vivo |
| IA | LLM está seguro, mas não há memória longitudinal, personalização, avaliação contínua real, RAG, timeline clínica ou explicabilidade rica | A IA parece uma triagem, não um “sistema inteligente de cuidado” |
| ML/MLOps | Há fundação declarativa, mas sem métricas persistentes, datasets reais anonimizados, painel de avaliação, A/B de prompts ou monitoramento | Governança ainda é intenção arquitetural, não operação madura |
| Backoffice | Módulos administrativos são vitrines, não workflows | A operação da empresa ainda não está instrumentada |
| Marca | Nome e visual comunicam saúde genérica; falta território emocional e sensorial exclusivo | Menor potencial de desejo, confiança premium e lembrança |
| Percepção pública | Não há prova social, credenciais reais, protocolo clínico, conselho médico, selos, histórias ou evidências | Falta autoridade para um mercado sensível |

## Hipótese de direção

A próxima versão precisa deixar de parecer uma landing funcional com módulos e passar a parecer um **sistema operacional de cuidado integrativo assistido por IA**, com três camadas visíveis ao usuário: acolhimento emocional, inteligência clínica governada e continuidade de jornada. O redesign deve combinar estética premium de saúde, confiança regulatória, microinterações de IA, personalização por contexto e sinais constantes de que há profissionais humanos e governança por trás da automação.
