# INFRA-DOUTORELO — Documento Mestre de Infraestrutura e Estado do Sistema

> **Última atualização:** 30 de junho de 2026, 23:15 (GMT-3)
> **Versão do checkpoint:** `fdc23b82`
> **Repositório GitHub:** `git@github.com:sdnyrod/doutorelo.git` (branch `main`)
> **Domínio produção:** www.doutorelo.com (Render)
> **Domínio dev/staging:** saudedev-apjfywob.manus.space (Manus)

---

## 1. VISÃO GERAL DO PROJETO

O **DoutorElo** é uma plataforma de saúde funcional com IA, que oferece orientação de saúde não diagnóstica, memória clínica longitudinal, marketplace de saúde, diretório nacional de profissionais, e um sistema conversacional inteligente baseado no conhecimento do Dr. Dayan Siebra.

**Stack tecnológica:**
- **Frontend:** React 19 + Tailwind CSS 4 + Wouter (routing) + shadcn/ui
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Banco de dados:** TiDB (MySQL-compatible, serverless)
- **IA/LLM:** OpenAI GPT-4o (chat principal) + Anthropic Claude Sonnet 4 (decisões contextuais)
- **Hospedagem produção:** Render (deploy via GitHub push automático)
- **Hospedagem dev:** Manus (sandbox com hot reload)

**Métricas do codebase:**
- ~40.500 linhas de TypeScript/TSX
- 44 tabelas no banco de dados
- 11 migrações Drizzle aplicadas
- 36 arquivos de teste (192 testes, todos passando)
- 5.634 linhas de código de IA (server/ai/)
- 5.193 linhas de personalidade conversacional (server/personality.ts)
- Corpus Dayan: 249 vídeos transcritos, 2.405 chunks, 304.022 palavras

---

## 2. IDENTIDADE VISUAL (MIV)

O sistema segue rigorosamente o Manual de Identidade Visual DoutorElo:

| Token | Valor | Uso |
|-------|-------|-----|
| Navy / Ink | `#0F1B33` / `#0D1B2D` | Textos principais, fundos escuros |
| Slate | `#64748B` | Textos secundários, descrições |
| Mist | `#E7ECF2` | Bordas, fundos leves, separadores |
| Pulso Verde | `#6EC1B4` | Acentos, CTAs, destaques interativos |
| Foam | `#F7F8FA` | Fundos de cards, áreas neutras |
| Border | `#E5E7EB` | Bordas padrão |
| Spectrum Cyan | `#22D3EE` | Destaques especiais |
| Spectrum Coral | `#F97373` | Alertas, urgência |

**Tipografia:**
- Font principal: Poppins (weights 400–900)
- Font display (headings): Lexend
- Definida em `client/src/index.css` como CSS variables

**Logo:**
- Arquivo local: `client/public/doutorelo-logo.png`
- Versão branca com pulso vermelho (fundo transparente): `/home/ubuntu/webdev-static-assets/doutorelo-logo-branca-pulso-vermelho.png`
- Referência no código: `OFFICIAL_DOUTORELO_LOGO_URL`

---

## 3. ARQUITETURA DE AUTENTICAÇÃO

### Status atual (30/jun/2026):

| Método | Status | Implementação |
|--------|--------|---------------|
| Email + Senha | **Funcional** | bcrypt (12 rounds) + JWT session cookie |
| Google OAuth | Visual (card) | Aguardando Client ID + Secret |
| Apple Sign-In | Visual (card) | Aguardando Service ID Apple Developer |
| Código por Email | Visual (card) | Aguardando API de envio (Resend/SendGrid) |
| Código por WhatsApp | Visual (card) | Aguardando API (Twilio/Z-API/Evolution) |

**Fluxo técnico do email+senha:**
1. Usuário acessa `/login` → vê 5 cards de método
2. Clica em "Entrar com email e senha" → formulário abre
3. Pode alternar entre Login e Registro
4. Backend: `auth.register` (hash bcrypt → insere user → cria JWT) ou `auth.login` (busca user → compara hash → cria JWT)
5. JWT é assinado com `JWT_SECRET` via jose (HS256), expira em 1 ano
6. Cookie `__session` é setado com `httpOnly`, `secure`, `sameSite: lax`
7. Redirecionamento para `/app` após sucesso

