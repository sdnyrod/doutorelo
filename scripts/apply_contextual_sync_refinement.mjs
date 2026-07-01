import { readFileSync, writeFileSync } from "node:fs";

const root = "/home/ubuntu/saude-integrativa-ia-dev";

function read(path) {
  return readFileSync(`${root}/${path}`, "utf8");
}

function write(path, content) {
  writeFileSync(`${root}/${path}`, content);
}

function replaceOrThrow(content, find, replace, label) {
  if (!content.includes(find)) {
    throw new Error(`Trecho não encontrado: ${label}`);
  }
  return content.replace(find, replace);
}

let maestro = read("server/ai/homeChatMaestro.ts");
maestro = replaceOrThrow(
  maestro,
  'import { buildHomeChatAgentBundle } from "./homeChatAgents";\n',
  'import { buildHomeChatAgentBundle } from "./homeChatAgents";\nimport type { MasterDecision } from "./masterOrchestrator";\n',
  "import MasterDecision",
);

const polisherBlock = `
export function enrichAssistantMessageWithContextualHint(assistantMessage: string, decision: MasterDecision | null | undefined): string {
  const polishedBase = polishRawClaudeHomeChatMessage(assistantMessage, decision);
  const hint = buildContextualRecommendationHint(decision);
  const base = truncate(cleanMultiline(polishedBase), FINAL_ANSWER_MAX);

  if (!hint) return base;
  if (alreadyMentionsContextualHint(base, decision)) return base;

  const separator = /[.!?…]$/.test(base) ? " " : ". ";
  const maxBaseLength = Math.max(120, FINAL_ANSWER_MAX - separator.length - hint.length);
  const shortenedBase = base.length > maxBaseLength ? truncate(base, maxBaseLength) : base;

  return truncate(shortenedBase + separator + hint, FINAL_ANSWER_MAX);
}

function polishRawClaudeHomeChatMessage(assistantMessage: string, decision: MasterDecision | null | undefined): string {
  let text = cleanMultiline(assistantMessage)
    .replace(/\\bcomo\\s+(?:uma\\s+)?ia[,.!?:;\\s]*/gi, "")
    .replace(/\\bcomo\\s+modelo\\s+de\\s+linguagem[,.!?:;\\s]*/gi, "")
    .replace(/\\bcomo\\s+assistente\\s+virtual[,.!?:;\\s]*/gi, "")
    .replace(/(?:eu\\s+)?n[ãa]o\\s+tenho\\s+acesso\\s+(?:a|ao|aos|à|às)[^.!?]*(?:rede\\s+dayan|profissionais?|candidatos?|base)[.!?]\\s*/gi, "")
    .replace(/(?:eu\\s+)?n[ãa]o\\s+consigo\\s+(?:ver|acessar|consultar)[^.!?]*(?:rede\\s+dayan|profissionais?|candidatos?|base)[.!?]\\s*/gi, "")
    .replace(/\\s+([,.!?;:])/g, "$1")
    .replace(/\\n{3,}/g, "\\n\\n")
    .trim();

  if (!text) {
    text = "Pelo que você descreve, eu organizaria isso com calma: sintomas, rotina, sono, estresse e sinais de atenção ajudam a decidir o próximo passo sem fechar diagnóstico por aqui.";
  }

  if (decision?.action === "suggest_professional" && decision.professionalCandidates.length > 0) {
    text = text.replace(/n[ãa]o\\s+(?:posso|consigo)[^.!?]*(?:indicar|aproximar|sugerir)[^.!?]*profissional[^.!?]*[.!?]/gi, "").trim() || text;
  }

  return text;
}

function buildContextualRecommendationHint(decision: MasterDecision | null | undefined): string {
  if (!decision || decision.action === "none" || !decision.card) return "";

  if (decision.action === "suggest_professional" && decision.professionalCandidates.length > 0) {
    const primary = decision.professionalCandidates[0];
    const location = primary.city && primary.state ? " em " + primary.city + "-" + primary.state : "";
    return "Também deixei ao lado opções" + location + " da Rede Dayan para você considerar como ponte humana, sem substituir uma avaliação individual.";
  }

  if (decision.action === "suggest_product" && decision.productCandidates.length > 0) {
    return "Também deixei ao lado uma sugestão educativa de apoio à rotina, sempre separada de diagnóstico, prescrição ou tratamento.";
  }

  if (decision.action === "suggest_upload") {
    return "Se houver exame ou laudo, deixei ao lado um caminho para anexar e organizar os pontos principais com mais clareza.";
  }

  if (decision.action === "suggest_signup") {
    return "Se quiser continuidade, deixei ao lado uma forma de guardar esse contexto com segurança para não perder o fio do cuidado.";
  }

  if (decision.action === "show_form") {
    return "Também deixei ao lado um formulário curto para organizar essas informações sem interromper a conversa.";
  }

  if (decision.action === "show_card") {
    return "Também deixei ao lado um cartão de apoio para você acessar no seu tempo, sem interromper a conversa.";
  }

  return "";
}

function alreadyMentionsContextualHint(assistantMessage: string, decision: MasterDecision | null | undefined): boolean {
  if (!decision) return false;
  const text = assistantMessage.toLocaleLowerCase("pt-BR");
  if (decision.action === "suggest_professional") return /rede\\s+dayan|op[cç][oõ]es?\\s+pr[oó]ximas?|profissionais?\\s+ao\\s+lado|ponte\\s+humana/.test(text);
  if (decision.action === "suggest_product") return /sugest[aã]o\\s+educativa|apoio\\s+[àa]\\s+rotina|produto\\s+ao\\s+lado/.test(text);
  if (decision.action === "suggest_upload") return /anexar|laudo|exame\\s+ao\\s+lado/.test(text);
  if (decision.action === "suggest_signup") return /guardar\\s+esse\\s+contexto|continuidade|seguran[cç]a/.test(text);
  if (decision.action === "show_form") return /formul[aá]rio\\s+curto|organizar\\s+essas\\s+informa[cç][oõ]es/.test(text);
  return false;
}
`;

