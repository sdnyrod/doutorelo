# Notas de pesquisa — API keys Claude e OpenAI

## Anthropic / Claude

Fonte oficial consultada: https://platform.claude.com/docs/en/get-started

Achados principais: a documentação oficial informa que os pré-requisitos são uma conta no Anthropic Console e uma API key. O passo oficial recomenda obter a API key no Claude Console e configurá-la como variável de ambiente com `export ANTHROPIC_API_KEY='your-api-key-here'`. A própria página também orienta persistir a chave no perfil do shell, como `~/.zshrc` ou `~/.bashrc`, quando necessário.

Link operacional recomendado para criação e gestão: https://console.anthropic.com/

## OpenAI / GPT

Fonte oficial consultada: https://developers.openai.com/api/docs/quickstart

Achados principais: a documentação oficial informa que o usuário deve criar uma API key no dashboard antes de iniciar, armazená-la em local seguro e exportá-la como variável de ambiente. A página mostra `export OPENAI_API_KEY="your_api_key_here"` e informa que os SDKs da OpenAI leem automaticamente a chave a partir do ambiente do sistema.

Link operacional recomendado para criação e gestão: https://platform.openai.com/api-keys
