import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";
import { DOUTORELO_SYSTEM_KNOWLEDGE } from "./ai/systemKnowledge";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addClinicalMemoryEvent,
  addMarketplaceCartItem,
  createCareJourneySession,
  createHealthConversation,
  getCareJourneySession,
  getMarketplaceCart,
  getMarketplaceItemDetail,
  getNationalHealthDirectorySummary,
  getLongitudinalClinicalCore,
  getPatientDashboard,
  getPatientMemorySummary,
  recommendDayanNetworkProfessionals,
  resolveDayanNetworkProfessionalLocationFromMessage,
  listAllCareAppointments,
  listAllMarketplaceOrders,
  listBookedAppointmentsForProfessional,
  listMarketplaceCatalog,
  listPatientAppointments,
  listPatientMarketplaceOrders,
  listPatientTimeline,
  logAiModelExecution,
  recordCareJourneyFeedback,
  recordDayanRagRetrievalEvent,
  recordHealthMetricSample,
  recordMarketplaceRecommendationEvent,
  registerCalendarConnection,
  registerHealthDataConnection,
  requestCareAppointment,
  requestCareAppointmentSlot,
  reviewMlLearningEvent,
  saveClarityMap,
  simulateMarketplaceCheckout,
  updateCareAppointmentStatus,
  updateMarketplaceCartItem,
  updateMarketplaceInventoryAdmin,
  upsertAppointmentCalendarSync,
  upsertLongitudinalCarePlanItem,
  upsertMarketplaceItemAdmin,
  savePatientHealthProfile,
  createMlImprovementCycle,
  createMlTrainingExample,
  getMlDailyReviewSummary,
  listMlLearningEventsForReview,
  listMlTrainingExamples,
  listNationalHealthProviders,
  recordMlLearningEvent,
  updateCareJourneySession,
  createHealthDirectoryIngestionJob,
  upsertNationalHealthDirectoryPilotProvider,
  upsertNationalHealthDirectoryCoverage,
  getUserByEmail,
  createUserWithPassword,
} from "./db";
import {
  MACHINE_LEARNING_FOUNDATION,
  buildClinicalAIAuditEvent,
  buildClinicalSafetyAssessment,
  buildClinicalSafetyAssessmentWithLLM,
  evaluateClinicalSafetyDataset,
  type ClinicalSafetyAssessment,
} from "./ai/clinicalSafety";
import { buildClarityMapDraftWithLLM } from "./ai/clarityJourney";
import { runCareJourneyModelGateway } from "./ai/modelGateway";
import { buildContinuousIntentAnalysisWithLLM, type HealthIntentType } from "./ai/intentEngine";
import { buildSafeMarketplaceRecommendationsWithLLM } from "./ai/marketplaceRecommendations";
import {
  INTEGRATIVE_DNA_FOUNDATION,
  buildIntegrativeClinicalDNAWithLLM,
  evaluateIntegrativeDNADataset,
} from "./ai/integrativeClinicalDNA";
import {
  answerDayanKnowledgeQuestion,
  getDayanKnowledgeOverview,
  searchDayanKnowledge,
} from "./ai/dayanKnowledge";
import { buildAuditRagContext } from "./ai/ragPipeline";
import { ingestCnesOfficialProfessionals } from "./cnesIngestion";
import { buildMasterDecision, type MasterDecision } from "./ai/masterOrchestrator";
import { enrichAssistantMessageWithContextualHint } from "./ai/homeChatMaestro";



export type AppRole = "patient" | "doctor" | "admin";

export const MARKETPLACE_COMMERCIAL_NOTICE =
  "Produto comercial opcional. Não é prescrição, diagnóstico, tratamento ou substituto de orientação médica.";

export { containsRedFlag } from "./ai/clinicalSafety";

export function resolveAppRole(rawRole: unknown): AppRole {
  const role = String(rawRole ?? "patient");
  if (role === "admin") return "admin";
  if (role === "doctor") return "doctor";
  return "patient";
}

export function buildSafeTriageGuidance(message: string): ClinicalSafetyAssessment {
  return buildClinicalSafetyAssessment({ message, flow: "onboarding_triage" });
}

type ProfessionalCatalogItem = {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  approach: string;
  focus: string[];
  availability: string[];
  bio: string;
  languages: string[];
  consultationModes: string[];
  featured: boolean;
  active: boolean;
};

type OfficialContentItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  status: "draft" | "published";
  safeLanguageNotice: string;
};

const makeSlot = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export let professionalCatalog: ProfessionalCatalogItem[] = [
  {
    id: "dra-helena-moura",
    name: "Dra. Helena Moura",
    specialty: "medicina funcional",
    credentials: "CRM 000000 · Pós-graduação em Nutrologia e Saúde da Mulher",
    approach: "Organiza história, hábitos, exames e objetivos sem prometer diagnóstico pela plataforma.",
    focus: ["fadiga", "saúde da mulher", "rotina funcional"],
    availability: [makeSlot(1, 17, 30), makeSlot(2, 9), makeSlot(4, 14, 20)],
    bio: "Atendimento funcional com foco em linha do tempo clínica, hábitos, exames e preparação para decisões compartilhadas com segurança.",
    languages: ["Português", "Inglês"],
    consultationModes: ["Teleconsulta", "Presencial parceiro"],
    featured: true,
    active: true,
  },
  {
    id: "dr-rafael-nogueira",
    name: "Dr. Rafael Nogueira",
    specialty: "Endocrinologia",
    credentials: "CRM 000001 · RQE Endocrinologia e Metabologia",
    approach: "Apoia preparação de consulta sobre metabolismo, energia e exames laboratoriais.",
    focus: ["metabolismo", "exames", "energia"],
    availability: [makeSlot(2, 11, 40), makeSlot(3, 16), makeSlot(6, 10, 10)],
    bio: "Perfil voltado à organização de dúvidas metabólicas, histórico laboratorial e acompanhamento longitudinal com limites educativos claros.",
    languages: ["Português"],
    consultationModes: ["Teleconsulta"],
    featured: false,
    active: true,
  },
  {
    id: "dra-marina-salles",
    name: "Dra. Marina Salles",
    specialty: "Psiquiatria e Sono",
    credentials: "CRM 000002 · RQE Psiquiatria",
    approach: "Ajuda a estruturar contexto de sono, humor e rotina para avaliação profissional.",
    focus: ["sono", "humor", "estresse"],
    availability: [makeSlot(3, 8, 30), makeSlot(4, 15), makeSlot(7, 18, 20)],
    bio: "Atendimento orientado a contexto, hábitos e perguntas para consulta, sem substituir avaliação presencial em situações de risco.",
    languages: ["Português", "Espanhol"],
    consultationModes: ["Teleconsulta", "Retorno breve"],
    featured: true,
    active: true,
  },
];

const doctors = professionalCatalog;

let articles: OfficialContentItem[] = [
  {
    id: "primeira-consulta",
    title: "Como preparar sua primeira consulta funcional",
    category: "Primeiros passos",
    summary: "Organize sintomas, exames, medicamentos e perguntas antes do encontro com o profissional.",
    body: "Conteúdo educativo para preparação de consulta. Não define diagnóstico, tratamento ou conduta clínica.",
    status: "published",
    safeLanguageNotice: "Não é prescrição, diagnóstico ou substituto de orientação médica.",
  },
  {
    id: "sono-energia",
    title: "Sono, energia e rotina: o que merece atenção",
    category: "Sono e energia",
    summary: "Pontos de observação para relatar padrões de sono, energia e rotina ao profissional.",
    body: "Use como roteiro de conversa com profissional habilitado, especialmente se houver piora importante ou sinais de alerta.",
    status: "published",
    safeLanguageNotice: "Material educativo sem recomendação individual de tratamento.",
  },
  {
    id: "exames-perguntas",
    title: "Exames laboratoriais: perguntas úteis para levar ao médico",
    category: "Prevenção",
    summary: "Perguntas úteis para compreender resultados, contexto e próximos passos com segurança.",
    body: "Resultados de exames devem ser interpretados por profissional habilitado considerando história clínica e exame físico.",
    status: "published",
    safeLanguageNotice: "Não substitui interpretação médica individualizada.",
  },
];

const products = [
  { id: "kit-bem-estar", name: "Kit Comercial de Bem-estar Diário", category: "Suplementos e rotina", price: "R$ 189,00", commercialNotice: MARKETPLACE_COMMERCIAL_NOTICE },
  { id: "planner-habitos", name: "Planner Comercial de Hábitos Saudáveis", category: "Educação e organização", price: "R$ 49,00", commercialNotice: "Material comercial educativo. Não define conduta clínica nem substitui acompanhamento profissional." },
  { id: "pack-monitoramento", name: "Pack Comercial de Monitoramento Pessoal", category: "Autocuidado", price: "R$ 129,00", commercialNotice: "Ferramenta comercial de apoio à rotina. Não é prescrição, diagnóstico, tratamento ou conduta clínica; decisões clínicas devem ser tomadas com profissional habilitado." },
];

const consentInput = z.object({
  privacyAccepted: z.boolean(),
  healthDataAccepted: z.boolean(),
  aiGuidanceAccepted: z.boolean().optional(),
  notificationsAccepted: z.boolean().optional(),
});

const biologicalSexInput = z.enum(["female", "male", "intersex", "not_informed"]);
const memoryEventTypeInput = z.enum(["symptom", "exam", "appointment", "medication", "habit", "note", "ai_clarity_map"]);
const memorySourceInput = z.enum(["patient", "ai", "doctor", "document", "system", "apple_health", "apple_watch", "health_connect", "android_device", "wearable", "calendar", "partner_api"]);
const memorySeverityInput = z.enum(["low", "medium", "attention", "urgent"]);
const clarityStatusInput = z.enum(["draft", "ready_for_review", "shared_with_doctor", "archived"]);
const appointmentStatusInput = z.enum(["planned", "requested", "confirmed", "completed", "cancelled"]);

