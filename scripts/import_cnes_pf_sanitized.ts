import { readFile } from "node:fs/promises";
import { z } from "zod";
import { ingestCnesOfficialProfessionals } from "../server/cnesIngestion";

const cnesRecordSchema = z.object({
  displayName: z.string().min(2),
  state: z.string().length(2),
  city: z.string().min(2),
  municipalityCode: z.string().optional().nullable(),
  cnesCode: z.string().min(1),
  cboCode: z.string().optional().nullable(),
  primarySpecialty: z.string().optional().nullable(),
  councilType: z.enum(["crm", "other", "not_applicable"]).optional().nullable(),
  councilNumber: z.string().optional().nullable(),
  councilState: z.string().optional().nullable(),
  licenseStatus: z.string().optional().nullable(),
  competence: z.string().regex(/^\d{6}$/),
  sourcePath: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  externalId: z.string().min(8),
  rawEvidence: z.record(z.string(), z.unknown()).optional().nullable(),
});

const payloadSchema = z.object({
  state: z.string().length(2),
  competence: z.string().regex(/^\d{6}$/),
  records: z.array(cnesRecordSchema),
});

function parseArgs(argv: string[]) {
  const args = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args.get("file");
  if (typeof file !== "string") throw new Error("Uso: pnpm tsx scripts/import_cnes_pf_sanitized.ts --file <arquivo.json> [--write] [--limit 120]");
  const limitRaw = args.get("limit");
  const limit = typeof limitRaw === "string" ? Number(limitRaw) : undefined;
  const shouldWrite = args.has("write");
  const payload = payloadSchema.parse(JSON.parse(await readFile(file, "utf-8")));
  const result = await ingestCnesOfficialProfessionals({
    records: payload.records,
    state: payload.state,
    competence: payload.competence,
    dryRun: !shouldWrite,
    limit,
  });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exit(1);
  });