**Arquivos relevantes:**
- `client/src/pages/Login.tsx` — página de login redesenhada no MIV
- `server/routers.ts` (linhas 888–935) — procedures `auth.register` e `auth.login`
- `server/db.ts` — helpers `getUserByEmail()` e `createUserWithPassword()`
- `server/_core/sdk.ts` — `createSessionToken()` e `verifySession()`
- `server/_core/context.ts` — extrai user do cookie em cada request
- `drizzle/schema.ts` — campo `passwordHash` na tabela `users`

**Importante:** O Manus OAuth ainda existe no código core (`server/_core/oauth.ts`) mas NÃO é exposto na UI de login. O fluxo visível é 100% independente do Manus.

---

## 4. SISTEMA DE IA / CHAT

### 4.1 Arquitetura do Chat (Home)

O chat da Home (`/`) é o ponto de entrada principal. O usuário digita uma mensagem e a IA responde com orientação de saúde funcional.

**Pipeline de processamento:**

```
Mensagem do usuário
    ↓
[1] Master Orchestrator (masterOrchestrator.ts)
    → Decisão: qual agente/rota usar
    ↓
[2] Intent Engine (intentEngine.ts)
    → Classifica intenção: symptom, exam, habit, prevention, professional-search, emotional, alert, general
    ↓
[3] Clinical Safety (clinicalSafety.ts)
    → Avalia risco: low, medium, high, critical
    → Detecta pedidos de prescrição (bloqueia)
    ↓
[4] Home Chat Maestro (homeChatMaestro.ts)
    → Orquestra a resposta final com contexto clínico
    → Enriquece com Dayan Knowledge (RAG)
    ↓
[5] Personality (personality.ts)
    → Aplica tom, estilo, provocações clínicas
    → 5.193 linhas de personalidade brasileira madura
    ↓
[6] Resposta ao usuário
```

### 4.2 Modelos LLM em uso

| Modelo | Uso | Arquivo |
|--------|-----|---------|
| GPT-4o (OpenAI) | Chat principal, respostas ao usuário | `server/_core/llm.ts` |
| Claude Sonnet 4 (Anthropic) | Decisões contextuais, análise de intenção avançada | `server/ai/modelGateway.ts` |

**Configuração:**
- `OPENAI_API_KEY` — chave direta para api.openai.com
- `ANTHROPIC_API_KEY` — chave direta para api.anthropic.com
- Sem proxy, sem forge, sem intermediários
- `max_tokens` removido — respostas sem limite de tamanho
- `FINAL_ANSWER_MAX` = 100.000 caracteres (efetivamente sem truncamento)

### 4.3 Corpus Dayan (RAG)

Base de conhecimento extraída de 249 vídeos do Dr. Dayan Siebra:
- 2.405 chunks indexados
- 304.022 palavras totais
- 1.539 chunks com relevância de segurança clínica
- Temas: nutrição, emagrecimento, prevenção, suplementos, sono, hormônios, etc.
- Armazenado em: `research/dayan/corpus/consolidated/`
- Pipeline RAG: `server/ai/ragPipeline.ts` + `server/ai/dayanKnowledge.ts`

### 4.4 Personalidade

Arquivo `server/personality.ts` (5.193 linhas) define:
- Tom conversacional brasileiro maduro
- Provocações clínicas (estilo Dayan)
- Contextos emocionais detectados
- Frases proibidas (mecânicas, defensivas)
- Saudações contextuais por horário
- Limites de segurança clínica

---

## 5. BANCO DE DADOS

### 5.1 Conexão

- **Provider:** TiDB Serverless (MySQL-compatible)
- **Variável:** `DATABASE_URL`
- **ORM:** Drizzle (MySQL2 driver)
- **Pool:** 10 conexões, keepAlive habilitado

### 5.2 Tabelas (44 total)

**Usuários e Perfis:**
- `users` — cadastro (openId, email, name, passwordHash, role, loginMethod)
- `patientHealthProfiles` — perfil de saúde do paciente

**Conversas e Memória Clínica:**
- `healthConversations` — sessões de conversa
- `clinicalMemoryEvents` — eventos clínicos memorizados
- `clarityMaps` — mapas de clareza (preparação de consulta)

**Documentos e Exames:**
- `healthDocuments` — documentos de saúde (exames, laudos)
- `healthConsents` — consentimentos LGPD

**Consultas e Agenda:**
- `careAppointments` — consultas agendadas
- `externalCalendarConnections` — conexões com calendários externos
- `appointmentCalendarSyncs` — sincronizações de agenda