const healthProfileInput = z.object({
  preferredName: z.string().trim().max(120).nullable().optional(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  biologicalSex: biologicalSexInput.optional(),
  mainGoal: z.string().trim().max(180).nullable().optional(),
  knownConditions: z.string().trim().max(3000).nullable().optional(),
  medications: z.string().trim().max(3000).nullable().optional(),
  allergies: z.string().trim().max(3000).nullable().optional(),
  lifestyleNotes: z.string().trim().max(3000).nullable().optional(),
  emotionalContext: z.string().trim().max(3000).nullable().optional(),
  emergencyNotes: z.string().trim().max(3000).nullable().optional(),
});

const conversationInput = z.object({
  channel: z.string().trim().max(80).optional(),
  initialConcern: z.string().trim().max(3000).nullable().optional(),
  latestSummary: z.string().trim().max(3000).nullable().optional(),
  safetySnapshot: z.string().trim().max(3000).nullable().optional(),
});

const memoryEventInput = z.object({
  conversationId: z.number().int().positive().nullable().optional(),
  eventType: memoryEventTypeInput.optional(),
  source: memorySourceInput.optional(),
  severity: memorySeverityInput.optional(),
  title: z.string().trim().min(2).max(180),
  summary: z.string().trim().max(3000).nullable().optional(),
  metadata: z.unknown().optional(),
  occurredAt: z.date().optional(),
});

const clarityMapInput = z.object({
  conversationId: z.number().int().positive().nullable().optional(),
  status: clarityStatusInput.optional(),
  mainConcern: z.string().trim().min(2).max(240),
  symptoms: z.string().trim().max(3000).nullable().optional(),
  patterns: z.string().trim().max(3000).nullable().optional(),
  questionsForDoctor: z.string().trim().max(3000).nullable().optional(),
  suggestedSpecialty: z.string().trim().max(140).nullable().optional(),
  nextStep: z.string().trim().max(3000).nullable().optional(),
  safetyFlags: z.string().trim().max(3000).nullable().optional(),
  confidence: z.string().trim().max(40).optional(),
});

const clarityJourneyInput = z.object({
  message: z.string().trim().min(2).max(1800),
  consent: consentInput,
});

const careJourneyIntakeInput = z.object({
  ageRange: z.string().trim().max(80).optional(),
  biologicalSex: z.string().trim().max(80).optional(),
  mainConcern: z.string().trim().max(280).optional(),
  duration: z.string().trim().max(240).optional(),
  intensity: z.string().trim().max(120).optional(),
  relevantContext: z.string().trim().max(1000).optional(),
  currentMedications: z.string().trim().max(1000).optional(),
  allergies: z.string().trim().max(1000).optional(),
}).partial().optional();

const careJourneyMessageInput = z.object({
  sessionId: z.number().int().positive().nullable().optional(),
  message: z.string().trim().min(2).max(1800),
  consent: consentInput,
  intakeData: careJourneyIntakeInput,
});

const careJourneyFeedbackInput = z.object({
  sessionId: z.number().int().positive(),
  aiExecutionId: z.number().int().positive().nullable().optional(),
  rating: z.enum(["helpful", "unclear", "needs_human"]),
  comment: z.string().trim().max(800).nullable().optional(),
});

const appointmentRequestInput = z.object({
  professionalId: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(2).max(1000),
  preferredSlot: z.string().trim().max(120).optional(),
  slotIso: z.string().datetime().optional(),
  clarityMapId: z.number().int().positive().nullable().optional(),
});

const professionalAdminInput = z.object({
  id: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(180),
  specialty: z.string().trim().min(2).max(140),
  credentials: z.string().trim().min(2).max(240),
  approach: z.string().trim().min(10).max(500),
  focus: z.array(z.string().trim().min(2).max(80)).min(1).max(8),
  availability: z.array(z.string().datetime()).min(1).max(12),
  bio: z.string().trim().min(10).max(1200),
  languages: z.array(z.string().trim().min(2).max(40)).min(1).max(6),
  consultationModes: z.array(z.string().trim().min(2).max(80)).min(1).max(6),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

const nationalHealthProviderListInput = z.object({
  city: z.string().trim().min(2).max(120).optional(),
  state: z.string().trim().length(2).optional(),
  specialty: z.string().trim().min(2).max(180).optional(),
  query: z.string().trim().min(2).max(220).optional(),
  entityType: z.enum(["professional", "clinic", "hospital", "laboratory", "pharmacy", "health_facility", "other", "all"]).optional(),
  status: z.enum(["active", "inactive", "pending_review", "archived", "all"]).optional(),
  verificationStatus: z.enum(["unverified", "source_verified", "manually_verified", "conflict", "rejected", "all"]).optional(),
  activeOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(300).optional(),
}).optional();

const nationalHealthDirectoryPilotInput = z.object({
  displayName: z.string().trim().min(2).max(220),
  legalName: z.string().trim().max(220).nullable().optional(),
  entityType: z.enum(["professional", "clinic", "hospital", "laboratory", "pharmacy", "health_facility", "other"]).default("professional"),
  professionalType: z.string().trim().min(2).max(120).default("health_professional"),
  primarySpecialty: z.string().trim().max(180).nullable().optional(),
  documentType: z.enum(["cpf_masked", "cnpj_masked", "public_registry", "not_collected"]).default("not_collected"),
  documentMasked: z.string().trim().max(80).nullable().optional(),
  councilType: z.enum(["crm", "cro", "crn", "crefito", "crp", "coren", "crf", "crfa", "cress", "other", "not_applicable"]).default("not_applicable"),
  councilNumber: z.string().trim().max(80).nullable().optional(),
  councilState: z.string().trim().length(2).nullable().optional(),
  licenseStatus: z.string().trim().max(120).nullable().optional(),
  cnesCode: z.string().trim().max(32).nullable().optional(),
  establishmentType: z.string().trim().max(160).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  publicSummary: z.string().trim().max(2000).nullable().optional(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2),
  municipalityCode: z.string().trim().max(7).nullable().optional(),
  neighborhood: z.string().trim().max(160).nullable().optional(),
  addressLine: z.string().trim().max(260).nullable().optional(),
  postalCode: z.string().trim().max(16).nullable().optional(),
  lat: z.string().trim().max(32).nullable().optional(),
  lng: z.string().trim().max(32).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().max(320).nullable().optional(),
  whatsapp: z.string().trim().max(40).nullable().optional(),
  website: z.string().trim().url().max(1024).nullable().optional(),
  modality: z.enum(["presential", "online", "both"]).default("both"),
  sourceConfidenceScore: z.number().int().min(0).max(100).default(40),
  qualityScore: z.number().int().min(0).max(100).default(40),
  verificationStatus: z.enum(["unverified", "source_verified", "manually_verified", "conflict", "rejected"]).default("unverified"),
  status: z.enum(["active", "inactive", "pending_review", "archived"]).default("pending_review"),
  active: z.number().int().min(0).max(1).default(1),
  verified: z.number().int().min(0).max(1).default(0),
  specialties: z.array(z.object({
    specialtyName: z.string().trim().min(2).max(180),
    specialtyCode: z.string().trim().max(80).nullable().optional(),
    taxonomySystem: z.string().trim().min(2).max(80).default("manual"),
    isPrimary: z.number().int().min(0).max(1).default(0),
    sourceName: z.string().trim().max(160).nullable().optional(),
    confidenceScore: z.number().int().min(0).max(100).default(40),
  })).max(12).optional(),
  sources: z.array(z.object({
    sourceKey: z.string().trim().min(2).max(120),
    sourceName: z.string().trim().min(2).max(180),
    sourceKind: z.enum(["official_public", "public_registry", "commercial", "manual", "partner", "social_opt_in", "other"]).default("manual"),
    externalId: z.string().trim().max(160).nullable().optional(),
    sourceUrl: z.string().trim().url().max(1024).nullable().optional(),
    reliability: z.enum(["primary", "secondary", "enrichment", "unverified"]).default("unverified"),
    fieldCoverage: z.string().trim().max(2000).nullable().optional(),
    confidenceScore: z.number().int().min(0).max(100).default(40),
  })).max(8).optional(),
  evidences: z.array(z.object({
    evidenceKind: z.enum(["identity", "license", "address", "contact", "specialty", "facility", "geolocation", "coverage", "other"]).default("other"),
    fieldName: z.string().trim().min(2).max(120),
    fieldValueSnapshot: z.string().trim().max(2000).nullable().optional(),
    rawPayloadSnapshot: z.string().trim().max(4000).nullable().optional(),
    sourceUrl: z.string().trim().url().max(1024).nullable().optional(),
    confidenceScore: z.number().int().min(0).max(100).default(40),
  })).max(20).optional(),
});

const nationalHealthDirectoryIngestionJobInput = z.object({
  sourceKey: z.string().trim().min(2).max(120),
  sourceName: z.string().trim().min(2).max(180),
  sourceKind: z.enum(["official_public", "public_registry", "commercial", "manual", "partner", "social_opt_in", "other"]).default("manual"),
  scopeCountry: z.string().trim().length(2).default("BR"),
  scopeState: z.string().trim().length(2).nullable().optional(),
  scopeCity: z.string().trim().max(120).nullable().optional(),
  status: z.enum(["queued", "running", "completed", "completed_with_errors", "failed", "cancelled"]).default("queued"),
});

const cnesOfficialProfessionalRecordInput = z.object({
  displayName: z.string().trim().min(2).max(220),
  state: z.string().trim().length(2),
  city: z.string().trim().min(2).max(120),
  municipalityCode: z.string().trim().max(7).nullable().optional(),
  cnesCode: z.string().trim().min(1).max(32),
  cboCode: z.string().trim().max(80).nullable().optional(),
  primarySpecialty: z.string().trim().max(180).nullable().optional(),
  councilType: z.enum(["crm", "other", "not_applicable"]).nullable().optional(),
  councilNumber: z.string().trim().max(80).nullable().optional(),
  councilState: z.string().trim().length(2).nullable().optional(),
  licenseStatus: z.string().trim().max(120).nullable().optional(),
  competence: z.string().trim().regex(/^\d{6}$/),
  sourcePath: z.string().trim().max(512).nullable().optional(),
  sourceUrl: z.string().trim().url().max(1024).nullable().optional(),
  externalId: z.string().trim().min(8).max(160),
  rawEvidence: z.record(z.string(), z.unknown()).nullable().optional(),
});

const cnesOfficialIngestionInput = z.object({
  records: z.array(cnesOfficialProfessionalRecordInput).min(1).max(2000),
  state: z.string().trim().length(2).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  competence: z.string().trim().regex(/^\d{6}$/).nullable().optional(),
  dryRun: z.boolean().default(true),
  limit: z.number().int().min(1).max(2000).optional(),
});

const nationalHealthDirectoryCoverageInput = z.object({
  sourceKey: z.string().trim().min(2).max(120),
  sourceName: z.string().trim().min(2).max(180),
  state: z.string().trim().length(2),
  city: z.string().trim().min(2).max(120),
  municipalityCode: z.string().trim().max(7).nullable().optional(),
  providerCount: z.number().int().min(0).max(5_000_000).default(0),
  professionalCount: z.number().int().min(0).max(5_000_000).default(0),
  facilityCount: z.number().int().min(0).max(5_000_000).default(0),
  coverageScore: z.number().int().min(0).max(100).default(0),
  dataFreshnessDays: z.number().int().min(0).max(10000).default(0),
  status: z.enum(["queued", "running", "completed", "completed_with_errors", "failed", "cancelled"]).default("completed"),
});

const contentAdminInput = z.object({
  id: z.string().trim().min(2).max(120),
  title: z.string().trim().min(4).max(180),
  category: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20).max(4000),
  status: z.enum(["draft", "published"]),
  safeLanguageNotice: z.string().trim().min(10).max(300),
});

const appointmentAdminUpdateInput = z.object({
  id: z.number().int().positive(),
  status: appointmentStatusInput,
  notes: z.string().trim().max(2000).nullable().optional(),
});

const explainableClinicalInput = z.object({
  message: z.string().trim().min(2).max(1800),
});

const integrativeClinicalDNAInput = z.object({
  message: z.string().trim().min(2).max(1800),
  profileContext: z.object({
    mainGoal: z.string().trim().max(500).nullable().optional(),
    knownConditions: z.string().trim().max(1200).nullable().optional(),
    medications: z.string().trim().max(1200).nullable().optional(),
    allergies: z.string().trim().max(800).nullable().optional(),
    lifestyleNotes: z.string().trim().max(1800).nullable().optional(),
    emotionalContext: z.string().trim().max(1000).nullable().optional(),
    recentCareThemes: z.array(z.string().trim().min(2).max(120)).max(8).optional(),
  }).nullable().optional(),
});

const dayanKnowledgeSearchInput = z.object({
  query: z.string().trim().min(2).max(600),
  limit: z.number().int().min(1).max(20).optional(),
  theme: z.string().trim().min(2).max(120).nullable().optional(),
  safetyOnly: z.boolean().optional(),
});

const mlReviewFilterInput = z.object({
  limit: z.number().int().min(1).max(120).optional(),
  onlyCandidates: z.boolean().optional(),
  label: z.enum(["excellent", "good", "generic", "unsafe", "too_long", "not_useful", "needs_human_review", "unknown", "all"]).optional(),
}).optional();

const mlHumanReviewInput = z.object({
  id: z.number().int().positive(),
  humanLabel: z.enum(["excellent", "good", "bad", "generic", "unsafe", "too_long", "not_useful", "training_candidate", "rejected"]),
  reviewerNotes: z.string().trim().max(1400).nullable().optional(),
  isTrainingCandidate: z.boolean().optional(),
});

const mlTrainingExampleInput = z.object({
  learningEventId: z.number().int().positive().nullable().optional(),
  inputSnapshot: z.string().trim().min(5).max(8000),
  expectedOutput: z.string().trim().max(8000).nullable().optional(),
  critique: z.string().trim().max(2400).nullable().optional(),
  status: z.enum(["draft", "review_ready", "approved", "promoted", "rejected", "archived"]).optional(),
  exampleType: z.string().trim().min(2).max(80).optional(),
});

const mlImprovementCycleInput = z.object({
  triggeredBy: z.string().trim().min(2).max(160).optional(),
  notes: z.string().trim().max(2400).nullable().optional(),
  status: z.enum(["open", "reviewing", "promoting", "completed", "cancelled"]).optional(),
}).optional();

const marketplaceListInput = z.object({
  categorySlug: z.string().trim().min(2).max(120).optional(),
  kind: z.enum(["product", "service"]).optional(),
  query: z.string().trim().max(120).optional(),
  includeInactive: z.boolean().optional(),
}).optional();

const marketplaceCartMutationInput = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().min(0).max(12).default(1),
});