maestro = replaceOrThrow(
  maestro,
  "function normalizeHomeChatMaestroResponse(value: RawHomeChatMaestroResponse, input: HomeChatMaestroInput, agentBundle: HomeClinicalAgentBundle): HomeChatMaestroResult {",
  `${polisherBlock}\nfunction normalizeHomeChatMaestroResponse(value: RawHomeChatMaestroResponse, input: HomeChatMaestroInput, agentBundle: HomeClinicalAgentBundle): HomeChatMaestroResult {`,
  "inserir polidor contextual",
);
write("server/ai/homeChatMaestro.ts", maestro);

let master = read("server/ai/masterOrchestrator.ts");
master = replaceOrThrow(
  master,
  `  if (opportunities.signup) {
    action = "suggest_signup";
    confidence = "high";
    reason = "A mensagem contém contexto pessoal de saúde e o cadastro permite continuidade, memória clínica e sugestões mais responsáveis.";
    card = {
      title: "Guardar esse contexto com segurança?",
      description: "Se você entrar, eu consigo manter uma linha do tempo do cuidado e organizar próximos passos sem perder o fio da conversa.",
      ctaLabel: "Criar minha área de cuidado",
      href: "/login",
      visualCue: "gentle_glow",
      priority: "high",
    };
  } else if (opportunities.upload) {
    action = "suggest_upload";
    confidence = "high";
    reason = "A conversa menciona exames ou laudos, então a próxima ação útil é oferecer upload para organizar dados antes de qualquer orientação.";
    card = {
      title: "Quer anexar o exame aqui?",
      description: "Posso organizar os pontos principais e transformar o laudo em perguntas úteis para a consulta, sem interpretar como diagnóstico isolado.",
      ctaLabel: "Adicionar exame ou laudo",
      href: "/clareza?intencao=upload",
      visualCue: "lift_fade",
      priority: "high",
    };
  } else if (opportunities.professional && hasProfessionals) {
`,
  `  if (opportunities.professional && hasProfessionals) {
`,
  "priorizar profissional",
);
master = replaceOrThrow(
  master,
  `  } else if (opportunities.product && hasProducts) {
`,
  `  } else if (opportunities.upload) {
    action = "suggest_upload";
    confidence = "high";
    reason = "A conversa menciona exames ou laudos, então a próxima ação útil é oferecer upload para organizar dados antes de qualquer orientação.";
    card = {
      title: "Quer anexar o exame aqui?",
      description: "Posso organizar os pontos principais e transformar o laudo em perguntas úteis para a consulta, sem interpretar como diagnóstico isolado.",
      ctaLabel: "Adicionar exame ou laudo",
      href: "/clareza?intencao=upload",
      visualCue: "lift_fade",
      priority: "high",
    };
  } else if (opportunities.signup) {
    action = "suggest_signup";
    confidence = "high";
    reason = "A mensagem contém contexto pessoal de saúde e o cadastro permite continuidade, memória clínica e sugestões mais responsáveis.";
    card = {
      title: "Guardar esse contexto com segurança?",
      description: "Se você entrar, eu consigo manter uma linha do tempo do cuidado e organizar próximos passos sem perder o fio da conversa.",
      ctaLabel: "Criar minha área de cuidado",
      href: "/login",
      visualCue: "gentle_glow",
      priority: "high",
    };
  } else if (opportunities.product && hasProducts) {
`,
  "recolocar upload/signup após profissional",
);
write("server/ai/masterOrchestrator.ts", master);

