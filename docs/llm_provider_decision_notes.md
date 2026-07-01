# Notas de pesquisa — decisão GPT vs Claude

## Fontes oficiais consultadas

1. OpenAI — Structured model outputs: https://developers.openai.com/api/docs/guides/structured-outputs
2. Anthropic — Claude API models overview: https://platform.claude.com/docs/en/about-claude/models/overview

## Achados relevantes

A documentação da OpenAI afirma que Structured Outputs garantem que o modelo gere respostas aderentes ao JSON Schema fornecido, com benefícios de type-safety, recusas programaticamente detectáveis e prompting mais simples. A OpenAI recomenda Structured Outputs em vez de JSON mode quando possível, e destaca uso por `response_format` e function calling para conectar modelos a ferramentas, dados e funções da aplicação.

A documentação da Anthropic lista Claude Opus 4.7, Claude Sonnet 4.6 e Claude Haiku 4.5. Claude Sonnet 4.6 é descrito como a melhor combinação de velocidade e inteligência, com preço de $3 por milhão de tokens de entrada e $15 por milhão de tokens de saída, latência rápida, contexto de 1 milhão de tokens, multilingual capabilities, vision e respostas engajantes/human-like. Claude Opus 4.7 é descrito como mais capaz para tarefas complexas, mas tem custo maior ($5/$25 por milhão de tokens) e latência moderada.

## Implicação preliminar

Para o produto Saúde Integrativa IA, cujo valor depende de conversa humana, contexto Dayan amplo, português natural, RAG e continuidade conversacional, Claude Sonnet 4.6 aparece como melhor candidato a motor principal. GPT mantém vantagem técnica quando o requisito dominante é aderência rígida a JSON Schema e orquestração determinística de tools; por isso deve ser considerado como provedor secundário ou rota específica para classificação/validação estruturada caso a integração direta seja usada.

## Complemento de pesquisa

A documentação da Anthropic sobre Structured Outputs afirma que Claude agora oferece duas funções complementares: JSON outputs via `output_config.format` e strict tool use via `strict: true`. A página afirma que essas funções podem ser usadas de forma independente ou conjunta, e que structured outputs estão disponíveis para Claude Opus 4.7, Claude Opus 4.6, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Opus 4.5 e Claude Haiku 4.5. A promessa declarada é valid JSON, type safety e menor necessidade de retries por violação de schema.

A documentação de modelos da OpenAI apresenta a linha GPT-5.x, com gpt-5.5 como modelo flagship para raciocínio complexo e coding, e variantes menores como gpt-5.4-mini e gpt-5.4-nano para custo/latência. A página também indica suporte geral a entrada de texto/imagem, saída de texto, multilingual capabilities e vision nos modelos mais recentes.

## Implicação atualizada

A vantagem exclusiva de GPT em JSON estruturado diminuiu porque Claude também oferece structured outputs e strict tool use nos modelos atuais. O GPT continua muito forte para contratos rígidos e orquestração programática, mas a decisão principal do chat deve privilegiar experiência conversacional, manutenção de contexto longo, português natural, aderência ao corpus Dayan e qualidade humana da resposta. Nesses critérios, Claude Sonnet 4.6 continua sendo o candidato mais coerente como motor principal, com GPT como alternativa técnica para módulos específicos se necessário.