**Profissionais e Diretório:**
- `dayanNetworkProfessionals` — rede Dayan (profissionais parceiros)
- `healthProviders` — diretório nacional CNES (1.728.989 registros)
- `healthProviderSpecialties` — especialidades
- `healthProviderSources` — fontes de dados
- `healthProviderEvidences` — evidências
- `healthProviderAffiliations` — vínculos
- `healthDirectoryCoverage` — cobertura territorial
- `dataIngestionJobs` — jobs de ingestão CNES

**Marketplace:**
- `marketplaceCategories`, `marketplacePartners`, `marketplaceItems`
- `marketplaceInventory`, `marketplaceCarts`, `marketplaceCartItems`
- `marketplaceOrders`, `marketplaceOrderItems`
- `marketplaceRecommendationEvents`

**Saúde Conectada:**
- `healthIndicators` — indicadores de saúde
- `healthDataConnections` — conexões com wearables/apps
- `healthMetricSamples` — amostras de métricas

**Plano de Cuidado:**
- `longitudinalCarePlanItems` — itens do plano longitudinal
- `careJourneySessions` — sessões da jornada de cuidado
- `careJourneyFeedback` — feedback da jornada

**Machine Learning:**
- `aiModelExecutions` — execuções de modelo
- `mlPromptVersions`, `mlModelVersions` — versionamento
- `mlLearningEvents`, `mlTrainingExamples` — aprendizado
- `mlImprovementCycles` — ciclos de melhoria

**Corpus Dayan (RAG):**
- `dayanCorpusVideos`, `dayanCorpusTranscripts`
- `dayanCorpusSegments`, `dayanCorpusChunks`
- `dayanRagRetrievalEvents`

---

## 6. PÁGINAS E ROTAS

| Rota | Componente | Status |
|------|-----------|--------|
| `/` | Home.tsx | **Funcional** — Chat IA principal |
| `/login` | Login.tsx | **Funcional** — Email+senha ativo |
| `/app` | Dashboard.tsx | **Funcional** — Painel do paciente |
| `/preparar-consulta` | Clarity.tsx | **Funcional** — Mapa de clareza |
| `/clareza` | Clarity.tsx | Alias de /preparar-consulta |
| `/memoria` | Memory.tsx | **Funcional** — Memória clínica |
| `/consultas` | Consultations.tsx | **Funcional** — Agenda |
| `/conexoes` | Connections.tsx | **Funcional** — Wearables/apps |
| `/marketplace` | Marketplace.tsx | **Funcional** — Loja de saúde |
| `/loja` | Marketplace.tsx | Alias de /marketplace |
| `/diretorio-nacional` | NationalHealthDirectory.tsx | **Funcional** — Busca CNES |
| `/profissionais` | Professionals.tsx | **Funcional** — Rede Dayan |
| `/profissionais/:id` | ProfessionalDetail.tsx | **Funcional** — Detalhe |
| `/admin` | Admin.tsx | **Funcional** — Painel admin |
| `/admin/marketplace` | AdminMarketplace.tsx | **Funcional** — Gestão loja |
| `/componentes` | ComponentShowcase.tsx | Dev only |

---

## 7. DEPLOY E INFRAESTRUTURA

### 7.1 Render (Produção)

- **URL:** www.doutorelo.com
- **Tipo:** Web Service
- **Build:** `pnpm build` (Vite + esbuild)
- **Start:** `node dist/server/index.js`
- **Deploy trigger:** Push automático na branch `main` do GitHub
- **Variáveis de ambiente no Render:**
  - `DATABASE_URL` — TiDB connection string
  - `JWT_SECRET` — segredo para assinar sessões
  - `OPENAI_API_KEY` — chave OpenAI direta
  - `ANTHROPIC_API_KEY` — chave Anthropic direta
  - `NODE_ENV=production`

### 7.2 Manus (Desenvolvimento)

- **URL:** saudedev-apjfywob.manus.space
- **Dev server:** Vite HMR + Express (porta 3000)
- **Hot reload:** Sim
- **Banco:** Mesmo TiDB (compartilhado dev/prod)

### 7.3 GitHub

- **Repo:** `sdnyrod/doutorelo`
- **Branch:** `main`
- **Push:** Automático após `webdev_save_checkpoint`

---

## 8. TOKENS E CHAVES