let routers = read("server/routers.ts");
routers = replaceOrThrow(
  routers,
  'import { buildMasterDecision } from "./ai/masterOrchestrator";\n',
  'import { buildMasterDecision, type MasterDecision } from "./ai/masterOrchestrator";\nimport { enrichAssistantMessageWithContextualHint } from "./ai/homeChatMaestro";\n',
  "imports roteador",
);
routers = replaceOrThrow(
  routers,
  `const homeChatInput = z.object({
  message: z.string(),
});
`,
  `const homeChatInput = z.object({
  message: z.string().trim().min(1).max(1800),
  route: z.string().trim().max(180).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(2).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});
`,
  "homeChatInput contextual",
);

routers = replaceOrThrow(
  routers,
  `async function callAnthropicText(message: string): Promise<string> {
`,
  `function buildAnthropicHomeChatPrompt(message: string, masterDecision: MasterDecision | null): string {
  const lines = [
    "Você é o DOUTORELO, assistente público de saúde integrativa em português brasileiro.",
    "Responda com 2 a 4 frases curtas, humanas e objetivas, sem diagnóstico, prescrição, dose ou promessa de causa.",
    "Evite tom defensivo como 'como IA' ou 'não tenho acesso'; use o contexto operacional privado apenas para coerência narrativa.",
    "A interface pode exibir um card lateral sincronizado com esta resposta. Se houver sugestão lateral, prepare o usuário com uma menção sutil, sem parecer anúncio.",
  ];

  if (masterDecision?.action === "suggest_professional" && masterDecision.professionalCandidates.length > 0) {
    const candidates = masterDecision.professionalCandidates
      .slice(0, 3)
      .map((candidate) => candidate.name + " — " + candidate.specialty + " — " + candidate.city + "-" + candidate.state)
      .join("; ");
    lines.push("Sugestão lateral sincronizada: profissionais da Rede Dayan relacionados ao contexto (" + candidates + ").");
  } else if (masterDecision?.action === "suggest_product" && masterDecision.productCandidates.length > 0) {
    const productsSummary = masterDecision.productCandidates
      .slice(0, 2)
      .map((product) => product.name + " — " + (product.category ?? "apoio educativo"))
      .join("; ");
    lines.push("Sugestão lateral sincronizada: apoio educativo/comercial de rotina (" + productsSummary + "), sem prescrição.");
  } else if (masterDecision?.card) {
    lines.push("Sugestão lateral sincronizada: " + masterDecision.card.title + ". Use isso apenas como ponte discreta no texto, se fizer sentido.");
  }

  lines.push("Mensagem do usuário: " + message);
  return lines.join("\n");
}

async function callAnthropicText(message: string, masterDecision: MasterDecision | null = null): Promise<string> {
`,
  "prompt Anthropic contextual",
);
routers = replaceOrThrow(
  routers,
  `      messages: [{ role: "user", content: message }],
`,
  `      messages: [{ role: "user", content: buildAnthropicHomeChatPrompt(message, masterDecision) }],
`,
  "mensagem Anthropic com contexto",
);

