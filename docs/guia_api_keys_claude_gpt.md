# Guia rápido para abertura de contas e geração de API keys

**Projeto:** Saúde Integrativa IA  
**Autor:** Sidney (PMO Senium.ai)  
**Data:** 04 de maio de 2026  
**Finalidade:** orientar a criação das contas técnicas e a geração das chaves de API para **Claude Sonnet 4.6** e **GPT/OpenAI**.

## 1. Visão geral

Este guia descreve o caminho operacional para criar as contas de desenvolvedor e gerar as duas chaves necessárias para a próxima etapa de integração. A chave do Claude será usada para operar o provedor principal recomendado, enquanto a chave da OpenAI/GPT ficará disponível como fallback técnico ou uso complementar.

| Provedor | Plataforma oficial | Chave recomendada no projeto | Uso previsto |
|---|---|---|---|
| Anthropic / Claude | [console.anthropic.com](https://console.anthropic.com/) | `ANTHROPIC_API_KEY` | Motor principal do chat com Claude Sonnet 4.6 |
| OpenAI / GPT | [platform.openai.com](https://platform.openai.com/) | `OPENAI_API_KEY` | Fallback técnico e módulos específicos |

A documentação oficial da Anthropic informa que o uso da API exige uma conta no Anthropic Console e uma API key, que deve ser configurada como variável de ambiente `ANTHROPIC_API_KEY`.[^1] A documentação oficial da OpenAI orienta criar uma API key no dashboard, guardá-la com segurança e exportá-la como variável de ambiente `OPENAI_API_KEY`.[^2]

## 2. Passo a passo — Claude Sonnet 4.6 / Anthropic

A conta do Claude para API é criada no **Anthropic Console**. O modelo **Claude Sonnet 4.6** não exige uma conta separada; ele é selecionado depois na integração técnica, desde que a conta tenha acesso à API e saldo/limite disponível.

| Etapa | Ação |
|---|---|
| 1 | Acesse [https://console.anthropic.com/](https://console.anthropic.com/). |
| 2 | Crie uma conta ou faça login com o e-mail institucional definido para o projeto. |
| 3 | Conclua eventuais verificações solicitadas pela plataforma. |
| 4 | Acesse a área de **API Keys** no Console. |
| 5 | Clique em **Create Key** ou opção equivalente de criação de nova chave. |
| 6 | Dê um nome identificável para a chave, por exemplo: `saude-integrativa-ia-dev`. |
| 7 | Copie a chave gerada e guarde-a imediatamente em local seguro. Normalmente ela não será exibida novamente. |
| 8 | Confirme se a conta possui billing, créditos ou limite de uso habilitado antes da integração. |

Para integração técnica, a variável esperada deve ser:

```bash
ANTHROPIC_API_KEY=cole_a_chave_aqui
```

## 3. Passo a passo — GPT / OpenAI

A conta do GPT para API é criada na **OpenAI Platform**. A conta do ChatGPT usada no navegador não substitui automaticamente a configuração de API; é necessário acessar a área de desenvolvedor e gerar uma chave própria.

| Etapa | Ação |
|---|---|
| 1 | Acesse [https://platform.openai.com/](https://platform.openai.com/). |
| 2 | Crie uma conta ou faça login com o e-mail institucional definido para o projeto. |
| 3 | Entre no dashboard da plataforma. |
| 4 | Acesse a área de **API keys**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys). |
| 5 | Clique em **Create new secret key** ou opção equivalente. |
| 6 | Dê um nome identificável para a chave, por exemplo: `saude-integrativa-ia-dev-fallback`. |
| 7 | Copie a chave gerada e guarde-a imediatamente em local seguro. Normalmente ela não será exibida novamente. |
| 8 | Verifique billing, limites de uso e projeto/organização corretos antes da integração. |

Para integração técnica, a variável esperada deve ser:

```bash
OPENAI_API_KEY=cole_a_chave_aqui
```

## 4. Cuidados obrigatórios de segurança

As API keys devem ser tratadas como credenciais sensíveis. Elas não devem ser enviadas por WhatsApp, e-mail comum, planilhas abertas, prints, documentos públicos ou mensagens de chat. O ideal é inserir as chaves apenas em um cofre de senhas corporativo ou diretamente no mecanismo seguro de variáveis de ambiente do projeto.

| Regra | Orientação prática |
|---|---|
| Não expor | Nunca publicar a chave em código, GitHub, Notion aberto, prints ou documentos compartilháveis. |
| Não reutilizar | Usar uma chave específica para este projeto, com nome identificável. |
| Separar ambientes | Se possível, criar chaves diferentes para DEV, homologação e produção. |
| Rotacionar | Se houver suspeita de vazamento, revogar a chave antiga e gerar uma nova imediatamente. |
| Controlar custos | Configurar billing, limites e monitoramento de uso nas duas plataformas. |

## 5. Entrega das chaves para integração

Após gerar as duas chaves, o envio para a equipe técnica deve ser feito apenas por canal seguro. Para este projeto, as variáveis esperadas são:

| Variável | Origem | Finalidade |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Console | Ativar Claude Sonnet 4.6 como provedor principal |
| `OPENAI_API_KEY` | OpenAI Platform | Ativar GPT como fallback técnico |

Com essas duas credenciais disponíveis, a próxima etapa será configurar o gateway de modelos do projeto para usar **Claude Sonnet 4.6 como principal** e **GPT como fallback**, preservando o contexto Dayan e a supervisão da IA mestre.

## 6. Referências oficiais

[^1]: [Anthropic — Get started with Claude](https://platform.claude.com/docs/en/get-started)
[^2]: [OpenAI — Developer quickstart](https://developers.openai.com/api/docs/quickstart)