const marketplaceCheckoutInput = z.object({
  patientContextNote: z.string().trim().max(1200).nullable().optional(),
  idempotencyKey: z.string().trim().min(8).max(128).nullable().optional(),
}).optional();

const marketplaceRecommendationInput = z.object({
  itemId: z.number().int().positive().nullable().optional(),
  rationale: z.string().trim().min(10).max(1200).nullable().optional(),
  consentSnapshot: z.string().trim().max(1200).nullable().optional(),
});

const marketplaceAdminItemInput = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  kind: z.enum(["product", "service"]).default("product"),
  categoryId: z.number().int().positive().nullable().optional(),
  partnerId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(3).max(220),
  subtitle: z.string().trim().max(260).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  claimReviewNotes: z.string().trim().max(2000).nullable().optional(),
  commercialNotice: z.string().trim().max(800).nullable().optional(),
  priceCents: z.number().int().min(0).max(2_000_000).default(0),
  currency: z.string().trim().length(3).default("BRL"),
  publicationStatus: z.enum(["draft", "published", "inactive"]).default("draft"),
  eligibility: z.enum(["general", "requires_profile", "requires_professional_context", "restricted"]).default("general"),
  inventoryPolicy: z.enum(["track_stock", "unlimited", "service_capacity"]).default("track_stock"),
  tags: z.string().trim().max(1000).nullable().optional(),
  imageUrl: z.string().trim().url().max(1024).nullable().optional(),
  requiresConsent: z.number().int().min(0).max(1).default(1),
  featured: z.number().int().min(0).max(1).default(0),
});

const marketplaceInventoryInput = z.object({
  itemId: z.number().int().positive(),
  stockOnHand: z.number().int().min(0).max(100000),
  lowStockThreshold: z.number().int().min(0).max(10000).optional(),
  restockNote: z.string().trim().max(1200).nullable().optional(),
});

const integrationProviderInput = z.enum(["apple_health", "apple_watch", "health_connect", "android_wearable", "google_fit", "manual_entry", "document_upload", "google_calendar", "apple_calendar", "outlook_calendar", "partner_api"]);
const integrationStatusInput = z.enum(["not_connected", "pending_consent", "connected", "paused", "revoked", "error"]);
const healthMetricKindInput = z.enum(["steps", "heart_rate", "resting_heart_rate", "heart_rate_variability", "sleep_duration", "sleep_quality", "blood_oxygen", "respiratory_rate", "body_temperature", "weight", "blood_pressure_systolic", "blood_pressure_diastolic", "glucose", "menstrual_cycle", "mindfulness_minutes", "workout_minutes", "symptom_score", "energy_score", "mood_score", "custom"]);
const carePlanDomainInput = z.enum(["prevention", "symptoms", "medication", "supplement", "nutrition", "movement", "sleep", "mental_health", "exam_follow_up", "appointment_preparation", "device_monitoring", "education", "other"]);
const carePlanStatusInput = z.enum(["planned", "active", "paused", "completed", "cancelled", "needs_review"]);
const calendarProviderInput = z.enum(["google_calendar", "apple_calendar", "outlook_calendar", "manual"]);
const calendarSyncStatusInput = z.enum(["not_synced", "queued", "synced", "conflict", "failed", "revoked"]);

const healthConnectionInput = z.object({
  provider: integrationProviderInput,
  displayName: z.string().trim().min(2).max(180),
  status: integrationStatusInput.optional(),
  deviceModel: z.string().trim().max(180).nullable().optional(),
  externalAccountRef: z.string().trim().max(256).nullable().optional(),
  permissions: z.unknown().optional(),
  consentSnapshot: z.unknown().optional(),
  metadata: z.unknown().optional(),
});

const metricSampleInput = z.object({
  connectionId: z.number().int().positive().nullable().optional(),
  kind: healthMetricKindInput,
  value: z.string().trim().min(1).max(120),
  unit: z.string().trim().max(40).nullable().optional(),
  source: memorySourceInput.optional(),
  confidence: z.string().trim().max(40).optional(),
  startedAt: z.date().optional(),
  endedAt: z.date().nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
  metadata: z.unknown().optional(),
});

