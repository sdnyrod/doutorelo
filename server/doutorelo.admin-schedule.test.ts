import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  addClinicalMemoryEvent: vi.fn(),
  createHealthConversation: vi.fn(),
  getPatientDashboard: vi.fn(),
  getPatientMemorySummary: vi.fn(),
  listAllCareAppointments: vi.fn(async () => []),
  listBookedAppointmentsForProfessional: vi.fn(async () => []),
  listPatientAppointments: vi.fn(async () => []),
  listPatientTimeline: vi.fn(),
  requestCareAppointment: vi.fn(),
  requestCareAppointmentSlot: vi.fn(async (_userId: number, payload: unknown) => ({ id: 9001, status: "requested", ...payload })),
  saveClarityMap: vi.fn(),
  updateCareAppointmentStatus: vi.fn(async (input: { id: number; status: string; notes?: string | null }) => ({ userId: 42, doctorName: "Dra. Admin", specialty: "Medicina Integrativa", scheduledAt: new Date("2031-09-10T12:00:00.000Z"), ...input })),
  savePatientHealthProfile: vi.fn(),
}));

const { appRouter } = await import("./routers");
const db = await import("./db");

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const baseUser: AuthenticatedUser = {
  id: 42,
  openId: "doutorelo-user",
  email: "user@example.com",
  name: "Usuário DOUTORELO",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(role: "admin" | "user" = "user"): TrpcContext {
  return {
    user: { ...baseUser, role },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("DOUTORELO admin CRUD and scheduling contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.listAllCareAppointments).mockResolvedValue([]);
    vi.mocked(db.listBookedAppointmentsForProfessional).mockResolvedValue([]);
    vi.mocked(db.requestCareAppointmentSlot).mockResolvedValue({ id: 9001, status: "requested" });
    vi.mocked(db.updateCareAppointmentStatus).mockResolvedValue({ id: 77, userId: 42, doctorName: "Dra. Admin", specialty: "Medicina Integrativa", status: "confirmed", scheduledAt: new Date("2031-09-10T12:00:00.000Z"), notes: "Confirmado pela operação." } as never);
  });

  it("allows admins to create professionals and exposes detail slots for booking", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const slotIso = new Date("2031-06-10T12:00:00.000Z").toISOString();
    const professional = {
      id: "teste-admin-integrativo",
      name: "Dra. Teste Integrativo",
      specialty: "Medicina Integrativa",
      credentials: "CRM TESTE · RQE Teste",
      approach: "Organiza contexto de saúde com limites educativos e encaminhamento humano.",
      focus: ["rotina", "energia"],
      availability: [slotIso],
      bio: "Perfil de teste para validar o CRUD administrativo e a página de detalhe com agenda.",
      languages: ["Português"],
      consultationModes: ["Teleconsulta"],
      featured: true,
      active: true,
    };

    const saved = await adminCaller.admin.upsertProfessional(professional);
    expect(saved).toMatchObject({ mode: expect.stringMatching(/created|updated/), professional });

    const patientCaller = appRouter.createCaller(createContext("user"));
    const detail = await patientCaller.professionals.detail({ professionalId: professional.id });
    expect(detail.professional.name).toBe("Dra. Teste Integrativo");
    expect(detail.slots).toEqual([{ slotIso, status: "available", label: expect.any(String) }]);
  });

  it("marks already booked slots as reserved and sends selected slot to the booking helper", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const slotIso = new Date("2031-07-10T15:00:00.000Z").toISOString();
    await adminCaller.admin.upsertProfessional({
      id: "teste-slot-reservado",
      name: "Dr. Slot Reservado",
      specialty: "Endocrinologia",
      credentials: "CRM SLOT · RQE Endocrinologia",
      approach: "Valida reservas de agenda com prevenção de dupla ocupação do mesmo horário.",
      focus: ["metabolismo"],
      availability: [slotIso],
      bio: "Perfil de teste para validar bloqueio visual de horários reservados na página de detalhe.",
      languages: ["Português"],
      consultationModes: ["Teleconsulta"],
      featured: false,
      active: true,
    });
    vi.mocked(db.listBookedAppointmentsForProfessional).mockResolvedValue([{ scheduledAt: new Date(slotIso) } as never]);

    const patientCaller = appRouter.createCaller(createContext("user"));
    const detail = await patientCaller.professionals.detail({ professionalId: "teste-slot-reservado" });
    expect(detail.slots[0]).toMatchObject({ slotIso, status: "reserved" });

    await patientCaller.professionals.requestAppointment({
      professionalId: "teste-slot-reservado",
      reason: "Quero organizar perguntas para a consulta.",
      slotIso,
    });
    expect(db.requestCareAppointmentSlot).toHaveBeenCalledWith(42, expect.objectContaining({ professionalId: "teste-slot-reservado", slotIso, doctorName: "Dr. Slot Reservado" }));
  });

  it("converts double booking helper failures into a safe conflict message", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const slotIso = new Date("2031-08-10T15:00:00.000Z").toISOString();
    await adminCaller.admin.upsertProfessional({
      id: "teste-dupla-reserva",
      name: "Dra. Dupla Reserva",
      specialty: "Psiquiatria e Sono",
      credentials: "CRM DUPLA · RQE Psiquiatria",
      approach: "Valida concorrência de agenda e orienta escolha de outro horário.",
      focus: ["sono"],
      availability: [slotIso],
      bio: "Perfil de teste para validar prevenção de dupla reserva por profissional e horário.",
      languages: ["Português"],
      consultationModes: ["Teleconsulta"],
      featured: false,
      active: true,
    });
    vi.mocked(db.requestCareAppointmentSlot).mockRejectedValue(new Error("DOUBLE_BOOKING_SLOT_UNAVAILABLE"));

    const patientCaller = appRouter.createCaller(createContext("user"));
    await expect(patientCaller.professionals.requestAppointment({ professionalId: "teste-dupla-reserva", reason: "Solicito continuidade de cuidado.", slotIso })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Este horário acabou de ser reservado. Escolha outro slot disponível.",
    });
  });

  it("lists and updates appointments through protected admin contracts", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    vi.mocked(db.listAllCareAppointments).mockResolvedValue([
      {
        id: 77,
        userId: 42,
        doctorName: "Dra. Admin",
        specialty: "Medicina Integrativa",
        status: "requested",
        reason: "Preparar perguntas para consulta.",
        scheduledAt: new Date("2031-09-10T12:00:00.000Z"),
        notes: "Solicitação recebida.",
      },
    ] as never);

    const list = await adminCaller.admin.appointments();
    expect(list.appointments).toHaveLength(1);
    expect(list.appointments[0]).toMatchObject({ id: 77, status: "requested", doctorName: "Dra. Admin" });

    const updated = await adminCaller.admin.updateAppointment({ id: 77, status: "confirmed", notes: "Confirmado pela operação." });
    expect(db.updateCareAppointmentStatus).toHaveBeenCalledWith({ id: 77, status: "confirmed", notes: "Confirmado pela operação." });
    expect(updated.appointment).toMatchObject({ id: 77, status: "confirmed" });
  });

  it("protects admin CRUD from non-admin users", async () => {
    const patientCaller = appRouter.createCaller(createContext("user"));
    await expect(patientCaller.admin.professionals()).rejects.toBeInstanceOf(TRPCError);
    await expect(patientCaller.admin.appointments()).rejects.toBeInstanceOf(TRPCError);
  });

  it("blocks unsafe official content claims while allowing educational copy", async () => {
    const adminCaller = appRouter.createCaller(createContext("admin"));
    const safeContent = await adminCaller.admin.upsertContent({
      id: "conteudo-teste-seguro",
      title: "Perguntas para preparar consulta",
      category: "Primeiros passos",
      summary: "Material educativo para organizar histórico, exames e dúvidas antes da consulta.",
      body: "Use este conteúdo como roteiro de conversa com profissional habilitado. Ele não define diagnóstico, tratamento ou prescrição individual.",
      status: "published",
      safeLanguageNotice: "Não é prescrição, diagnóstico ou substituto de orientação médica.",
    });
    expect(safeContent.mode).toMatch(/created|updated/);

    await expect(adminCaller.admin.upsertContent({
      id: "conteudo-teste-inseguro",
      title: "Cura garantida em poucos passos",
      category: "Inseguro",
      summary: "Este texto promete cura garantida e substitui consulta, portanto deve ser bloqueado.",
      body: "Promessa de tratamento garantido não é linguagem permitida em conteúdo oficial.",
      status: "published",
      safeLanguageNotice: "Aviso insuficiente para claims inseguros.",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