routers = replaceOrThrow(
  routers,
  `async function buildAnonymousHomeChatResponse(input: z.infer<typeof homeChatInput>) {
  const scopeDecision = classifyHomeChatScope(input.message);

  if (!scopeDecision.allowed) {
    return {
      assistantMessage: buildOutOfScopeHomeChatMessage(scopeDecision),
    };
  }

  return {
    assistantMessage: await callAnthropicText(input.message),
  };
}
`,
  `async function buildHomeChatMasterDecision(input: z.infer<typeof homeChatInput> | z.infer<typeof masterObservationInput>, isAuthenticated: boolean) {
  const professionalCandidates = await recommendDayanNetworkProfessionals({
    city: input.city ?? null,
    state: input.state ?? null,
    need: input.message,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    limit: 4,
  });

  return buildMasterDecision({
    message: input.message,
    route: input.route ?? null,
    isAuthenticated,
    city: input.city ?? null,
    state: input.state ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    professionalCandidates: professionalCandidates.map((professional) => ({
      name: professional.name,
      specialty: professional.specialty,
      city: professional.city,
      state: professional.state,
      modality: professional.modality,
      score: professional.matchScore,
      distanceKm: professional.distanceKm,
    })),
    productCandidates: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      commercialNotice: product.commercialNotice,
    })),
  });
}

async function buildAnonymousHomeChatResponse(input: z.infer<typeof homeChatInput>, isAuthenticated = false) {
  const scopeDecision = classifyHomeChatScope(input.message);

  if (!scopeDecision.allowed) {
    return {
      assistantMessage: buildOutOfScopeHomeChatMessage(scopeDecision),
      masterDecision: null,
    };
  }

  const masterDecision = await buildHomeChatMasterDecision(input, isAuthenticated);
  const rawAssistantMessage = await callAnthropicText(input.message, masterDecision);

  return {
    assistantMessage: enrichAssistantMessageWithContextualHint(rawAssistantMessage, masterDecision),
    masterDecision,
  };
}
`,
  "buildAnonymousHomeChatResponse sincronizado",
);

routers = replaceOrThrow(
  routers,
  `    observe: publicProcedure
      .input(masterObservationInput)
      .mutation(async ({ input, ctx }) => {
        const professionalCandidates = await recommendDayanNetworkProfessionals({
          city: input.city ?? null,
          state: input.state ?? null,
          need: input.message,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          limit: 4,
        });
        return buildMasterDecision({
          message: input.message,
          route: input.route ?? null,
          isAuthenticated: Boolean(ctx.user),
          city: input.city ?? null,
          state: input.state ?? null,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          professionalCandidates: professionalCandidates.map((professional) => ({
            name: professional.name,
            specialty: professional.specialty,
            city: professional.city,
            state: professional.state,
            modality: professional.modality,
            score: professional.matchScore,
            distanceKm: professional.distanceKm,
          })),
          productCandidates: products.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category,
            commercialNotice: product.commercialNotice,
          })),
        });
      }),
`,
  `    observe: publicProcedure
      .input(masterObservationInput)
      .mutation(async ({ input, ctx }) => buildHomeChatMasterDecision(input, Boolean(ctx.user))),
`,
  "master.observe reutiliza decisão",
);
routers = replaceOrThrow(
  routers,
  `    send: publicProcedure
      .input(homeChatInput)
      .mutation(async ({ input }) => buildAnonymousHomeChatResponse(input)),
`,
  `    send: publicProcedure
      .input(homeChatInput)
      .mutation(async ({ input, ctx }) => buildAnonymousHomeChatResponse(input, Boolean(ctx.user))),
`,
  "homeChat.send com ctx",
);
write("server/routers.ts", routers);

