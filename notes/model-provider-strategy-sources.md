# Referências para estratégia de provedor de IA

Consulta realizada em 2026-05-04 para embasar a explicação sobre por que o DOUTORELO não deve ficar amarrado diretamente a GPT/OpenAI ou Claude/Anthropic no núcleo arquitetural.

## NIST AI Risk Management Framework

Fonte: https://www.nist.gov/itl/ai-risk-management-framework

Pontos relevantes: o NIST descreve o AI RMF como um framework para gerir riscos associados a sistemas de IA, incorporando considerações de confiabilidade no desenho, desenvolvimento, uso e avaliação de produtos, serviços e sistemas de IA. A referência sustenta a decisão de tratar o modelo como componente governado por avaliação, medição e gestão de risco, não como identidade central do produto.

## OpenAI Data Controls

Fonte: https://developers.openai.com/api/docs/guides/your-data

Pontos relevantes: a OpenAI afirma que dados enviados à API não são usados para treinar ou melhorar modelos por padrão, salvo opt-in. Também informa retenção de logs de monitoramento de abuso por padrão por até 30 dias e existência de controles como Zero Data Retention/Modified Abuse Monitoring para clientes elegíveis, sujeitos a aprovação e requisitos adicionais. Isso mostra que OpenAI é uma opção séria, mas também que há contratos, elegibilidade e comportamento por endpoint a governar.

## Anthropic Commercial Data Training

Fonte: https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training

Pontos relevantes: a Anthropic afirma que, por padrão, não usa inputs/outputs de produtos comerciais como Anthropic API e Claude for Work para treinar modelos. Também informa que feedback explícito pode ser armazenado e usado, e que feedback pode reter a conversa relacionada por até cinco anos. Isso mostra que Claude também é uma opção séria, mas que feedback, retenção e privacidade precisam ser governados.
