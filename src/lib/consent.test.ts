import { describe, expect, it } from "vitest";
import { REQUIRES_GUARDIAN, getConsentTier } from "@/lib/consent";

function yearsAgo(years: number): Date {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date;
}

describe("getConsentTier", () => {
  // ── US / COPPA ────────────────────────────────────────────────────────────
  it("returns coppa for a 12-year-old US user", () => {
    expect(getConsentTier(yearsAgo(12), "US")).toBe("coppa");
  });

  it("returns general for a 13-year-old US user (meets COPPA threshold)", () => {
    expect(getConsentTier(yearsAgo(13), "US")).toBe("general");
  });

  it("returns general for a 17-year-old US user", () => {
    expect(getConsentTier(yearsAgo(17), "US")).toBe("general");
  });

  // ── Spain / GDPR (minAge = 14) ────────────────────────────────────────────
  it("returns gdpr_eu for a 13-year-old Spanish user (under ES threshold of 14)", () => {
    expect(getConsentTier(yearsAgo(13), "ES")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 15-year-old Spanish user (above threshold, still minor)", () => {
    expect(getConsentTier(yearsAgo(15), "ES")).toBe("gdpr_es");
  });

  it("returns general for an 18-year-old Spanish user", () => {
    expect(getConsentTier(yearsAgo(18), "ES")).toBe("general");
  });

  // ── France / GDPR (minAge = 15) ───────────────────────────────────────────
  it("returns gdpr_eu for a 14-year-old French user (under FR threshold of 15)", () => {
    expect(getConsentTier(yearsAgo(14), "FR")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 15-year-old French user (meets FR threshold, still minor)", () => {
    // France's digital-consent age is 15 — a 15-year-old no longer needs guardian
    // consent, but is still a minor in a GDPR jurisdiction → gdpr_es.
    expect(getConsentTier(yearsAgo(15), "FR")).toBe("gdpr_es");
  });

  it("returns gdpr_es for a 17-year-old French user", () => {
    expect(getConsentTier(yearsAgo(17), "FR")).toBe("gdpr_es");
  });

  // ── Germany / GDPR (minAge = 16) ──────────────────────────────────────────
  it("returns gdpr_eu for a 15-year-old German user (under DE threshold of 16)", () => {
    expect(getConsentTier(yearsAgo(15), "DE")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 17-year-old German user (above threshold, still minor)", () => {
    expect(getConsentTier(yearsAgo(17), "DE")).toBe("gdpr_es");
  });

  // ── United Kingdom / GDPR-equivalent (minAge = 13) ───────────────────────
  it("returns gdpr_eu for a 12-year-old UK user", () => {
    expect(getConsentTier(yearsAgo(12), "GB")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 14-year-old UK user (above UK threshold, still minor)", () => {
    expect(getConsentTier(yearsAgo(14), "GB")).toBe("gdpr_es");
  });

  // ── India / DPDPA (minAge = 18) ───────────────────────────────────────────
  it("returns coppa for a 17-year-old Indian user (under IN threshold of 18)", () => {
    expect(getConsentTier(yearsAgo(17), "IN")).toBe("coppa");
  });

  it("returns general for an 18-year-old Indian user", () => {
    expect(getConsentTier(yearsAgo(18), "IN")).toBe("general");
  });

  // ── South Korea / PIPA (minAge = 14) ─────────────────────────────────────
  it("returns coppa for a 13-year-old South Korean user", () => {
    expect(getConsentTier(yearsAgo(13), "KR")).toBe("coppa");
  });

  it("returns general for a 15-year-old South Korean user", () => {
    expect(getConsentTier(yearsAgo(15), "KR")).toBe("general");
  });

  // ── Brazil / LGPD (minAge = 13, coppa framework) ──────────────────────────
  it("returns coppa for a 12-year-old Brazilian user", () => {
    expect(getConsentTier(yearsAgo(12), "BR")).toBe("coppa");
  });

  it("returns general for a 15-year-old Brazilian user", () => {
    // LGPD requires consent under 13; above threshold = general (not a GDPR jurisdiction)
    expect(getConsentTier(yearsAgo(15), "BR")).toBe("general");
  });

  // ── Turkey / KVKK (minAge = 18) ───────────────────────────────────────────
  it("returns coppa for a 17-year-old Turkish user", () => {
    expect(getConsentTier(yearsAgo(17), "TR")).toBe("coppa");
  });

  // ── Unknown country → default rule (13, coppa) ────────────────────────────
  it("returns coppa for a 12-year-old user from an unmapped country", () => {
    expect(getConsentTier(yearsAgo(12), "ZZ")).toBe("coppa");
  });

  it("returns general for a 14-year-old user from an unmapped country", () => {
    expect(getConsentTier(yearsAgo(14), "ZZ")).toBe("general");
  });
});

describe("REQUIRES_GUARDIAN", () => {
  it("contains coppa and gdpr_eu", () => {
    expect(REQUIRES_GUARDIAN.has("coppa")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("gdpr_eu")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("gdpr_es")).toBe(false);
    expect(REQUIRES_GUARDIAN.has("general")).toBe(false);
  });
});