let home = read("client/src/pages/Home.tsx");
home = replaceOrThrow(
  home,
  `            : "w-full max-w-[92%] whitespace-pre-wrap break-words rounded-[1.6rem] rounded-bl-md border border-[#d9f4eb] bg-white px-5 py-4 text-left text-sm leading-6 text-[#23413b] shadow-[0_14px_42px_rgba(18,63,58,0.08)] sm:text-base"
        }
        data-chat-rendering={isUser ? "user-raw-text" : "assistant-raw-anthropic-text"}
`,
  `            : "w-full max-w-[92%] whitespace-pre-wrap break-words rounded-[1.6rem] rounded-bl-md border border-[#d9f4eb] bg-white px-5 py-4 text-left text-sm leading-6 text-[#23413b] shadow-[0_14px_42px_rgba(18,63,58,0.08)] sm:text-base"
        }
        data-chat-rendering={isUser ? "user-raw-text" : "assistant-doutorelo-polished-text"}
`,
  "data-chat-rendering polido",
);
home = replaceOrThrow(
  home,
  `  const masterObserve = trpc.master.observe.useMutation({
    onSuccess: (data) => {
      if (data.card && data.action !== "none") {
        setMasterSuggestion(data as MasterSuggestion);
        setLiveAnnouncement(\`Sugestão contextual disponível: \${data.card.title}\`);
      } else {
        setMasterSuggestion(null);
      }
    },
  });

`,
  "",
  "remover masterObserve separado",
);
home = replaceOrThrow(
  home,
  `  const homeChat = trpc.homeChat.send.useMutation({
    onSuccess: (data) => {
      setMessages((current) => [...current, { role: "assistant", content: data.assistantMessage }]);
      setErrorMessage(null);
      setLiveAnnouncement(\`Nova resposta do Anthropic: \${data.assistantMessage.slice(0, 180)}\`);
    },
`,
  `  const homeChat = trpc.homeChat.send.useMutation({
    onSuccess: (data) => {
      setMessages((current) => [...current, { role: "assistant", content: data.assistantMessage }]);
      if (data.masterDecision?.card && data.masterDecision.action !== "none") {
        setMasterSuggestion(data.masterDecision as MasterSuggestion);
        setLiveAnnouncement(\`Nova resposta do DOUTORELO com sugestão contextual: \${data.masterDecision.card.title}\`);
      } else {
        setMasterSuggestion(null);
        setLiveAnnouncement(\`Nova resposta do DOUTORELO: \${data.assistantMessage.slice(0, 180)}\`);
      }
      setErrorMessage(null);
    },
`,
  "homeChat onSuccess sincronizado",
);
home = replaceOrThrow(
  home,
  `    masterObserve.mutate({
      message: nextMessage,
      route: window.location.pathname,
    });

    homeChat.mutate({
      message: nextMessage,
    });
`,
  `    homeChat.mutate({
      message: nextMessage,
      route: window.location.pathname,
    });
`,
  "remover chamada separada masterObserve",
);
write("client/src/pages/Home.tsx", home);