const carePlanItemInput = z.object({
  id: z.number().int().positive().optional(),
  clarityMapId: z.number().int().positive().nullable().optional(),
  appointmentId: z.number().int().positive().nullable().optional(),
  domain: carePlanDomainInput.optional(),
  status: carePlanStatusInput.optional(),
  title: z.string().trim().min(2).max(220),
  description: z.string().trim().max(3000).nullable().optional(),
  rationale: z.string().trim().max(3000).nullable().optional(),
  ownerRole: z.string().trim().max(80).optional(),
  recurrenceRule: z.string().trim().max(240).nullable().optional(),
  targetMetricKind: healthMetricKindInput.nullable().optional(),
  targetValue: z.string().trim().max(120).nullable().optional(),
  safetyBoundary: z.string().trim().max(2000).nullable().optional(),
  startsAt: z.date().nullable().optional(),
  dueAt: z.date().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  metadata: z.unknown().optional(),
});

const calendarConnectionInput = z.object({
  provider: calendarProviderInput,
  displayName: z.string().trim().min(2).max(180),
  status: integrationStatusInput.optional(),
  externalAccountRef: z.string().trim().max(256).nullable().optional(),
  defaultCalendarExternalId: z.string().trim().max(256).nullable().optional(),
  permissions: z.unknown().optional(),
  consentSnapshot: z.unknown().optional(),
  metadata: z.unknown().optional(),
});

const appointmentCalendarSyncInput = z.object({
  appointmentId: z.number().int().positive(),
  connectionId: z.number().int().positive().nullable().optional(),
  provider: calendarProviderInput,
  status: calendarSyncStatusInput.optional(),
  externalEventId: z.string().trim().max(256).nullable().optional(),
  externalEventUrl: z.string().trim().url().max(1024).nullable().optional(),
  conflictSnapshot: z.unknown().optional(),
  metadata: z.unknown().optional(),
});

const locationPermissionStatusInput = z.enum(["granted", "denied", "unavailable", "prompt", "not_requested"]);

const homeChatInput = z.object({
  message: z.string().trim().min(1).max(1800),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4000),
  })).max(50).optional(),
  route: z.string().trim().max(180).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(2).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  proximityIntentWithoutExplicitCity: z.boolean().optional(),
  locationPermissionStatus: locationPermissionStatusInput.optional(),
});

const masterObservationInput = z.object({
  message: z.string().trim().min(2).max(1800),
  route: z.string().trim().max(180).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(2).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  proximityIntentWithoutExplicitCity: z.boolean().optional(),
  locationPermissionStatus: locationPermissionStatusInput.optional(),
});


type HomeChatLocationAwareInput = z.infer<typeof homeChatInput> | z.infer<typeof masterObservationInput>;

function normalizeLocationText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function resolveHomeChatInputLocation<T extends HomeChatLocationAwareInput>(input: T): Promise<T> {
  const resolvedLocation = await resolveDayanNetworkProfessionalLocationFromMessage(input.message);
  const explicitCity = input.city?.trim();
  const explicitState = input.state?.trim().toUpperCase();

  if (!resolvedLocation && !explicitCity && !explicitState) return input;

  return {
    ...input,
    city: explicitCity || resolvedLocation?.city || input.city,
    state: explicitState || resolvedLocation?.state?.trim().toUpperCase() || input.state,
  };
}

// All regex-based intent detection removed. The LLM handles intent naturally.


type HomeChatScopeDecision = { allowed: true };

export function classifyHomeChatScope(_message: string): HomeChatScopeDecision {
  // All messages go directly to the LLM — the AI handles scope naturally.
  // No regex whitelist/blacklist. Millions of users, infinite ways to ask.
  return { allowed: true };
}


function buildSystemPrompt(masterDecision: MasterDecision | null): string {
  const lines = [
    "Você é o DOUTORELO, assistente inteligente de saúde funcional em português brasileiro.",
    "Responda de forma natural, humana, objetiva e concisa (2-4 frases + perguntas focadas quando necessário).",
    "Não faça diagnóstico, prescrição de dose ou promessa de causa. Mas oriente, acolha, tire dúvidas e sugira caminhos.",
    "NUNCA diga 'como IA', 'não tenho acesso', 'use o Google', 'procure na internet', 'use o Google Maps' ou sugira ferramentas externas. O DoutorElo TEM as ferramentas internamente.",
    "Se a interface exibir um card lateral, mencione de forma sutil que há uma sugestão ao lado.",
    "",
    DOUTORELO_SYSTEM_KNOWLEDGE,
  ];

  // ALWAYS include professional context when DB returned results.
  // The LLM uses its intelligence to decide if/how to mention them.
  if (masterDecision?.professionalCandidates && masterDecision.professionalCandidates.length > 0) {
    const candidates = masterDecision.professionalCandidates
      .slice(0, 4)
      .map((c) => c.name + " — " + c.specialty + " — " + c.city + "-" + c.state)
      .join("; ");
    lines.push("[DADOS DO DIRETÓRIO NACIONAL] Profissionais encontrados no banco de dados: " + candidates + ". Use essa informação se for relevante para a conversa. Se o usuário busca profissional, INFORME que encontrou opções no Diretório Nacional do DoutorElo.");
  }

  // ALWAYS include product context when available.
  if (masterDecision?.productCandidates && masterDecision.productCandidates.length > 0) {
    const productsSummary = masterDecision.productCandidates
      .slice(0, 3)
      .map((p) => p.name + " — " + (p.category ?? "apoio educativo"))
      .join("; ");
    lines.push("[DADOS DO MARKETPLACE] Produtos disponíveis: " + productsSummary + ". Mencione apenas se relevante para o contexto da conversa.");
  }

  if (masterDecision?.card) {
    lines.push("[Card lateral visível] " + masterDecision.card.title + " — " + masterDecision.card.description);
  }

  return lines.join("\n");
}

async function callLLM(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  masterDecision: MasterDecision | null = null
): Promise<string> {
  const systemPrompt = buildSystemPrompt(masterDecision);
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  // Add conversation history for context (last 20 messages max)
  const recentHistory = conversationHistory.slice(-20);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  // Add current message
  messages.push({ role: "user", content: message });

  try {
    const result = await invokeLLM({ messages });
    const content = result.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : "";
    if (!text) {
      throw new TRPCError({ code: "BAD_GATEWAY", message: "LLM respondeu sem texto." });
    }
    return text;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: error instanceof Error ? error.message : "Erro ao chamar LLM.",
    });
  }
}

