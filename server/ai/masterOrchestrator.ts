export type MasterAction = "none" | "suggest_signup" | "suggest_upload" | "suggest_professional" | "suggest_product" | "show_form" | "show_card";

export type MasterIntent =
  | "greeting"
  | "symptom_context"
  | "exam_context"
  | "appointment_context"
  | "product_context"
  | "profile_context"
  | "emotional_context"
  | "unknown";

export type MasterVisualCue = "gentle_glow" | "lift_fade" | "soft_pulse" | "quiet_slide";

export type MasterSuggestionCard = {
  title: string;
  description: string;
  ctaLabel: string;
  href?: string;
  visualCue: MasterVisualCue;
  priority: "low" | "medium" | "high";
};

export type MasterProfessionalCandidate = {
  name: string;
  specialty: string;
  city: string;
  state: string;
  modality: string;
  score?: number;
  distanceKm?: number | null;
};

export type MasterProductCandidate = {
  id: string | number;
  name: string;
  category?: string | null;
  commercialNotice?: string | null;
};

export type MasterDecision = {
  intent: MasterIntent;
  action: MasterAction;
  confidence: "low" | "medium" | "high";
  shouldInterrupt: boolean;
  reason: string;
  card: MasterSuggestionCard | null;
  professionalCandidates: MasterProfessionalCandidate[];
  productCandidates: MasterProductCandidate[];
  opportunities: {
    signup: boolean;
    upload: boolean;
    professional: boolean;
    product: boolean;
    form: boolean;
  };
  animation: {
    preset: "graceful_suggestion";
    enter: "fade-rise-scale";
    glow: "soft-aura";
    attentionDelayMs: number;
  };
};

export type MasterObservationInput = {
  message: string;
  route?: string | null;
  isAuthenticated?: boolean;
  city?: string | null;
  state?: string | null;
  lat?: number | null;
  lng?: number | null;
  professionalCandidates?: MasterProfessionalCandidate[];
  productCandidates?: MasterProductCandidate[];
};

const symptomTerms = ["dor", "cansaço", "fadiga", "sono", "ansiedade", "estresse", "glicose", "pressão", "hormônio", "tireoide", "intestino", "enxaqueca", "inflamação", "peso"];
const examTerms = ["exame", "hemograma", "vitamina", "colesterol", "glicemia", "ferritina", "laudo", "resultado", "pdf", "laboratório"];
const appointmentTerms = ["consulta", "consultas", "médico", "medico", "nutricionista", "farmacêutico", "profissional", "profissionais", "agendar", "especialista", "especialistas", "rede dayan", "dayan", "ligado ao dayan", "ligados ao dayan", "lista de profissionais"];
const productTerms = ["produto", "comprar", "suplemento", "kit", "planner", "monitoramento", "marketplace", "loja"];
const profileTerms = ["meu perfil", "minha história", "minha rotina", "histórico", "dados", "cadastro", "acompanhar"];
const emotionalTerms = ["medo", "preocupado", "preocupada", "triste", "nervoso", "nervosa", "perdido", "perdida", "angústia", "angustia"];

function includesAny(normalized: string, terms: string[]) {
  return terms.some((term) => normalized.includes(term));
}

