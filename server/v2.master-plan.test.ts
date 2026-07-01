import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

const dashboardSource = read("client/src/pages/Dashboard.tsx");
const professionalsSource = read("client/src/pages/Professionals.tsx");
const layoutSource = read("client/src/components/DashboardLayout.tsx");
const appSource = read("client/src/App.tsx");
const routerSource = read("server/routers.ts");
const dbSource = read("server/db.ts");
const homeSource = read("client/src/pages/Home.tsx");

const expectAll = (source: string, markers: string[]) => {
  for (const marker of markers) {
    expect(source).toContain(marker);
  }
};

describe("DOUTORELO master plan authenticated experience", () => {
  it("registers the authenticated patient dashboard and professionals routes without navigation dead ends", () => {
    expectAll(appSource, [
      "import Dashboard from \"./pages/Dashboard\";",
      "import Professionals from \"./pages/Professionals\";",
      "<Route path=\"/app\" component={Dashboard} />",
      "<Route path=\"/profissionais\" component={Professionals} />",
    ]);

    expectAll(layoutSource, [
      "Painel do paciente",
      "Jornada IA",
      "Memória clínica",
      "Profissionais",
      "OFFICIAL_DOUTORELO_LOGO_URL",
      "/manus-storage/doutorelo-logo-branca-pulso-vermelho_1fef1ed6.png",
      "data-official-doutorelo-logo=\"authenticated-layout\"",
      "bg-white",
    ]);

    expect(homeSource).toContain("data-clean-first-fold=\"only-field-instruction\"");
    expect(homeSource).not.toContain("href=\"/profissionais\"");
  });

  it("connects the dashboard UI to longitudinal memory, recommendations and safe clinical framing", () => {
    expectAll(dashboardSource, [
      "trpc.dashboard.overview.useQuery()",
      "Sua saúde organizada para a próxima conversa com o profissional.",
      "Histórico de saúde ativo",
      "A IA organiza contexto e sinaliza atenção, mas não substitui consulta, diagnóstico, prescrição ou tratamento.",
      "Recomendações de continuidade",
      "Linha do tempo recente",
      "Atualizar histórico de saúde",
      "Ver profissionais",
      "profileCompleteness",
      "data.timeline.map",
    ]);
  });

  it("connects the professionals page to a persisted care request workflow", () => {
    expectAll(professionalsSource, [
      "trpc.professionals.list.useQuery()",
      "trpc.professionals.requestAppointment.useMutation",
      "Pedido enviado. A equipe vai confirmar o horário antes da consulta.",
      "Aqui você escolhe um profissional, informa o que está sentindo e leva para a consulta um resumo mais organizado.",
      "resumo para consulta",
      "Filtro por especialidade",
      "selectedSpecialty",
      "filteredProfessionals",
      "preferredSlot",
      "clarityMapId",
      "Pedir horário",
      "Se você tiver dor intensa de início súbito, falta de ar, desmaio, sinais neurológicos ou qualquer risco imediato, procure um pronto atendimento.",
    ]);
  });

  it("exposes protected backend contracts for dashboard, professionals and explainable clinical AI", () => {
    expectAll(routerSource, [
      "dashboard: router({",
      "overview: protectedProcedure.query(async ({ ctx }) => getPatientDashboard(ctx.user.id))",
      "professionals: router({",
      "requestAppointment: protectedProcedure",
      "Solicitações de consulta são persistidas na memória longitudinal do usuário.",
      "clinical: router({",
      "explain: protectedProcedure",
      "scope: \"Apoio educativo para organizar contexto, dúvidas e próximos passos; não emite diagnóstico, prescrição ou conduta médica.\"",
      "auditEvent: buildClinicalAIAuditEvent",
    ]);
  });

  it("keeps backend helpers grounded in existing longitudinal tables instead of adding disconnected state", () => {
    expectAll(dbSource, [
      "export async function requestCareAppointment",
      "careAppointments",
      "addClinicalMemoryEvent",
      "export async function getPatientDashboard",
      "getPatientMemorySummary(userId)",
      "listPatientTimeline(userId)",
      "profileCompleteness",
      "recommendations",
      "latestAppointment",
    ]);
  });

  it("keeps clinical copy educational and avoids unsafe automated-care promises", () => {
    const combined = `${dashboardSource}\n${professionalsSource}\n${routerSource}`;
    expect(combined).toContain("não substitui consulta");
    expect(combined).toContain("não emite diagnóstico");
    expect(combined).toContain("procure urgência");
    expect(combined).not.toContain("diagnóstico automático");
    expect(combined).not.toContain("tratamento garantido");
    expect(combined).not.toContain("prescrição automática");
  });
});