write("server/homeChatMaestro.polisher.test.ts", `import { describe, expect, it } from "vitest";\nimport { enrichAssistantMessageWithContextualHint } from "./ai/homeChatMaestro";\nimport type { MasterDecision } from "./ai/masterOrchestrator";\n\nfunction baseDecision(overrides: Partial<MasterDecision>): MasterDecision {\n  return {\n    intent: "symptom_context",\n    action: "suggest_professional",\n    confidence: "high",\n    shouldInterrupt: false,\n    reason: "Teste de sincronização textual e lateral.",\n    card: {\n      title: "Posso te aproximar de alguém da Rede Dayan",\n      description: "Opções associadas ao contexto.",\n      ctaLabel: "Ver profissionais sugeridos",\n      href: "/profissionais?source=master",\n      visualCue: "soft_pulse",\n      priority: "high",\n    },\n    professionalCandidates: [\n      {\n        name: "Dra. Patrícia Goulart Neri",\n        specialty: "Endocrinologia funcional",\n        city: "Maringá",\n        state: "PR",\n        modality: "both",\n        distanceKm: 2.4,\n      },\n    ],\n    productCandidates: [],\n    opportunities: { signup: true, upload: false, professional: true, product: false, form: true },\n    animation: { preset: "graceful_suggestion", enter: "fade-rise-scale", glow: "soft-aura", attentionDelayMs: 240 },\n    ...overrides,\n  };\n}\n\ndescribe("enrichAssistantMessageWithContextualHint", () => {\n  it("remove defesa crua e injeta menção sutil à Rede Dayan quando há sugestão profissional lateral", () => {\n    const polished = enrichAssistantMessageWithContextualHint(\n      "Como uma IA, não tenho acesso a profissionais da Rede Dayan. Cansaço, ansiedade e sono ruim merecem ser organizados com calma, olhando rotina, sinais de alerta e histórico.",\n      baseDecision({}),\n    );\n\n    expect(polished).not.toMatch(/como uma IA|não tenho acesso/i);\n    expect(polished).toMatch(/Rede Dayan/);\n    expect(polished).toMatch(/Maringá-PR/);\n    expect(polished.length).toBeLessThanOrEqual(700);\n  });\n\n  it("injeta apoio educativo de rotina sem transformar produto em prescrição", () => {\n    const polished = enrichAssistantMessageWithContextualHint(\n      "Podemos começar pelo básico: sono, alimentação, estresse e intensidade dos sintomas ajudam a organizar o próximo passo.",\n      baseDecision({\n        action: "suggest_product",\n        card: {\n          title: "Uma sugestão comercial pode ajudar sua rotina",\n          description: "Opções educativas de autocuidado.",\n          ctaLabel: "Ver opções com clareza",\n          href: "/marketplace?source=master",\n          visualCue: "gentle_glow",\n          priority: "medium",\n        },\n        professionalCandidates: [],\n        productCandidates: [{ id: "planner-habitos", name: "Planner Comercial de Hábitos Saudáveis", category: "Educação e organização" }],\n      }),\n    );\n\n    expect(polished).toMatch(/sugestão educativa de apoio à rotina/i);\n    expect(polished).toMatch(/separada de diagnóstico, prescrição ou tratamento/i);\n  });\n});\n`);