function normalizeMasterText(message: string) {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const professionalRolePattern = /\b(medico|medica|clinico geral|clinica geral|ortopedista|traumatologista|cardiologista|dermatologista|endocrinologista|gastroenterologista|gastro|ginecologista|obstetra|neurologista|neuro|oftalmologista|oculista|otorrinolaringologista|otorrino|pediatra|pneumologista|psiquiatra|urologista|nefrologista|reumatologista|oncologista|hematologista|infectologista|geriatra|gerontologista|angiologista|vascular|cirurgiao|cirurgia|proctologista|coloproctologista|alergista|imunologista|nutrologo|nutrologa|fisiatra|mastologista|hepatologista|neonatologista|intensivista|radiologista|anestesista|anestesiologista|homeopata|acupunturista|nutricionista|fisioterapeuta|fisioterapia|psicologo|psicologa|psicologia|terapeuta|terapia|fonoaudiologo|fonoaudiologa|fono|dentista|odontologista|odontologia|farmaceutico|farmaceutica|enfermeiro|enfermeira|biomedico|biomedica|educador fisico|personal trainer|personal|quiropraxista|osteopata|naturopata|terapeuta ocupacional|profissional|profissionais|especialista|especialistas|doutor|doutora|dr|dra|clinica|consultorio)s?\b/;
const professionalRequestPattern = /\b(quero|queria|preciso|gostaria|procuro|busco|encontro|consigo|indique|indicar|indica|sugira|sugerir|recomende|recomendacao|recomendacoes|lista|opcoes|opcao|agendar|marcar|consulta|consultar|encaminhar|aproximar)\b/;
const proximityPattern = /\b(perto de mim|na minha cidade|aqui perto|proximo de mim|proxima de mim|proximos de mim|proximas de mim|perto daqui|perto da minha casa|na minha regiao|aqui na regiao|na minha area|por aqui|nessa regiao|nesta cidade|onde eu moro|onde moro|no meu bairro|perto de casa)\b/;
const dayanNetworkPattern = /\b(rede dayan|dayan|dr dayan|doutor dayan|ligado ao dayan|ligados ao dayan)\b/;
const uploadRequestPattern = /\b(anexar|enviar|mandar|subir|upload|carregar|organizar|ler|interpretar|avaliar)\b.*\b(exame|exames|laudo|laudos|pdf|resultado|resultados)\b|\b(exame|exames|laudo|laudos|pdf|resultado|resultados)\b.*\b(anexar|enviar|mandar|subir|upload|carregar|organizar|ler|interpretar|avaliar)\b/;
const signupRequestPattern = /\b(cadastrar|cadastro|entrar|login|criar conta|minha area|meu perfil|guardar|salvar|acompanhar|historico|linha do tempo|continuidade)\b/;
const formRequestPattern = /\b(formulario|questionario|organizar isso|organizar essas informacoes|mapear|checklist|triagem|resumo para consulta)\b/;

export function hasExplicitProfessionalSuggestionRequest(message: string) {
  const normalized = normalizeMasterText(message);
  if (!normalized) return false;
  if (dayanNetworkPattern.test(normalized)) return true;
  if (proximityPattern.test(normalized) && professionalRolePattern.test(normalized)) return true;
  if (professionalRequestPattern.test(normalized) && professionalRolePattern.test(normalized)) return true;
  if (/\bonde\s+(?:consigo|encontro|acho|tem)\b/.test(normalized) && professionalRolePattern.test(normalized)) return true;
  // "tem ortopedista?" or "vc pode me dizer se tem ortopedista" — any question about a professional
  if (/\b(tem|existe|ha|conhece|sabe|pode me dizer|pode me indicar|me indica|me diz)\b/.test(normalized) && professionalRolePattern.test(normalized)) return true;
  // Just mentioning a professional role with proximity is enough
  if (professionalRolePattern.test(normalized) && /\b(perto|proximo|proxima|regiao|cidade|bairro|aqui)\b/.test(normalized)) return true;
  return false;
}

function hasExplicitUploadRequest(message: string) {
  return uploadRequestPattern.test(normalizeMasterText(message));
}

function hasExplicitSignupRequest(message: string) {
  return signupRequestPattern.test(normalizeMasterText(message));
}

function hasExplicitFormRequest(message: string) {
  return formRequestPattern.test(normalizeMasterText(message));
}

export function classifyMasterIntent(message: string): MasterIntent {
  const normalized = normalizeMasterText(message);
  if (/^(oi|ola|bom dia|boa tarde|boa noite)(\b|,|\s|$)/.test(normalized.trim())) return "greeting";
  if (includesAny(normalized, emotionalTerms)) return "emotional_context";
  if (includesAny(normalized, examTerms)) return "exam_context";
  if (includesAny(normalized, appointmentTerms)) return "appointment_context";
  if (includesAny(normalized, productTerms)) return "product_context";
  if (includesAny(normalized, profileTerms)) return "profile_context";
  if (includesAny(normalized, symptomTerms)) return "symptom_context";
  return "unknown";
}

function chooseSpecialty(intent: MasterIntent, message: string) {
  const normalized = normalizeMasterText(message);
  if (normalized.includes("sono") || normalized.includes("ansiedade") || normalized.includes("estresse")) return "Medicina do sono";
  if (normalized.includes("glicose") || normalized.includes("tireoide") || normalized.includes("hormon")) return "Endocrinologia";
  if (normalized.includes("intestino") || normalized.includes("suplemento") || normalized.includes("peso")) return "Nutrição";
  if (intent === "exam_context") return "medicina funcional";
  return "medicina funcional";
}

export function buildMasterDecision(input: MasterObservationInput): MasterDecision {
  const intent = classifyMasterIntent(input.message);
  const authenticated = Boolean(input.isAuthenticated);
  const hasProfessionals = Boolean(input.professionalCandidates?.length);
  const hasProducts = Boolean(input.productCandidates?.length);
  const specialty = chooseSpecialty(intent, input.message);
  const explicitUploadRequest = hasExplicitUploadRequest(input.message);
  const explicitSignupRequest = hasExplicitSignupRequest(input.message);
  const explicitFormRequest = hasExplicitFormRequest(input.message);

  let action: MasterAction = "none";
  let confidence: MasterDecision["confidence"] = "medium";
  let reason = "A IA Master apenas observou o contexto e não encontrou uma intervenção útil neste momento.";
  let card: MasterSuggestionCard | null = null;

  // NO REGEX GATING — if professionals were found in the DB, always suggest them.
  // The LLM decides whether to mention them in the response text.
  const opportunities = {
    signup: !authenticated && explicitSignupRequest,
    upload: explicitUploadRequest,
    professional: hasProfessionals, // Always true when DB returned results
    product: hasProducts, // Always true when products exist
    form: explicitFormRequest,
  };

  if (opportunities.professional && hasProfessionals) {
    action = "suggest_professional";
    confidence = "high";
    const location = input.city && input.state ? ` em ${input.city}-${input.state}` : " do Diretório Nacional";
    reason = `Profissionais encontrados no banco de dados${location}. O LLM decidirá se menciona com base no contexto da conversa.`;
    card = {
      title: "Encontrei profissionais no Diretório Nacional",
      description: `Opções disponíveis priorizando ${specialty.toLowerCase()} e proximidade quando a localização está disponível.`,
      ctaLabel: "Ver profissionais",
      href: "/diretorio-nacional",
      visualCue: "soft_pulse",
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
    action = "suggest_product";
    confidence = "medium";
    reason = "Produtos disponíveis no Marketplace. O LLM decidirá se menciona com base no contexto.";
    card = {
      title: "Temos opções no Marketplace",
      description: "Opções educativas e de autocuidado disponíveis. Não substituem avaliação profissional.",
      ctaLabel: "Ver opções",
      href: "/marketplace",
      visualCue: "gentle_glow",
      priority: "medium",
    };
  } else if (opportunities.form) {
    action = "show_form";
    confidence = "medium";
    reason = "A conversa contém dados suficientes para sugerir um formulário curto que estrutura histórico, objetivo e sinais relevantes.";
    card = {
      title: "Quer organizar isso em 60 segundos?",
      description: "Um formulário breve pode transformar sua mensagem em um mapa mais claro para acompanhar ou levar à consulta.",
      ctaLabel: "Abrir formulário inteligente",
      href: "/clareza?intencao=formulario",
      visualCue: "quiet_slide",
      priority: "medium",
    };
  }

  return {
    intent,
    action,
    confidence,
    shouldInterrupt: false,
    reason,
    card,
    professionalCandidates: (input.professionalCandidates ?? []).slice(0, 4),
    productCandidates: (input.productCandidates ?? []).slice(0, 3),
    opportunities,
    animation: {
      preset: "graceful_suggestion",
      enter: "fade-rise-scale",
      glow: "soft-aura",
      attentionDelayMs: 240,
    },
  };
}
