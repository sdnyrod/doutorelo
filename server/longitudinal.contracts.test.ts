import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const routerKeys = Object.keys(appRouter._def.procedures);
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("longitudinal clinical core contracts", () => {
  it("exposes universal longitudinal and integration routers", () => {
    expect(routerKeys).toContain("longitudinal.core");
    expect(routerKeys).toContain("longitudinal.addCarePlanItem");
    expect(routerKeys).toContain("longitudinal.recordMetric");
    expect(routerKeys).toContain("integrations.overview");
    expect(routerKeys).toContain("integrations.registerHealthConnection");
    expect(routerKeys).toContain("integrations.registerCalendarConnection");
    expect(routerKeys).toContain("integrations.syncAppointmentCalendar");
  });

  it("keeps Apple, Android, wearable and calendar providers explicit in the API surface", () => {
    for (const provider of [
      "apple_health",
      "apple_watch",
      "health_connect",
      "android_wearable",
      "google_fit",
      "google_calendar",
      "apple_calendar",
      "outlook_calendar",
    ]) {
      expect(routerSource).toContain(provider);
    }
  });
});