async function buildHomeChatMasterDecision(input: HomeChatLocationAwareInput, isAuthenticated: boolean) {
  const locationAwareInput = await resolveHomeChatInputLocation(input);

  // ALWAYS fetch professionals from the database — no regex gating.
  // The LLM decides whether to mention them based on context.
  let professionalCandidates: Awaited<ReturnType<typeof recommendDayanNetworkProfessionals>> = [];
  try {
    professionalCandidates = await recommendDayanNetworkProfessionals({
      city: locationAwareInput.city ?? null,
      state: locationAwareInput.state ?? null,
      need: locationAwareInput.message,
      lat: locationAwareInput.lat ?? null,
      lng: locationAwareInput.lng ?? null,
      limit: 4,
    });
  } catch (_e) {
    // If DB fails, continue without professionals — LLM still knows the feature exists
  }

  // ALWAYS include product candidates — LLM decides relevance
  const productCandidates = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    commercialNotice: product.commercialNotice,
  }));

  return buildMasterDecision({
    message: locationAwareInput.message,
    route: locationAwareInput.route ?? null,
    isAuthenticated,
    city: locationAwareInput.city ?? null,
    state: locationAwareInput.state ?? null,
    lat: locationAwareInput.lat ?? null,
    lng: locationAwareInput.lng ?? null,
    professionalCandidates: professionalCandidates.map((professional) => ({
      name: professional.name,
      specialty: professional.specialty,
      city: professional.city,
      state: professional.state,
      modality: professional.modality,
      score: professional.matchScore,
      distanceKm: professional.distanceKm,
    })),
    productCandidates,
  });
}
async function buildAnonymousHomeChatResponse(input: z.infer<typeof homeChatInput>, isAuthenticated = false) {
  const locationAwareInput = await resolveHomeChatInputLocation(input);

  // All messages go directly to the LLM — no regex filtering, no gating.
  // The LLM has full system knowledge and decides how to respond.
  const masterDecision = await buildHomeChatMasterDecision(locationAwareInput, isAuthenticated);
  const rawAssistantMessage = await callLLM(locationAwareInput.message, input.conversationHistory ?? [], masterDecision);
  return {
    assistantMessage: enrichAssistantMessageWithContextualHint(rawAssistantMessage, masterDecision),
    masterDecision,
  };
}
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email já cadastrado" });
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await createUserWithPassword({
          email: input.email,
          name: input.name,
          passwordHash,
        });
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user: { id: user.id, name: user.name, email: user.email } };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user: { id: user.id, name: user.name, email: user.email } };
      }),
  }),
  master: router({
    observe: publicProcedure
      .input(masterObservationInput)
      .mutation(async ({ input, ctx }) => buildHomeChatMasterDecision(input, Boolean(ctx.user))),
  }),
  homeChat: router({
    send: publicProcedure
      .input(homeChatInput)
      .mutation(async ({ input, ctx }) => buildAnonymousHomeChatResponse(input, Boolean(ctx.user))),
  }),
  catalog: router({
    list: publicProcedure.query(() => ({
      doctors: professionalCatalog.filter((professional) => professional.active),
      articles: articles.filter((item) => item.status === "published"),
      products,
    })),
  }),
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => getPatientDashboard(ctx.user.id)),
  }),
  appointments: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const appointments = await listPatientAppointments(ctx.user.id);
      const now = Date.now();
      const upcoming = appointments.filter((appointment) => {
        if (!appointment.scheduledAt) return appointment.status !== "completed" && appointment.status !== "cancelled";
        return new Date(appointment.scheduledAt).getTime() >= now && appointment.status !== "completed" && appointment.status !== "cancelled";
      });
      const history = appointments.filter((appointment) => !upcoming.some((item) => item.id === appointment.id));
      return {
        appointments,
        upcoming,
        history,
        preparation: [
          "Revise sua memória clínica e seus Mapas de Clareza antes da consulta.",
          "Separe exames, medicamentos em uso e dúvidas que deseja discutir.",
          "Procure atendimento de urgência se houver piora importante ou sinais agudos.",
        ],
      };
    }),
  }),
  healthDirectory: router({
    summary: publicProcedure.query(async () => getNationalHealthDirectorySummary()),
    search: publicProcedure
      .input(nationalHealthProviderListInput)
      .query(async ({ input }) => ({
        providers: await listNationalHealthProviders(input ?? {}),
        directoryMode: "national_foundation",
        safetyNotice: "Diretório informativo. Não substitui avaliação clínica, confirmação de agenda, credenciais ou vínculo profissional diretamente nas fontes oficiais.",
      })),
  }),
  professionals: router({
    list: protectedProcedure.query(() => ({
      professionals: professionalCatalog.filter((item) => item.active),
      catalogVersion: "doutorelo-professionals-dev-v2-schedule",
      persistenceNote: "Solicitações de consulta são persistidas na memória longitudinal do usuário. Horários reservados são protegidos contra dupla reserva por profissional e slot.",
    })),
    detail: protectedProcedure
      .input(z.object({ professionalId: z.string().trim().min(2).max(120) }))
      .query(async ({ input }) => {
        const professional = professionalCatalog.find((item) => item.id === input.professionalId && item.active);
        if (!professional) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado no catálogo DOUTORELO." });
        }
        const booked = await listBookedAppointmentsForProfessional(professional.name);
        const bookedSlots = new Set(booked.map((item) => item.scheduledAt?.toISOString()).filter(Boolean));
        return {
          professional,
          slots: professional.availability.map((slotIso) => ({
            slotIso,
            status: bookedSlots.has(slotIso) ? "reserved" : "available",
            label: new Date(slotIso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }),
          })),
          relatedContent: articles.filter((item) => item.status === "published" && item.category),
          safetyNotice: "O agendamento organiza a continuidade do cuidado, mas não substitui avaliação médica em urgências ou sinais de alerta.",
        };
      }),
    myAppointments: protectedProcedure.query(async ({ ctx }) => listPatientAppointments(ctx.user.id)),
    requestAppointment: protectedProcedure
      .input(appointmentRequestInput)
      .mutation(async ({ input, ctx }) => {
        const professional = professionalCatalog.find((item) => item.id === input.professionalId && item.active);
        if (!professional) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado no catálogo DOUTORELO." });
        }
        if (input.slotIso) {
          if (!professional.availability.includes(input.slotIso)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Horário indisponível para este profissional." });
          }
          try {
            return await requestCareAppointmentSlot(ctx.user.id, {
              professionalId: professional.id,
              clarityMapId: input.clarityMapId ?? null,
              doctorName: professional.name,
              specialty: professional.specialty,
              reason: input.reason,
              slotIso: input.slotIso,
              notes: `Horário selecionado: ${input.slotIso}. Solicitação criada pelo catálogo DOUTORELO.`,
            });
          } catch (error) {
            if (error instanceof Error && error.message === "DOUBLE_BOOKING_SLOT_UNAVAILABLE") {
              throw new TRPCError({ code: "CONFLICT", message: "Este horário acabou de ser reservado. Escolha outro slot disponível." });
            }
            throw error;
          }
        }
        return requestCareAppointment(ctx.user.id, {
          clarityMapId: input.clarityMapId ?? null,
          doctorName: professional.name,
          specialty: professional.specialty,
          reason: input.reason,
          notes: `Preferência informada: ${input.preferredSlot ?? "sem horário específico"}. Solicitação criada pelo catálogo DOUTORELO.`,
        });
      }),
  }),
  marketplace: router({
    list: protectedProcedure
      .input(marketplaceListInput)
      .query(async ({ input }) => ({
        items: await listMarketplaceCatalog(input ?? {}),
        safetyNotice: MARKETPLACE_COMMERCIAL_NOTICE,
        checkoutMode: "dev_simulated",
      })),
    detail: protectedProcedure
      .input(z.object({ id: z.number().int().positive().optional(), slug: z.string().trim().min(2).max(160).optional() }))
      .query(async ({ input }) => {
        if (!input.id && !input.slug) throw new TRPCError({ code: "BAD_REQUEST", message: "Informe o id ou slug do item." });
        const item = await getMarketplaceItemDetail(input);
        if (!item || item.publicationStatus !== "published") throw new TRPCError({ code: "NOT_FOUND", message: "Item não encontrado no marketplace." });
        return { item, safetyNotice: MARKETPLACE_COMMERCIAL_NOTICE };
      }),
    cart: protectedProcedure.query(async ({ ctx }) => getMarketplaceCart(ctx.user.id)),
    addToCart: protectedProcedure
      .input(marketplaceCartMutationInput)
      .mutation(async ({ input, ctx }) => addMarketplaceCartItem(ctx.user.id, input)),
    updateCartItem: protectedProcedure
      .input(marketplaceCartMutationInput)
      .mutation(async ({ input, ctx }) => updateMarketplaceCartItem(ctx.user.id, input)),
    checkoutDev: protectedProcedure
      .input(marketplaceCheckoutInput)
      .mutation(async ({ input, ctx }) => simulateMarketplaceCheckout(ctx.user.id, input ?? {})),
    orders: protectedProcedure.query(async ({ ctx }) => ({
      orders: await listPatientMarketplaceOrders(ctx.user.id),
      checkoutMode: "dev_simulated",
    })),
    recommendations: protectedProcedure.query(async ({ ctx }) => {
      const [summary, catalog] = await Promise.all([
        getPatientMemorySummary(ctx.user.id),
        listMarketplaceCatalog({ includeInactive: false }),
      ]);
      const result = await buildSafeMarketplaceRecommendationsWithLLM(
        {
          mainGoal: summary.profile?.mainGoal ?? null,
          knownConditions: summary.profile?.knownConditions ?? null,
          medications: summary.profile?.medications ?? null,
          allergies: summary.profile?.allergies ?? null,
          lifestyleNotes: summary.profile?.lifestyleNotes ?? null,
          emotionalContext: summary.profile?.emotionalContext ?? null,
          recentCareThemes: [
            ...summary.recentEvents.map((event) => event.title),
            ...summary.recentClarityMaps.map((map) => map.mainConcern),
            ...summary.appointments.map((appointment) => appointment.specialty ?? appointment.doctorName ?? "consulta"),
          ].slice(0, 8),
        },
        catalog,
      );
      for (const recommendation of result.recommendations) {
        await recordMarketplaceRecommendationEvent(ctx.user.id, {
          itemId: recommendation.itemId,
          source: result.audit.status === "enhanced" ? "ai" : "profile",
          rationale: recommendation.fitReason,
          consentSnapshot: `policy=${result.audit.policyVersion}; status=${result.audit.status}`,
        });
      }
      return result;
    }),
    recordRecommendation: protectedProcedure
      .input(marketplaceRecommendationInput)
      .mutation(async ({ input, ctx }) => recordMarketplaceRecommendationEvent(ctx.user.id, { ...input, source: "manual" })),
  }),
  clinical: router({
    dayanKnowledgeOverview: protectedProcedure.query(() => getDayanKnowledgeOverview()),
    searchDayanKnowledge: protectedProcedure
      .input(dayanKnowledgeSearchInput)
      .query(({ input }) => ({
        results: searchDayanKnowledge(input).map((result) => ({
          ...result,
          chunk: {
            ...result.chunk,
            text: result.chunk.text.length > 1600 ? `${result.chunk.text.slice(0, 1599)}…` : result.chunk.text,
          },
        })),
      })),
    answerWithDayanKnowledge: protectedProcedure
      .input(dayanKnowledgeSearchInput)
      .mutation(async ({ input }) => answerDayanKnowledgeQuestion(input)),
    explain: protectedProcedure
      .input(explainableClinicalInput)
      .mutation(async ({ input }) => {
        const assessment = await buildClinicalSafetyAssessmentWithLLM({ message: input.message, flow: "appointment_preparation" });
        const trackedAt = new Date().toISOString();
        return {
          assessment,
          explanation: {
            scope: "Apoio educativo para organizar contexto, dúvidas e próximos passos; não emite diagnóstico, prescrição ou conduta médica.",
            riskLevel: assessment.severity,
            uncertainty: assessment.uncertaintyReason,
            redFlags: assessment.redFlag,
            nextStep: assessment.nextStep,
            fallbackToHuman: assessment.fallbackToHuman,
            guardrailDecision: assessment.guardrailDecision,
            safetyActions: assessment.safetyActions,
          },
          auditEvent: buildClinicalAIAuditEvent({ message: input.message, flow: "appointment_preparation" }, assessment, trackedAt),
          trackedAt,
        };
      }),
    integrativeDNA: protectedProcedure
      .input(integrativeClinicalDNAInput)
      .mutation(async ({ input }) => {
        const trackedAt = new Date().toISOString();
        const result = await buildIntegrativeClinicalDNAWithLLM(input);
        return {
          ...result,
          aiCallTracking: {
            flow: "integrative_clinical_dna",
            status: "completed",
            policyVersion: result.audit.policyVersion,
            promptId: result.audit.promptId,
            schemaName: result.audit.schemaName,
            llmEnhanced: result.audit.status === "enhanced",
            auditStatus: result.audit.status,
            postGuardrailViolations: result.audit.postGuardrailViolations,
            evaluationSummary: evaluateIntegrativeDNADataset(),
            trackedAt,
          },
        };
      }),
  }),
  careJourney: router({
    continue: protectedProcedure
      .input(careJourneyMessageInput)
      .mutation(async ({ input, ctx }) => {
        if (!input.consent.privacyAccepted || !input.consent.healthDataAccepted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "LGPD consent is required before running a governed care journey.",
          });
        }

        const clinicalSafetyInput = { message: input.message, flow: "onboarding_triage" as const };
        const safety = await buildClinicalSafetyAssessmentWithLLM(clinicalSafetyInput);
        const trackedAt = new Date().toISOString();
        const auditEvent = buildClinicalAIAuditEvent(clinicalSafetyInput, safety, trackedAt);
        const eventSeverity = safety.redFlag ? "urgent" : safety.fallbackToHuman ? "attention" : safety.guardrailDecision === "ask_for_context" ? "medium" : "low";

        let session = input.sessionId ? await getCareJourneySession(ctx.user.id, input.sessionId) : null;
        if (input.sessionId && !session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Care journey session was not found for this user." });
        }

        if (!session) {
          const conversation = await createHealthConversation(ctx.user.id, {
            channel: "ai_care_journey_core",
            initialConcern: input.message,
            latestSummary: null,
            safetySnapshot: JSON.stringify({ auditEvent, guardrailDecision: safety.guardrailDecision, redFlag: safety.redFlag }),
          });
          session = await createCareJourneySession(ctx.user.id, {
            conversationId: conversation.id,
            status: safety.guardrailDecision === "refuse_and_escalate" ? "waiting_human" : "intake",
            severityLevel: safety.severity,
            confidenceScore: safety.confidence === "high" ? 80 : safety.confidence === "medium" ? 60 : 35,
            policyVersion: safety.aiGovernance.policyVersion,
            consentSnapshot: input.consent,
            escalationFlag: safety.fallbackToHuman,
            escalationReason: safety.fallbackToHuman ? safety.nextStep : null,
            intakeData: input.intakeData ?? { firstMessage: input.message },
            sessionSummary: null,
            redFlagsDetected: { redFlag: safety.redFlag, actions: safety.safetyActions },
          });
        }

        const activeSession = session;
        if (!activeSession) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create or load care journey session." });
        }

        const ragContext = buildAuditRagContext({
          query: input.message,
          limit: 6,
          safetyOnly: safety.redFlag,
        });

        const gatewayResult = await runCareJourneyModelGateway({
          message: input.message,
          safety,
          sessionContext: {
            sessionId: activeSession.id,
            totalTurns: Number(activeSession.totalTurns ?? 0),
            previousSummary: activeSession.sessionSummary,
            intakeData: input.intakeData,
          },
        });

        const patientEvent = await addClinicalMemoryEvent(ctx.user.id, {
          conversationId: activeSession.conversationId ?? null,
          eventType: "note",
          source: "ai",
          severity: eventSeverity,
          title: safety.redFlag ? "Jornada governada: sinal de alerta" : "Jornada governada: nova interação",
          summary: gatewayResult.response.sessionSummary,
          metadata: {
            flow: "ai_care_journey_core",
            sessionId: activeSession.id,
            guardrailDecision: safety.guardrailDecision,
            safetyActions: safety.safetyActions,
            escalationRecommended: gatewayResult.response.escalationRecommended,
            gatewayAuditStatus: gatewayResult.audit.status,
          },
        });

        const modelExecution = await logAiModelExecution(ctx.user.id, {
          sessionId: activeSession.id,
          logicalProvider: gatewayResult.audit.logicalProvider,
          modelCapability: gatewayResult.audit.modelCapability,
          promptId: gatewayResult.audit.promptId,
          schemaName: gatewayResult.audit.schemaName,
          inputTokensEst: gatewayResult.audit.inputTokensEst,
          outputTokensEst: gatewayResult.audit.outputTokensEst,
          latencyMs: gatewayResult.audit.latencyMs,
          status: gatewayResult.audit.executionStatus,
          violationsDetected: gatewayResult.audit.postGuardrailViolations,
          fallbackReason: gatewayResult.audit.reason,
          responseSnapshot: {
            severity: gatewayResult.response.severity,
            confidence: gatewayResult.response.confidence,
            escalationRecommended: gatewayResult.response.escalationRecommended,
            patientCanSaveToMemory: gatewayResult.response.patientCanSaveToMemory,
            ragStatus: ragContext.status,
            ragSourceCount: ragContext.sourceCount,
          },
        });

        const learningEvent = await recordMlLearningEvent({
          userId: ctx.user.id,
          sessionId: activeSession.id,
          aiExecutionId: modelExecution.id,
          source: "care_journey",
          turnIndex: Number(activeSession.totalTurns ?? 0) + 1,
          userInput: input.message,
          aiResponse: gatewayResult.response.assistantMessage,
          normalizedIntent: `${safety.severity}:${safety.guardrailDecision}`,
          redFlagSnapshot: {
            redFlag: safety.redFlag,
            fallbackToHuman: safety.fallbackToHuman,
            guardrailDecision: safety.guardrailDecision,
            safetyActions: safety.safetyActions,
            postGuardrailViolations: gatewayResult.audit.postGuardrailViolations,
          },
          ragContextSnapshot: {
            status: ragContext.status,
            sourceCount: ragContext.sourceCount,
            topScore: ragContext.topScore,
            themes: ragContext.themes,
            chunkIds: ragContext.chunkIds,
          },
          promptVersion: gatewayResult.audit.promptId,
          modelVersion: gatewayResult.audit.modelCapability,
          consentSnapshot: input.consent,
        });

        const ragRetrievalEvent = await recordDayanRagRetrievalEvent({
          userId: ctx.user.id,
          sessionId: activeSession.id,
          aiExecutionId: modelExecution.id,
          learningEventId: learningEvent.id,
          query: input.message,
          retrievedChunkIds: JSON.stringify(ragContext.chunkIds),
          topScore: Math.round(ragContext.topScore),
          sourceCount: ragContext.sourceCount,
          antiHallucinationStatus: ragContext.status,
          citationsSnapshot: JSON.stringify(ragContext.sources.map((source) => ({
            citation: source.citation,
            chunkId: source.chunkId,
            title: source.title,
            url: source.url,
            section: source.section,
            theme: source.theme,
            score: source.score,
          }))),
        });

        const updatedSession = await updateCareJourneySession(ctx.user.id, activeSession.id, {
          status: gatewayResult.response.escalationRecommended ? "waiting_human" : "active",
          severityLevel: gatewayResult.response.severity,
          confidenceScore: gatewayResult.response.confidence === "medium" ? 60 : 35,
          escalationFlag: gatewayResult.response.escalationRecommended,
          escalationReason: gatewayResult.response.escalationReason,
          intakeData: input.intakeData ?? null,
          sessionSummary: gatewayResult.response.sessionSummary,
          redFlagsDetected: { redFlag: safety.redFlag, violations: gatewayResult.audit.postGuardrailViolations, actions: safety.safetyActions },
          totalTurns: Number(activeSession.totalTurns ?? 0) + 1,
        });

        return {
          session: updatedSession,
          patientEvent,
          modelExecution,
          learningEvent,
          ragRetrievalEvent,
          response: gatewayResult.response,
          safety,
          ragContext: {
            status: ragContext.status,
            sourceCount: ragContext.sourceCount,
            themes: ragContext.themes,
            citations: ragContext.sources.map((source) => ({
              citation: source.citation,
              title: source.title,
              url: source.url,
              section: source.section,
              theme: source.theme,
            })),
            safetyNotice: ragContext.safetyNotice,
          },
          aiCallTracking: {
            flow: "ai_care_journey_core",
            status: gatewayResult.audit.executionStatus,
            policyVersion: gatewayResult.audit.policyVersion,
            promptId: gatewayResult.audit.promptId,
            schemaName: gatewayResult.audit.schemaName,
            redFlag: safety.redFlag,
            fallbackToHuman: safety.fallbackToHuman,
            guardrailDecision: safety.guardrailDecision,
            gatewayAudit: gatewayResult.audit,
            clinicalAuditEvent: auditEvent,
            ragAudit: {
              pipelineVersion: ragContext.pipelineVersion,
              status: ragContext.status,
              sourceCount: ragContext.sourceCount,
              topScore: ragContext.topScore,
            },
            trackedAt,
          },
        };
      }),
    feedback: protectedProcedure
      .input(careJourneyFeedbackInput)
      .mutation(async ({ input, ctx }) => {
        const session = await getCareJourneySession(ctx.user.id, input.sessionId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Care journey session was not found for this user." });
        }
        const feedback = await recordCareJourneyFeedback(ctx.user.id, {
          sessionId: input.sessionId,
          aiExecutionId: input.aiExecutionId ?? null,
          rating: input.rating,
          comment: input.comment ?? null,
        });
        return { feedback, accepted: true };
      }),
  }),
  memory: router({
    summary: protectedProcedure.query(async ({ ctx }) => getPatientMemorySummary(ctx.user.id)),
    timeline: protectedProcedure.query(async ({ ctx }) => listPatientTimeline(ctx.user.id)),
    saveProfile: protectedProcedure
      .input(healthProfileInput)
      .mutation(async ({ input, ctx }) => savePatientHealthProfile(ctx.user.id, input)),
    startConversation: protectedProcedure
      .input(conversationInput)
      .mutation(async ({ input, ctx }) => createHealthConversation(ctx.user.id, input)),
    addEvent: protectedProcedure
      .input(memoryEventInput)
      .mutation(async ({ input, ctx }) => addClinicalMemoryEvent(ctx.user.id, input)),
    saveClarityMap: protectedProcedure
      .input(clarityMapInput)
      .mutation(async ({ input, ctx }) => saveClarityMap(ctx.user.id, input)),
  }),
  longitudinal: router({
    core: protectedProcedure.query(async ({ ctx }) => getLongitudinalClinicalCore(ctx.user.id)),
    addCarePlanItem: protectedProcedure
      .input(carePlanItemInput)
      .mutation(async ({ input, ctx }) => upsertLongitudinalCarePlanItem(ctx.user.id, input)),
    recordMetric: protectedProcedure
      .input(metricSampleInput)
      .mutation(async ({ input, ctx }) => recordHealthMetricSample(ctx.user.id, input)),
  }),
  integrations: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const core = await getLongitudinalClinicalCore(ctx.user.id);
      return {
        healthConnections: core.healthConnections,
        calendarConnections: core.calendarConnections,
        readiness: core.readiness,
        supported: {
          health: ["Apple Health", "Apple Watch", "Android Health Connect", "Wearables Android", "Google Fit", "entrada manual", "documentos"],
          calendars: ["Google Calendar", "Apple Calendar", "Outlook Calendar"],
        },
        governance: {
          consentRequired: true,
          revocable: true,
          clinicalBoundary: core.safetyNotice,
          architectureVersion: core.architectureVersion,
        },
      };
    }),
    registerHealthConnection: protectedProcedure
      .input(healthConnectionInput)
      .mutation(async ({ input, ctx }) => registerHealthDataConnection(ctx.user.id, input)),
    registerCalendarConnection: protectedProcedure
      .input(calendarConnectionInput)
      .mutation(async ({ input, ctx }) => registerCalendarConnection(ctx.user.id, input)),
    syncAppointmentCalendar: protectedProcedure
      .input(appointmentCalendarSyncInput)
      .mutation(async ({ input, ctx }) => upsertAppointmentCalendarSync(ctx.user.id, input)),
  }),
  clarity: router({
    analyzeIntent: protectedProcedure
      .input(clarityJourneyInput)
      .mutation(async ({ input, ctx }) => {
        if (!input.consent.privacyAccepted || !input.consent.healthDataAccepted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "LGPD consent is required before unfolding a health journey from free text.",
          });
        }

        const clinicalSafetyInput = { message: input.message, flow: "onboarding_triage" as const };
        const safety = await buildClinicalSafetyAssessmentWithLLM(clinicalSafetyInput);
        const unfolding = await buildContinuousIntentAnalysisWithLLM(input.message, safety);
        const trackedAt = new Date().toISOString();
        const auditEvent = buildClinicalAIAuditEvent(clinicalSafetyInput, safety, trackedAt);
        const safetySnapshot = JSON.stringify({
          auditEvent,
          intentAudit: unfolding.audit,
          redFlag: safety.redFlag,
          fallbackToHuman: safety.fallbackToHuman,
          guardrailDecision: safety.guardrailDecision,
          selectedPaths: unfolding.analysis.nextPaths.map((path) => path.id),
        });
        const conversation = await createHealthConversation(ctx.user.id, {
          channel: "continuous_unfolding_journey",
          initialConcern: input.message,
          latestSummary: unfolding.analysis.liveSummary.whatWeUnderstood,
          safetySnapshot,
        });
        const eventSeverity = safety.redFlag ? "urgent" : safety.fallbackToHuman ? "attention" : safety.guardrailDecision === "ask_for_context" ? "medium" : "low";
        const eventTypeByIntent: Partial<Record<HealthIntentType, "symptom" | "exam" | "habit" | "note">> = {
          symptom: "symptom",
          alert: "symptom",
          exam: "exam",
          habit: "habit",
          prevention: "habit",
          emotional: "note",
          "professional-search": "note",
          general: "note",
        };
        const patientEvent = await addClinicalMemoryEvent(ctx.user.id, {
          conversationId: conversation.id,
          eventType: eventTypeByIntent[unfolding.analysis.intentType] ?? "note",
          source: "ai",
          severity: eventSeverity,
          title: `Jornada contínua: ${unfolding.analysis.mainNeed}`,
          summary: unfolding.analysis.initialResponse,
          metadata: {
            flow: "continuous_unfolding_journey",
            intentType: unfolding.analysis.intentType,
            urgency: unfolding.analysis.urgency,
            domain: unfolding.analysis.domain,
            nextPathIds: unfolding.analysis.nextPaths.map((path) => path.id),
            safetyActions: safety.safetyActions,
            guardrailDecision: safety.guardrailDecision,
            intentAuditStatus: unfolding.audit.status,
          },
        });

        return {
          conversation,
          patientEvent,
          ...unfolding.analysis,
          safety,
          aiCallTracking: {
            flow: "continuous_unfolding_journey",
            status: "completed",
            policyVersion: safety.aiGovernance.policyVersion,
            redFlag: safety.redFlag,
            fallbackToHuman: safety.fallbackToHuman,
            guardrailDecision: safety.guardrailDecision,
            llmEnhanced: safety.llmEnhanced,
            intentEnhanced: unfolding.audit.status === "enhanced",
            intentAudit: unfolding.audit,
            auditEvent,
            trackedAt,
          },
        };
      }),
    generateMap: protectedProcedure
      .input(clarityJourneyInput)
      .mutation(async ({ input, ctx }) => {
        if (!input.consent.privacyAccepted || !input.consent.healthDataAccepted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "LGPD consent is required before generating a clarity map from health data.",
          });
        }

        const clinicalSafetyInput = { message: input.message, flow: "appointment_preparation" as const };
        const safety = await buildClinicalSafetyAssessmentWithLLM(clinicalSafetyInput);
        const clarityDraft = await buildClarityMapDraftWithLLM(input.message, safety);
        const trackedAt = new Date().toISOString();
        const auditEvent = buildClinicalAIAuditEvent(clinicalSafetyInput, safety, trackedAt);
        const safetySnapshot = JSON.stringify({
          auditEvent,
          clarityAudit: clarityDraft.audit,
          redFlag: safety.redFlag,
          fallbackToHuman: safety.fallbackToHuman,
          guardrailDecision: safety.guardrailDecision,
        });
        const conversation = await createHealthConversation(ctx.user.id, {
          channel: "clarity_journey",
          initialConcern: input.message,
          latestSummary: clarityDraft.draft.mainConcern,
          safetySnapshot,
        });
        const eventSeverity = safety.redFlag ? "urgent" : safety.fallbackToHuman ? "attention" : safety.guardrailDecision === "ask_for_context" ? "medium" : "low";
        const patientEvent = await addClinicalMemoryEvent(ctx.user.id, {
          conversationId: conversation.id,
          eventType: "symptom",
          source: "patient",
          severity: eventSeverity,
          title: `Jornada de clareza: ${clarityDraft.draft.mainConcern}`,
          summary: clarityDraft.draft.symptoms ?? clarityDraft.draft.nextStep,
          metadata: {
            flow: "clarity_journey",
            safetyActions: safety.safetyActions,
            guardrailDecision: safety.guardrailDecision,
            clarityAuditStatus: clarityDraft.audit.status,
          },
        });

        const clarityMap = safety.guardrailDecision === "refuse_and_escalate"
          ? null
          : await saveClarityMap(ctx.user.id, {
            conversationId: conversation.id,
            status: safety.guardrailDecision === "ask_for_context" ? "draft" : "ready_for_review",
            mainConcern: clarityDraft.draft.mainConcern,
            symptoms: clarityDraft.draft.symptoms,
            patterns: clarityDraft.draft.patterns,
            questionsForDoctor: clarityDraft.draft.questionsForDoctor,
            suggestedSpecialty: clarityDraft.draft.suggestedSpecialty,
            nextStep: clarityDraft.draft.nextStep,
            safetyFlags: clarityDraft.draft.safetyFlags,
            confidence: clarityDraft.draft.confidence,
          });

        return {
          conversation,
          patientEvent,
          clarityMap,
          draft: clarityDraft.draft,
          assistantMessage: clarityDraft.assistantMessage,
          safety,
          aiCallTracking: {
            flow: "clarity_journey",
            status: "completed",
            policyVersion: safety.aiGovernance.policyVersion,
            redFlag: safety.redFlag,
            fallbackToHuman: safety.fallbackToHuman,
            guardrailDecision: safety.guardrailDecision,
            llmEnhanced: safety.llmEnhanced,
            clarityMapEnhanced: clarityDraft.audit.status === "enhanced",
            clarityAudit: clarityDraft.audit,
            auditEvent,
            trackedAt,
          },
        };
      }),
  }),
  triage: router({
    evaluate: publicProcedure
      .input(z.object({ message: z.string().min(2).max(1800), consent: consentInput }))
      .mutation(async ({ input }) => {
        if (!input.consent.privacyAccepted || !input.consent.healthDataAccepted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "LGPD consent is required before collecting health data.",
          });
        }

        const clinicalSafetyInput = { message: input.message, flow: "onboarding_triage" as const };
        const guidance = await buildClinicalSafetyAssessmentWithLLM(clinicalSafetyInput);
        const trackedAt = new Date().toISOString();
        return {
          ...guidance,
          aiCallTracking: {
            flow: "onboarding_triage",
            status: "completed",
            redFlag: guidance.redFlag,
            fallbackToHuman: guidance.fallbackToHuman,
            guardrailDecision: guidance.guardrailDecision,
            llmEnhanced: guidance.llmEnhanced,
            policyVersion: guidance.aiGovernance.policyVersion,
            mlStructureVersion: guidance.aiGovernance.mlStructureVersion,
            evaluationSummary: evaluateClinicalSafetyDataset(),
            auditEvent: buildClinicalAIAuditEvent(clinicalSafetyInput, guidance, trackedAt),
            trackedAt,
          },
        };
      }),
  }),
  notifications: router({
    preferences: protectedProcedure
      .input(z.object({ appointmentReminders: z.boolean(), healthTips: z.boolean() }))
      .mutation(({ input, ctx }) => ({
        userId: ctx.user.id,
        appointmentReminders: input.appointmentReminders,
        healthTips: input.healthTips,
        optOutAvailable: true,
        updatedAt: new Date().toISOString(),
      })),
  }),
  admin: router({
    summary: adminProcedure.query(async ({ ctx }) => {
      const [appointments, marketplaceItems, marketplaceOrders, mlDailyReview] = await Promise.all([
        listAllCareAppointments(),
        listMarketplaceCatalog({ includeInactive: true }),
        listAllMarketplaceOrders(),
        getMlDailyReviewSummary(),
      ]);
      return {
        role: resolveAppRole(ctx.user.role),
        users: 128,
        doctors: professionalCatalog.length,
        activeDoctors: professionalCatalog.filter((item) => item.active).length,
        contentItems: articles.length,
        publishedContentItems: articles.filter((item) => item.status === "published").length,
        products: marketplaceItems.filter((item) => item.kind === "product").length,
        services: marketplaceItems.filter((item) => item.kind === "service").length,
        lowStockItems: marketplaceItems.filter((item) => item.inventoryPolicy !== "unlimited" && item.availableStock <= (item.inventory?.lowStockThreshold ?? 0)).length,
        simulatedOrders: marketplaceOrders.length,
        appointmentsPending: appointments.filter((appointment) => appointment.status === "requested" || appointment.status === "planned").length,
        auditEventsToday: 42,
        criticalFlows: ["consent", "triage", "appointment", "marketplace", "ai_tracking", "ml_evaluation", "schedule_crud", "content_crud", "marketplace_inventory", "dev_checkout"],
        machineLearningFoundation: MACHINE_LEARNING_FOUNDATION,
        mlDailyReview: mlDailyReview.metrics,
        integrativeDNAFoundation: INTEGRATIVE_DNA_FOUNDATION,
        clinicalSafetyEvaluation: evaluateClinicalSafetyDataset(),
        integrativeDNAEvaluation: evaluateIntegrativeDNADataset(),
      };
    }),
    mlDailyReview: adminProcedure.query(async () => getMlDailyReviewSummary()),
    mlLearningEvents: adminProcedure
      .input(mlReviewFilterInput)
      .query(async ({ input }) => ({ events: await listMlLearningEventsForReview(input ?? {}) })),
    reviewMlLearningEvent: adminProcedure
      .input(mlHumanReviewInput)
      .mutation(async ({ input, ctx }) => {
        const event = await reviewMlLearningEvent({
          id: input.id,
          reviewerUserId: ctx.user.id,
          humanLabel: input.humanLabel,
          reviewerNotes: input.reviewerNotes ?? null,
          isTrainingCandidate: input.isTrainingCandidate,
        });
        if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento aprendível não encontrado para revisão." });
        return { event };
      }),
    createMlTrainingExample: adminProcedure
      .input(mlTrainingExampleInput)
      .mutation(async ({ input, ctx }) => ({
        example: await createMlTrainingExample({
          learningEventId: input.learningEventId ?? null,
          createdByUserId: ctx.user.id,
          inputSnapshot: input.inputSnapshot,
          expectedOutput: input.expectedOutput ?? null,
          critique: input.critique ?? null,
          exampleType: input.exampleType ?? "care_journey_review",
          status: input.status ?? "draft",
        }),
      })),
    mlTrainingExamples: adminProcedure.query(async () => ({ examples: await listMlTrainingExamples({ status: "all", limit: 80 }) })),
    createMlImprovementCycle: adminProcedure
      .input(mlImprovementCycleInput)
      .mutation(async ({ input }) => ({
        cycle: await createMlImprovementCycle({
          triggeredBy: input?.triggeredBy ?? "daily_quality_review",
          status: input?.status ?? "open",
          notes: input?.notes ?? null,
        }),
      })),
    auditDayanRagSearch: adminProcedure
      .input(dayanKnowledgeSearchInput)
      .mutation(async ({ input }) => {
        const context = buildAuditRagContext({
          query: input.query,
          limit: input.limit ?? 8,
          theme: input.theme ?? undefined,
          safetyOnly: input.safetyOnly,
        });
        return {
          context,
          governance: {
            antiHallucinationStatus: context.status,
            sourceCount: context.sourceCount,
            pipelineVersion: context.pipelineVersion,
            safeForGroundedUse: context.status === "grounded",
          },
        };
      }),
    professionals: adminProcedure.query(() => ({ professionals: professionalCatalog })),
    healthDirectorySummary: adminProcedure.query(async () => getNationalHealthDirectorySummary()),
    healthDirectoryProviders: adminProcedure
      .input(nationalHealthProviderListInput)
      .query(async ({ input }) => ({ providers: await listNationalHealthProviders({ ...(input ?? {}), activeOnly: input?.activeOnly ?? false }) })),
    createHealthDirectoryPilotProvider: adminProcedure
      .input(nationalHealthDirectoryPilotInput)
      .mutation(async ({ input, ctx }) => ({ result: await upsertNationalHealthDirectoryPilotProvider(input, ctx.user.id) })),
    createHealthDirectoryIngestionJob: adminProcedure
      .input(nationalHealthDirectoryIngestionJobInput)
      .mutation(async ({ input, ctx }) => ({ job: await createHealthDirectoryIngestionJob({ ...input, requestedByUserId: ctx.user.id }) })),
    ingestCnesOfficialProfessionals: adminProcedure
      .input(cnesOfficialIngestionInput)
      .mutation(async ({ input, ctx }) => ({ result: await ingestCnesOfficialProfessionals({ ...input, requestedByUserId: ctx.user.id }) })),
    upsertHealthDirectoryCoverage: adminProcedure
      .input(nationalHealthDirectoryCoverageInput)
      .mutation(async ({ input }) => ({ coverage: await upsertNationalHealthDirectoryCoverage(input) })),
    upsertProfessional: adminProcedure
      .input(professionalAdminInput)
      .mutation(({ input }) => {
        const next = { ...input };
        const index = professionalCatalog.findIndex((item) => item.id === input.id);
        if (index >= 0) professionalCatalog[index] = next;
        else professionalCatalog = [next, ...professionalCatalog];
        return { professional: next, mode: index >= 0 ? "updated" : "created" } as const;
      }),
    deleteProfessional: adminProcedure
      .input(z.object({ id: z.string().trim().min(2).max(120) }))
      .mutation(({ input }) => {
        professionalCatalog = professionalCatalog.map((item) => item.id === input.id ? { ...item, active: false } : item);
        return { id: input.id, active: false } as const;
      }),
    appointments: adminProcedure.query(async () => ({ appointments: await listAllCareAppointments() })),
    marketplaceCatalog: adminProcedure.query(async () => ({ items: await listMarketplaceCatalog({ includeInactive: true }) })),
    upsertMarketplaceItem: adminProcedure
      .input(marketplaceAdminItemInput)
      .mutation(async ({ input }) => {
        const forbidden = /\b(cura garantida|tratamento\s+garantido|substitui consulta|prescrição definitiva|diagnóstico garantido|resultado garantido)\b/i;
        if (forbidden.test(`${input.name} ${input.subtitle ?? ""} ${input.description ?? ""} ${input.claimReviewNotes ?? ""}`)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "O item do marketplace precisa manter linguagem comercial segura e não prescritiva." });
        }
        return { item: await upsertMarketplaceItemAdmin(input) };
      }),
    updateMarketplaceInventory: adminProcedure
      .input(marketplaceInventoryInput)
      .mutation(async ({ input }) => ({ item: await updateMarketplaceInventoryAdmin(input) })),
    marketplaceOrders: adminProcedure.query(async () => ({ orders: await listAllMarketplaceOrders() })),
    updateAppointment: adminProcedure
      .input(appointmentAdminUpdateInput)
      .mutation(async ({ input }) => {
        const appointment = await updateCareAppointmentStatus(input);
        if (!appointment) throw new TRPCError({ code: "NOT_FOUND", message: "Consulta não encontrada." });
        return { appointment };
      }),
    contents: adminProcedure.query(() => ({ contents: articles })),
    upsertContent: adminProcedure
      .input(contentAdminInput)
      .mutation(({ input }) => {
        const forbidden = /\b(cura garantida|tratamento\s+garantido|substitui consulta|prescrição definitiva)\b/i;
        if (forbidden.test(`${input.title} ${input.summary} ${input.body}`)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Conteúdo oficial deve manter linguagem educativa e não prescritiva." });
        }
        const next = { ...input };
        const index = articles.findIndex((item) => item.id === input.id);
        if (index >= 0) articles[index] = next;
        else articles = [next, ...articles];
        return { content: next, mode: index >= 0 ? "updated" : "created" } as const;
      }),
    deleteContent: adminProcedure
      .input(z.object({ id: z.string().trim().min(2).max(120) }))
      .mutation(({ input }) => {
        articles = articles.map((item) => item.id === input.id ? { ...item, status: "draft" } : item);
        return { id: input.id, status: "draft" } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
