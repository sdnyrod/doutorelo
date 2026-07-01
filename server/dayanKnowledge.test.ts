import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  getDayanKnowledgeOverview,
  searchDayanKnowledge,
} from "./ai/dayanKnowledge";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "dayan-test-user",
    email: "dayan-test@example.com",
    name: "Dayan Test User",
    loginMethod: "manus",
    role: "user",
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

describe("dayanKnowledge corpus", () => {
  it("loads the consolidated corpus with the audited coverage numbers and failed video trace", () => {
    const overview = getDayanKnowledgeOverview();

    expect(overview.stats.valid_videos).toBe(249);
    expect(overview.stats.excluded_or_failed_videos).toBe(1);
    expect(overview.stats.chunks).toBe(2405);
    expect(overview.stats.safety_relevant_chunks).toBeGreaterThan(1500);
    expect(overview.failedVideos.some((video) => video.video_id === "c7swyVubuHM")).toBe(true);
    expect(overview.safetyNotice).toContain("Não emite diagnóstico");
  });

  it("returns traceable search results with video, section and URL citations", () => {
    const results = searchDayanKnowledge({ query: "hipertensão água sódio risco", limit: 6 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(6);
    expect(results[0]?.chunk.video_id).toMatch(/^[\w-]+$/);
    expect(results[0]?.chunk.url).toContain("youtube.com/watch");
    expect(results[0]?.chunk.section.length).toBeGreaterThan(2);
    expect(results[0]?.citation).toContain("Vídeo");
    expect(results.some((result) => result.chunk.safety_relevant)).toBe(true);
  });

  it("honors the safety-only filter for clinical guardrail retrieval", () => {
    const results = searchDayanKnowledge({ query: "medicamento risco contraindicação", limit: 10, safetyOnly: true });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.chunk.safety_relevant)).toBe(true);
  });
});

describe("clinical dayanKnowledge tRPC procedures", () => {
  it("exposes overview and search through protected clinical procedures", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const overview = await caller.clinical.dayanKnowledgeOverview();
    const search = await caller.clinical.searchDayanKnowledge({ query: "diabetes glicemia alimentação", limit: 4 });

    expect(overview.stats.valid_videos).toBe(249);
    expect(search.results.length).toBeGreaterThan(0);
    expect(search.results.length).toBeLessThanOrEqual(4);
    expect(search.results[0]?.chunk.text.length).toBeLessThanOrEqual(1600);
  });
});
