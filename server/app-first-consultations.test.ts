import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

const appSource = read("client/src/App.tsx");
const layoutSource = read("client/src/components/DashboardLayout.tsx");
const consultationsSource = read("client/src/pages/Consultations.tsx");
const adminSource = read("client/src/pages/Admin.tsx");
const routerSource = read("server/routers.ts");
const dbSource = read("server/db.ts");

const expectAll = (source: string, markers: string[]) => {
  for (const marker of markers) {
    expect(source).toContain(marker);
  }
};

describe("DOUTORELO app-first consultations experience", () => {
  it("registers consultations in the authenticated app without navigation dead ends", () => {
    expectAll(appSource, [
      "import Consultations from \"./pages/Consultations\";",
      "<Route path=\"/consultas\" component={Consultations} />",
      "<Route path=\"/profissionais\" component={Professionals} />",
      "<Route path=\"/preparar-consulta\" component={Clarity} />",
    ]);

    expectAll(layoutSource, [
      "Consultas",
      "Marketplace",
      "Jornada IA",
      "Navegação principal do aplicativo",
      "supports-[padding:max(0px)]:pb-[calc(max(7.75rem,env(safe-area-inset-bottom))+0.75rem)]",
      "thumb-safe-bottom",
      "replace(\"Marketplace\", \"Loja\")",
    ]);
  });

  it("keeps the consultations page optimized for mobile use and daily care context", () => {
    expectAll(consultationsSource, [
      "trpc.appointments.mine.useQuery()",
      "App-first iOS/Android",
      "Sua agenda de cuidado, pronta para o dia a dia.",
      "Agendar com profissional",
      "Atualizar memória clínica",
      "Preparo para consulta",
      "Agendar cuidado",
      "fixed inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-40 sm:hidden",
      "min-h-[3.25rem] touch-manipulation",
      "toLocaleString(\"pt-BR\"",
    ]);
  });

  it("surfaces safe clinical boundaries in patient and admin consultation workflows", () => {
    expectAll(consultationsSource, [
      "A IA ajuda a organizar contexto, mas não substitui avaliação clínica.",
      "Sintomas agudos, piora importante ou sinais de alerta exigem atendimento imediato.",
      "não constituem diagnóstico ou prescrição",
      "baseadas em consentimento",
    ]);

    expectAll(adminSource, [
      "Observações internas organizam continuidade, sem orientar conduta clínica.",
      "Observações operacionais internas",
      "sem orientação clínica",
      "Evite diagnóstico, prescrição ou promessas de resultado.",
      "Consulta atualizada com segurança operacional.",
    ]);
  });

  it("keeps administrative consultation controls protected by role and backed by persisted contracts", () => {
    expectAll(adminSource, [
      "const isAdmin = user?.role === \"admin\";",
      "enabled: isAdmin, retry: false",
      "A área administrativa exige papel de administrador.",
      "trpc.admin.appointments.useQuery",
      "trpc.admin.updateAppointment.useMutation",
      "Filtre a operação por status, data e profissional.",
      "Limpar filtros",
      "Salvar observação",
    ]);

    expectAll(routerSource, [
      "appointments: adminProcedure.query(async () => ({ appointments: await listAllCareAppointments() }))",
      "updateAppointment: adminProcedure",
      "appointmentAdminUpdateInput",
      "updateCareAppointmentStatus",
    ]);

    expectAll(dbSource, [
      "export async function listPatientAppointments",
      "export async function listAllCareAppointments",
      "export async function updateCareAppointmentStatus",
      "careAppointments",
      "addClinicalMemoryEvent",
    ]);
  });

  it("does not regress into unsafe automated-care promises in app-first consultation surfaces", () => {
    const combined = `${consultationsSource}\n${adminSource}\n${routerSource}\n${layoutSource}`;

    expect(combined).toContain("não substitui");
    expect(combined).toContain("diagnóstico");
    expect(combined).toContain("prescrição");
    expect(combined).not.toContain("faz diagnóstico automático");
    expect(combined).not.toContain("oferece tratamento garantido");
    expect(combined).not.toContain("gera prescrição automática");
    expect(combined).not.toContain("promete cura garantida");
  });
});