| Variável | Serviço | Status |
|----------|---------|--------|
| `OPENAI_API_KEY` | OpenAI (GPT-4o) | **Ativo** |
| `ANTHROPIC_API_KEY` | Anthropic (Claude Sonnet 4) | **Ativo** |
| `DATABASE_URL` | TiDB Serverless | **Ativo** |
| `JWT_SECRET` | Assinatura de sessão | **Ativo** |
| Google Client ID | Google OAuth | **Pendente** |
| Google Client Secret | Google OAuth | **Pendente** |
| Apple Service ID | Apple Sign-In | **Pendente** |
| API Email (Resend/SendGrid) | Magic link por email | **Pendente** |
| API WhatsApp (Twilio/Z-API) | Código por WhatsApp | **Pendente** |

---

## 9. O QUE ESTÁ FUNCIONANDO HOJE

### Funcional e em produção:
1. **Chat IA na Home** — responde perguntas de saúde com GPT-4o, personalidade Dayan, RAG do corpus
2. **Login com email+senha** — registro, login, sessão persistente
3. **Dashboard do paciente** — visão geral de saúde
4. **Memória clínica** — eventos salvos longitudinalmente
5. **Mapa de Clareza** — preparação de consulta com IA
6. **Marketplace** — catálogo, carrinho, checkout simulado
7. **Diretório Nacional** — 1.7M profissionais CNES com busca
8. **Rede Dayan** — profissionais parceiros com detalhes
9. **Consultas/Agenda** — agendamento e visualização
10. **Admin** — painel administrativo com gestão
11. **MIV aplicado** — identidade visual consistente em todas as páginas
12. **Testes** — 192 testes automatizados passando

### Parcialmente implementado:
- Login social (Google/Apple) — cards visuais, backend pendente
- Magic links (email/WhatsApp) — cards visuais, integração pendente
- Upload de exames — schema existe (`healthDocuments`), fluxo completo pendente
- Conexões com wearables — UI existe, integrações reais pendentes

---

## 10. PRÓXIMOS PASSOS — IMPLEMENTAÇÃO PRIORITÁRIA

### 10.1 SISTEMA DE CONHECIMENTO PROFUNDO DA IA (PRIORIDADE 1)

> **Objetivo:** A IA do chat deve conhecer profundamente o DoutorElo — todas as funcionalidades, fluxos, regras de negócio, e protocolos de segurança.

**O que precisa ser criado:**

#### A) Knowledge Base do Sistema (`server/ai/systemKnowledge.ts`)

Documento estruturado que a IA recebe como system prompt contendo:

1. **Mapa de funcionalidades** — onde fica cada opção, como acessar
   - "Para fazer upload de um exame, vá em /app → Documentos → Upload"
   - "Para agendar consulta, vá em /consultas → Nova consulta"
   - "Para comprar suplementos, vá em /marketplace"
   - "Para encontrar um profissional, vá em /diretorio-nacional"

2. **Protocolos de ação** — quando exigir login, quando recusar
   - Upload de exame → REQUER cadastro (LGPD: consentimento + identificação)
   - Visualizar memória clínica → REQUER cadastro
   - Perguntar sobre saúde → público (sem cadastro)
   - Comprar no marketplace → REQUER cadastro
   - Buscar profissional → público

3. **Regras LGPD** — como dados sensíveis são tratados
   - Consentimento explícito antes de processar dados de saúde
   - Direito de exclusão (apagar dados)
   - Dados criptografados em trânsito e repouso
   - Sem compartilhamento com terceiros sem autorização
   - Tabela `healthConsents` registra cada consentimento

4. **Fluxo de onboarding inteligente**
   - Se usuário pede algo que requer login → IA guia para cadastro
   - "Para eu poder ler seu exame, preciso que você crie uma conta primeiro. É rápido e seus dados ficam protegidos. Quer que eu te ajude?"
   - Após cadastro → retoma a ação original

5. **Contexto semântico e memória**
   - IA mantém contexto da conversa inteira
   - Lembra o que o usuário disse antes na sessão
   - Pode referenciar informações anteriores
   - Sabe quando o usuário está confuso e reformula

#### B) Protocolo de Upload de Exames

```
1. Usuário pede para enviar exame
2. IA verifica: está logado?
   → NÃO: "Preciso que você crie uma conta primeiro [guia]"
   → SIM: continua
3. IA solicita consentimento LGPD explícito
4. Usuário confirma
5. IA registra consentimento na tabela `healthConsents`
6. Upload processado → armazenado em S3 com chave vinculada ao userId
7. Metadados salvos em `healthDocuments`
8. IA pode ler/interpretar o exame com contexto do perfil do paciente
```

#### C) Integração com Intent Engine

O intent engine já classifica intenções. Precisamos adicionar:
- `"system-navigation"` — quando o usuário pergunta como usar o sistema
- `"upload-document"` — quando quer enviar exame/documento
- `"account-action"` — quando quer se cadastrar/alterar conta
- `"purchase"` — quando quer comprar algo