write("server/homeChat.test.ts", `import { beforeEach, describe, expect, it, vi } from "vitest";\nimport { appRouter } from "./routers";\nimport type { TrpcContext } from "./_core/context";\n\nconst mockFetch = vi.hoisted(() => vi.fn());\n\nvi.stubGlobal("fetch", mockFetch);\n\nfunction createPublicContext(): TrpcContext {\n  return {\n    user: null,\n    req: {\n      protocol: "https",\n      headers: {},\n    } as TrpcContext["req"],\n    res: {} as TrpcContext["res"],\n  };\n}\n\ndescribe("homeChat.send", () => {\n  beforeEach(() => {\n    mockFetch.mockReset();\n    mockFetch.mockResolvedValue({\n      ok: true,\n      status: 200,\n      text: async () => JSON.stringify({\n        id: "msg_test",\n        type: "message",\n        role: "assistant",\n        model: "claude-test",\n        content: [{ type: "text", text: "Como uma IA, não tenho acesso a profissionais da Rede Dayan. Cansaço, ansiedade e sono ruim merecem ser organizados com calma." }],\n      }),\n    });\n  });\n\n  it("envia pergunta de saúde à Anthropic com contexto operacional e devolve texto polido sincronizado à IA Master", async () => {\n    const caller = appRouter.createCaller(createPublicContext());\n\n    const userMessage = "Estou em Maringá, tenho cansaço, ansiedade e dificuldade para dormir.";\n    const result = await caller.homeChat.send({\n      message: userMessage,\n      city: "Maringá",\n      state: "PR",\n      route: "/",\n    });\n\n    expect(result.masterDecision?.action).toBe("suggest_professional");\n    expect(result.masterDecision?.professionalCandidates[0]).toMatchObject({ city: "Maringá", state: "PR" });\n    expect(result.assistantMessage).toMatch(/Rede Dayan/);\n    expect(result.assistantMessage).toMatch(/Maringá-PR/);\n    expect(result.assistantMessage).not.toMatch(/como uma IA|não tenho acesso/i);\n    expect(mockFetch).toHaveBeenCalledTimes(1);\n    expect(mockFetch).toHaveBeenCalledWith(\n      "https://api.anthropic.com/v1/messages",\n      expect.objectContaining({\n        method: "POST",\n        headers: expect.objectContaining({\n          "content-type": "application/json",\n          "anthropic-version": "2023-06-01",\n        }),\n      }),\n    );\n\n    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);\n    expect(requestBody.messages).toHaveLength(1);\n    expect(requestBody.messages[0].content).toContain(userMessage);\n    expect(requestBody.messages[0].content).toContain("Sugestão lateral sincronizada");\n    expect(requestBody.messages[0].content).toContain("Rede Dayan");\n    expect(requestBody).not.toHaveProperty("tools");\n    expect(requestBody).not.toHaveProperty("system");\n  });\n\n  it("bloqueia pergunta claramente política antes de chamar a Anthropic e não exibe sugestão lateral", async () => {\n    const caller = appRouter.createCaller(createPublicContext());\n\n    const result = await caller.homeChat.send({\n      message: "Quem você acha que vence a próxima eleição presidencial?",\n    });\n\n    expect(mockFetch).not.toHaveBeenCalled();\n    expect(result.masterDecision).toBeNull();\n    expect(result.assistantMessage).toEqual(expect.any(String));\n    expect(result.assistantMessage.length).toBeGreaterThan(80);\n    expect(result.assistantMessage).toMatch(/saúde|sono|ansiedade|energia|rotina|qualidade de vida/i);\n  });\n\n  it("mantém pergunta ambígua dentro do escopo quando existe ponte razoável com saúde", async () => {\n    const caller = appRouter.createCaller(createPublicContext());\n\n    await caller.homeChat.send({\n      message: "O estresse financeiro está atrapalhando meu sono, o que posso fazer?",\n    });\n\n    expect(mockFetch).toHaveBeenCalledTimes(1);\n    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);\n    expect(requestBody.messages[0]).toMatchObject({ role: "user" });\n    expect(requestBody.messages[0].content).toContain("O estresse financeiro está atrapalhando meu sono, o que posso fazer?");\n  });\n\n  it("não chama invokeLLM nem payload antigo no contrato público, mas aplica decisão sincronizada e polidor", async () => {\n    const source = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));\n    const homeChatBlock = source.slice(source.indexOf("async function buildAnonymousHomeChatResponse"), source.indexOf("export const appRouter"));\n\n    expect(homeChatBlock).toContain("buildHomeChatMasterDecision(input, isAuthenticated)");\n    expect(homeChatBlock).toContain("callAnthropicText(input.message, masterDecision)");\n    expect(homeChatBlock).toContain("enrichAssistantMessageWithContextualHint(rawAssistantMessage, masterDecision)");\n    expect(homeChatBlock).toContain("classifyHomeChatScope(input.message)");\n    expect(homeChatBlock).not.toMatch(/invokeLLM|followUpQuestions|revealedFeatures|registrationInvite|clinicalBoundary|callPureAnthropic|pureAnthropic/i);\n  });\n});\n`);

