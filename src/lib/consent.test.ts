import { describe, expect, it } from "vitest";
import { REQUIRES_GUARDIAN, getConsentTier } from "@/lib/consent";

function yearsAgo(years: number): Date {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date;
}

describe("getConsentTier", () => {
  it("returns coppa for a 12-year-old US user", () => {
    expect(getConsentTier(yearsAgo(12), "US")).toBe("coppa");
  });

  it("returns general for a 17-year-old US user", () => {
    expect(getConsentTier(yearsAgo(17), "US")).toBe("general");
  });

  it("returns gdpr_eu for a 13-year-old Spanish user", () => {
    expect(getConsentTier(yearsAgo(13), "ES")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 15-year-old Spanish user", () => {
    expect(getConsentTier(yearsAgo(15), "ES")).toBe("gdpr_es");
  });

  it("returns gdpr_eu for a 15-year-old French user", () => {
    expect(getConsentTier(yearsAgo(15), "FR")).toBe("gdpr_eu");
  });

  it("returns general for a 15-year-old Brazilian user", () => {
    expect(getConsentTier(yearsAgo(15), "BR")).toBe("general");
  });
});

describe("REQUIRES_GUARDIAN", () => {
  it("contains coppa and gdpr_eu", () => {
    expect(REQUIRES_GUARDIAN.has("coppa")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("gdpr_eu")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("general")).toBe(false);
  });
});
