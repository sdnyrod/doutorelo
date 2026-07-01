import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getNationalHealthDirectorySummary: vi.fn(),
    listNationalHealthProviders: vi.fn(),
  };
});

import { appRouter } from "./routers";
import { getNationalHealthDirectorySummary, listNationalHealthProviders } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"] = "user"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 99 : 12,
      openId: `${role}-open-id`,
      email: `${role}@example.com`,
      name: `${role} user`,
      loginMethod: "manus",
      role,
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
      updatedAt: new Date("2026-05-01T10:00:00.000Z"),
      lastSignedIn: new Date("2026-05-01T10:00:00.000Z"),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const summaryFixture = {
  totals: {
    providers: 2,
    activeProviders: 1,
    verifiedProviders: 1,
    cities: 1,
    coverageRows: 1,
    ingestionJobs: 0,
  },
  stateCounts: { SP: 2 },
  entityTypeCounts: { professional: 1, clinic: 1 },
  recentCoverage: [],
  recentIngestionJobs: [],
};

const providerFixture = [{
  id: 1,
  stableKey: "manual:sp:sao-paulo:clinica-integrativa-exemplo",
  displayName: "Clínica Integrativa Exemplo",
  legalName: null,
  entityType: "clinic",
  professionalType: "health_facility",
  primarySpecialty: "Medicina integrativa",
  documentType: "not_collected",
  maskedDocument: null,
  licenseCouncil: "not_applicable",
  licenseNumber: null,
  licenseState: "SP",
  country: "BR",
  state: "SP",
  city: "São Paulo",
  neighborhood: null,
  postalCode: null,
  addressLine: null,
  latitude: null,
  longitude: null,
  phone: null,
  email: null,
  websiteUrl: null,
  telehealthAvailable: false,
  inPersonAvailable: true,
  modality: "Presencial",
  bio: null,
  publicSummary: "Registro piloto de curadoria manual.",
  status: "active",
  verificationStatus: "source_verified",
  sourceConfidenceScore: 82,
  qualityScore: 88,
  createdByUserId: 99,
  reviewedByUserId: null,
  reviewedAt: null,
  createdAt: new Date("2026-05-01T10:00:00.000Z"),
  updatedAt: new Date("2026-05-01T10:00:00.000Z"),
}];

describe("healthDirectory procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNationalHealthDirectorySummary).mockResolvedValue(summaryFixture);
    vi.mocked(listNationalHealthProviders).mockResolvedValue(providerFixture);
  });

  it("returns public national directory summary without requiring authentication", async () => {
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

    const result = await caller.healthDirectory.summary();

    expect(result).toEqual(summaryFixture);
    expect(getNationalHealthDirectorySummary).toHaveBeenCalledTimes(1);
  });

  it("searches public providers with the expected safety and directory mode metadata", async () => {
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

    const result = await caller.healthDirectory.search({ city: "São Paulo", state: "SP", specialty: "integrativa", limit: 20 });

    expect(listNationalHealthProviders).toHaveBeenCalledWith({ city: "São Paulo", state: "SP", specialty: "integrativa", limit: 20 });
    expect(result.directoryMode).toBe("national_foundation");
    expect(result.safetyNotice).toContain("Diretório informativo");
    expect(result.providers).toEqual(providerFixture);
  });

  it("allows administrators to list inactive and active providers by default", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await caller.admin.healthDirectoryProviders({ limit: 12 });

    expect(listNationalHealthProviders).toHaveBeenCalledWith({ limit: 12, activeOnly: false });
  });
});