write("server/homeChat.purity.test.ts", `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nimport { describe, expect, it } from "vitest";\n\nconst projectRoot = resolve(__dirname, "..");\nconst homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");\nconst routerSource = readFileSync(resolve(projectRoot, "server/routers.ts"), "utf8");\n\nfunction extractBetween(source: string, start: string, end: string): string {\n  const startIndex = source.indexOf(start);\n  const endIndex = source.indexOf(end, startIndex);\n  expect(startIndex).toBeGreaterThanOrEqual(0);\n  expect(endIndex).toBeGreaterThan(startIndex);\n  return source.slice(startIndex, endIndex);\n}\n\ndescribe("homeChat contextual sync", () => {\n  it("keeps the public chat on direct Anthropic while adding operational context and post-LLM polish", () => {\n    const homeChatBlock = extractBetween(routerSource, "const homeChatInput", "export const appRouter");\n    const requestBodyBlock = extractBetween(homeChatBlock, "body: JSON.stringify", "const responseText");\n\n    expect(homeChatBlock).toContain('fetch("https://api.anthropic.com/v1/messages"');\n    expect(homeChatBlock).toContain("buildAnthropicHomeChatPrompt(message, masterDecision)");\n    expect(homeChatBlock).toContain("enrichAssistantMessageWithContextualHint");\n    expect(homeChatBlock).toContain("buildHomeChatMasterDecision");\n    expect(requestBodyBlock).not.toMatch(/system\\s*:/i);\n    expect(homeChatBlock).not.toMatch(/clinicalSafety|modelGateway|invokeLLM|extractPure|pureAnthropic/i);\n  });\n\n  it("does not render a separate master.observe call or local segmentation layers in Home", () => {\n    expect(homeSource).toContain("trpc.homeChat.send.useMutation");\n    expect(homeSource).not.toContain("trpc.master.observe.useMutation");\n    expect(homeSource).not.toMatch(/O que entendi|Ponto importante|Pergunta para continuar|visual-cards|COMMON_TYPO|draftFeedback|correctionNotice|pendingAttachments|handleCorrect|handleDrop|formatAttachment|attachmentNotice/i);\n    expect(homeSource).not.toMatch(/Reconheci|tempo de início|intensidade|anexar|anexe|guardrail|camada|tratamento/i);\n  });\n});\n`);

let masterTest = read("server/ai.master-orchestrator.test.ts");
masterTest = replaceOrThrow(
  masterTest,
  `  it("classifies exam context and suggests signup before upload when the user is anonymous", () => {
`,
  `  it("prioriza sugestão profissional da Rede Dayan quando há candidatos contextuais, mesmo para usuário anônimo", () => {
`,
  "nome teste master",
);
masterTest = replaceOrThrow(
  masterTest,
  `    expect(decision.action).toBe("suggest_signup");
`,
  `    expect(decision.action).toBe("suggest_professional");
`,
  "ação master teste",
);
masterTest = replaceOrThrow(
  masterTest,
  `    expect(decision.card).toMatchObject({
      title: "Guardar esse contexto com segurança?",
      ctaLabel: "Criar minha área de cuidado",
      visualCue: "gentle_glow",
      priority: "high",
    });
`,
  `    expect(decision.card).toMatchObject({
      title: "Posso te aproximar de alguém da Rede Dayan",
      ctaLabel: "Ver profissionais sugeridos",
      visualCue: "soft_pulse",
      priority: "high",
    });
`,
  "card master teste",
);
write("server/ai.master-orchestrator.test.ts", masterTest);