#### D) Guia Conversacional Inteligente

A IA deve saber responder:
- "Como faço para..." → guia passo a passo
- "Onde fica..." → indica a rota/seção
- "Posso..." → verifica permissões e guia
- "Quanto custa..." → consulta marketplace
- "Quem é..." → busca profissional

---

### 10.2 AUTENTICAÇÃO SOCIAL (PRIORIDADE 2)

Após obter as credenciais:

1. **Google OAuth:**
   - Criar projeto no Google Cloud Console
   - Configurar OAuth consent screen
   - Obter Client ID + Secret
   - Implementar fluxo OAuth2 no backend
   - Redirect URI: `https://www.doutorelo.com/api/auth/google/callback`

2. **Apple Sign-In:**
   - Configurar no Apple Developer Portal
   - Obter Service ID + Key
   - Implementar fluxo Sign in with Apple
   - Redirect URI: `https://www.doutorelo.com/api/auth/apple/callback`

3. **Magic Link por Email:**
   - Escolher provider (Resend recomendado)
   - Gerar token único → salvar no banco com expiração
   - Enviar email com link `https://www.doutorelo.com/api/auth/verify?token=xxx`
   - Ao clicar → valida token → cria sessão

4. **Código por WhatsApp:**
   - Escolher provider (Twilio/Z-API)
   - Gerar código 6 dígitos → salvar com expiração (5min)
   - Enviar via API WhatsApp
   - Usuário digita código → valida → cria sessão

---

### 10.3 UPLOAD DE EXAMES COM LGPD (PRIORIDADE 3)

- Implementar fluxo completo de upload
- Consentimento explícito registrado
- Armazenamento seguro em S3
- IA capaz de ler e interpretar exames
- Histórico de exames no perfil do paciente

---

## 11. DECISÕES ARQUITETURAIS IMPORTANTES

1. **Sem Manus OAuth na UI** — autenticação própria, independente da plataforma de desenvolvimento
2. **LLM direto** — chamadas diretas para OpenAI/Anthropic, sem proxy ou forge
3. **Sem max_tokens** — respostas completas, sem truncamento
4. **Banco compartilhado** — mesmo TiDB para dev e prod (cuidado com dados)
5. **Deploy via GitHub** — push para `main` → Render rebuilda automaticamente
6. **Corpus RAG local** — chunks em JSON, busca por similaridade textual (não vetorial)
7. **Personalidade extensa** — 5.193 linhas garantem tom consistente e humano
8. **Testes como contrato** — 36 arquivos de teste garantem que mudanças não quebram a identidade

---

## 12. REGRAS INVIOLÁVEIS

1. **NUNCA** expor "Manus" na interface pública
2. **NUNCA** usar Manus OAuth no fluxo visível de login
3. **NUNCA** fabricar dados de saúde ou reviews
4. **NUNCA** dar diagnóstico — apenas orientação funcional
5. **NUNCA** processar dados sensíveis sem consentimento LGPD
6. **NUNCA** truncar respostas da IA artificialmente
7. **SEMPRE** manter o MIV (cores, fontes, logo) consistente
8. **SEMPRE** rodar testes antes de fazer push
9. **SEMPRE** usar a personalidade Dayan no chat
10. **SEMPRE** exigir cadastro para ações que envolvem dados pessoais

---

## 13. COMO INICIAR UMA SESSÃO DE TRABALHO

Ao começar qualquer sessão nova:

1. Ler este documento (`INFRA-DOUTORELO.md`)
2. Verificar o status do dev server: `webdev_check_status`
3. Rodar testes: `npx vitest run` (devem passar todos)
4. Verificar o `todo.md` para itens pendentes
5. Confirmar que o GitHub está sincronizado: `git status`
6. Perguntar ao Sidney qual é a prioridade do dia

---

## 14. CONTATOS E REFERÊNCIAS

- **Proprietário:** Sidney (PMO)
- **Repositório:** github.com/sdnyrod/doutorelo
- **Produção:** www.doutorelo.com
- **Render Dashboard:** (acesso do Sidney)
- **MIV Oficial:** Documentos na pasta `research/` e `/mnt/desktop/Sdnyrod/`
- **Corpus Dayan:** `research/dayan/corpus/consolidated/`

---

*Este documento deve ser atualizado a cada mudança significativa na infraestrutura, arquitetura ou decisões de produto.*
