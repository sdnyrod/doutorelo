import { describe, expect, it } from "vitest";
import { buildAuditRagContext, RAG_PIPELINE_VERSION } from "./ai/ragPipeline";

describe("RAG Dayan auditável", () => {
  it("retorna baixa evidência e instrução anti-alucinação quando a aderência é fraca", () => {
    const context = buildAuditRagContext({ query: "termo-inexistente-xpto-sem-correspondencia", limit: 8 });

    expect(context.pipelineVersion).toBe(RAG_PIPELINE_VERSION);
    expect(context.status).toBe("low_evidence");
    expect(context.sourceCount).toBe(context.sources.length);
    expect(context.sourceCount).toBeLessThanOrEqual(8);
    expect(context.promptBlock).toContain("Use somente as fontes abaixo");
    expect(context.promptBlock).toContain("Se faltar evidência, reconheça a limitação");
    expect(context.safetyNotice).toContain("sem diagnóstico, prescrição, dose");
  });

  it("limita fontes auditáveis e mantém citações rastreáveis quando recupera corpus interno", () => {
    const context = buildAuditRagContext({ query: "sono energia rotina", limit: 20 });

    expect(context.pipelineVersion).toBe(RAG_PIPELINE_VERSION);
    expect(context.sourceCount).toBeLessThanOrEqual(10);
    expect(context.sourceCount).toBe(context.sources.length);
    expect(context.chunkIds.length).toBe(context.sources.length);
    expect(context.promptBlock).toContain(`versão=${RAG_PIPELINE_VERSION}`);
    expect(context.promptBlock).toContain("Use somente as fontes abaixo");

    for (const [index, source] of context.sources.entries()) {
      expect(source.citation).toBe(`Fonte ${index + 1}`);
      expect(source.chunkId).toBeTruthy();
      expect(source.title).toBeTruthy();
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.excerpt.length).toBeLessThanOrEqual(540);
    }
  });
});
