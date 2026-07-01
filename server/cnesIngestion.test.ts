import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const sampleRecord = {
  displayName: "DRA TESTE CNES",
  state: "AC",
  city: "Rio Branco",
  municipalityCode: "120040",
  cnesCode: "2000000",
  cboCode: "225125",
  primarySpecialty: "Médico(a) clínico",
  councilType: "crm" as const,
  councilNumber: "12345",
  councilState: "AC",
  licenseStatus: "Registro CNES ativo na competência informada",
  competence: "202512",
  sourcePath: "public/data/ftp/cnes/PFAC2512.parquet",
  sourceUrl: "https://datasus.saude.gov.br/transferencia-de-arquivos/",
  externalId: "cnes-pf-ac-202512-test-dedup",
  rawEvidence: {
    CNES: "2000000",
    CODUFMUN: "120040",
    CBO: "225125",
    REGISTRO_PRESENTE: true,
  },
};

describe("admin.ingestCnesOfficialProfessionals", () => {
  it("runs a dry-run without requiring database writes and deduplicates by externalId", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const response = await caller.admin.ingestCnesOfficialProfessionals({
      dryRun: true,
      state: "AC",
      competence: "202512",
      records: [sampleRecord, { ...sampleRecord }],
    });

    expect(response.result.dryRun).toBe(true);
    expect(response.result.job).toBeNull();
    expect(response.result.counters.recordsSeen).toBe(2);
    expect(response.result.counters.recordsProcessed).toBe(1);
    expect(response.result.counters.recordsSkipped).toBe(1);
    expect(response.result.sample[0]?.externalId).toBe("cnes-pf-ac-202512-test-dedup");
    expect(JSON.stringify(response.result.sample[0])).not.toMatch(/cpf|cns/i);
  });
});
