import { differenceInYears } from "date-fns";
import type { ConsentTier } from "@shared/types";

/**
 * Per-country digital-consent age rules (research-based, as of 2025/2026).
 *
 * framework "gdpr"  → under minAge: "gdpr_eu" (guardian required)
 *                     minAge ≤ age < 18: "gdpr_es" (teen notice, no guardian)
 * framework "coppa" → under minAge: "coppa" (guardian required)
 *                     minAge ≤ age: "general"
 *
 * Countries not listed fall back to DEFAULT_RULE (conservative 13-threshold, coppa).
 */
interface ConsentRule {
  minAge: number;
  framework: "gdpr" | "coppa";
}

/**
 * Fallback for countries without a mapped rule.
 * Uses the COPPA baseline: guardian required under 13, general above.
 */
const DEFAULT_RULE: ConsentRule = { minAge: 13, framework: "coppa" };

/**
 * Country-specific consent rules.
 *
 * EU sources: GDPR Article 8 as transposed by each member state (2018-2025).
 * Other sources cited per entry.
 */
const CONSENT_RULES: Partial<Record<string, ConsentRule>> = {
  // ── EU member states — GDPR Article 8 national thresholds ────────────────
  AT: { minAge: 14, framework: "gdpr" }, // Datenschutz-Anpassungsgesetz 2018
  BE: { minAge: 13, framework: "gdpr" }, // Belgian DPA confirmed 13
  BG: { minAge: 14, framework: "gdpr" },
  HR: { minAge: 16, framework: "gdpr" },
  CY: { minAge: 14, framework: "gdpr" },
  CZ: { minAge: 15, framework: "gdpr" }, // Act No. 110/2019
  DK: { minAge: 13, framework: "gdpr" }, // Databeskyttelsesloven
  EE: { minAge: 13, framework: "gdpr" },
  FI: { minAge: 13, framework: "gdpr" }, // Tietosuojalaki
  FR: { minAge: 15, framework: "gdpr" }, // Loi Informatique et Libertés art. 45
  DE: { minAge: 16, framework: "gdpr" }, // BDSG § 8
  GR: { minAge: 15, framework: "gdpr" },
  HU: { minAge: 14, framework: "gdpr" },
  IE: { minAge: 16, framework: "gdpr" }, // Data Protection Act 2018
  IT: { minAge: 14, framework: "gdpr" }, // D.Lgs. 101/2018
  LV: { minAge: 13, framework: "gdpr" },
  LT: { minAge: 14, framework: "gdpr" },
  LU: { minAge: 16, framework: "gdpr" },
  MT: { minAge: 13, framework: "gdpr" },
  NL: { minAge: 16, framework: "gdpr" },
  PL: { minAge: 16, framework: "gdpr" },
  PT: { minAge: 13, framework: "gdpr" },
  RO: { minAge: 16, framework: "gdpr" },
  SK: { minAge: 16, framework: "gdpr" },
  SI: { minAge: 15, framework: "gdpr" },
  ES: { minAge: 14, framework: "gdpr" }, // LOPDGDD art. 7
  SE: { minAge: 13, framework: "gdpr" },

  // ── EEA (non-EU) — GDPR-equivalent national laws ─────────────────────────
  IS: { minAge: 13, framework: "gdpr" }, // Persónuverndarlög
  LI: { minAge: 14, framework: "gdpr" }, // DSG (Liechtenstein)
  NO: { minAge: 13, framework: "gdpr" }, // Personopplysningsloven

  // ── GDPR-adjacent / GDPR-equivalent bilateral frameworks ─────────────────
  GB: { minAge: 13, framework: "gdpr" }, // UK GDPR + Children's Code (ICO)
  CH: { minAge: 16, framework: "gdpr" }, // nFADP (Swiss DPA), effective 2023
  AD: { minAge: 14, framework: "gdpr" }, // Llei 29/2021 (Andorra GDPR-aligned)
  MC: { minAge: 13, framework: "gdpr" }, // Monaco GDPR adequacy framework

  // ── Americas ──────────────────────────────────────────────────────────────
  US: { minAge: 13, framework: "coppa" }, // COPPA (15 U.S.C. § 6501)
  CA: { minAge: 13, framework: "coppa" }, // PIPEDA / CPPA (federal baseline; QC uses 14)
  MX: { minAge: 13, framework: "coppa" }, // LFPDPPP
  AR: { minAge: 13, framework: "coppa" }, // PDPPA Ley 25.326
  BR: { minAge: 13, framework: "coppa" }, // LGPD art. 14 — explicit consent under 13
  CL: { minAge: 14, framework: "coppa" }, // Ley 19.628 + Bill 11144
  CO: { minAge: 12, framework: "coppa" }, // Ley Estatutaria 1581/2012 art. 7
  PE: { minAge: 13, framework: "coppa" }, // Ley 29733
  UY: { minAge: 13, framework: "coppa" }, // Ley 18.331
  PY: { minAge: 13, framework: "coppa" }, // Ley 1682/2001
  EC: { minAge: 13, framework: "coppa" }, // LOPDP (Ecuador)
  BO: { minAge: 13, framework: "coppa" }, // baseline, no specific law
  VE: { minAge: 12, framework: "coppa" }, // Ley de Protección de Datos (VE)
  PA: { minAge: 13, framework: "coppa" },
  CR: { minAge: 13, framework: "coppa" }, // Ley 8968 (Costa Rica ARCO)
  GT: { minAge: 13, framework: "coppa" },
  HN: { minAge: 13, framework: "coppa" },
  SV: { minAge: 13, framework: "coppa" },
  NI: { minAge: 13, framework: "coppa" },
  DO: { minAge: 13, framework: "coppa" }, // Ley 172-13

  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  JP: { minAge: 13, framework: "coppa" }, // APPI + Children's safety guidance
  KR: { minAge: 14, framework: "coppa" }, // PIPA art. 22 (Personal Information Protection Act)
  CN: { minAge: 14, framework: "coppa" }, // PIPL art. 31 + MIPS Provisions 2023
  IN: { minAge: 18, framework: "coppa" }, // DPDPA 2023 s. 9 — full guardian until 18
  SG: { minAge: 13, framework: "coppa" }, // PDPA + IMDA Children's Code 2021
  MY: { minAge: 13, framework: "coppa" }, // PDPA 2010 guidance
  TH: { minAge: 10, framework: "coppa" }, // PDPA B.E. 2562 — parental consent under 10; 10-19 some rights
  PH: { minAge: 13, framework: "coppa" }, // Data Privacy Act 2012 NPC guidelines
  ID: { minAge: 13, framework: "coppa" }, // PDP Law 2022 (Law No. 27/2022)
  VN: { minAge: 13, framework: "coppa" }, // Decree 13/2023 on Personal Data Protection
  AU: { minAge: 15, framework: "coppa" }, // Privacy Act review + Online Safety Act (15 as of 2024)
  NZ: { minAge: 16, framework: "coppa" }, // Privacy Act 2020 — extra care for under 16
  TW: { minAge: 15, framework: "coppa" }, // PDPA (Taiwan) — under 15 needs guardian
  HK: { minAge: 13, framework: "coppa" }, // PDPO (Hong Kong) guidance

  // ── Middle East & Central Asia ────────────────────────────────────────────
  AE: { minAge: 13, framework: "coppa" }, // UAE PDPL 2021 (Federal Decree-Law 45/2021)
  SA: { minAge: 13, framework: "coppa" }, // Saudi PDPL 2021
  QA: { minAge: 13, framework: "coppa" }, // PDPPL 2016
  KW: { minAge: 13, framework: "coppa" }, // Data Privacy Regulations
  BH: { minAge: 13, framework: "coppa" }, // PDPL (Bahrain) 2018
  OM: { minAge: 13, framework: "coppa" }, // Electronic Transactions Law guidance
  IL: { minAge: 13, framework: "coppa" }, // Privacy Protection Authority guidance
  TR: { minAge: 18, framework: "coppa" }, // KVKK — parental consent required for all under 18
  JO: { minAge: 13, framework: "coppa" },
  LB: { minAge: 13, framework: "coppa" },
  KZ: { minAge: 13, framework: "coppa" }, // Law on Personal Data (Kazakhstan)
  UZ: { minAge: 13, framework: "coppa" },

  // ── Europe (non-EU, non-EEA) ──────────────────────────────────────────────
  RS: { minAge: 15, framework: "gdpr" }, // Serbian LPDP (GDPR-equivalent)
  ME: { minAge: 15, framework: "gdpr" }, // Montenegro LPPD (GDPR-aligned)
  BA: { minAge: 14, framework: "gdpr" }, // Bosnia LZPL (GDPR-aligned)
  AL: { minAge: 16, framework: "gdpr" }, // Albania LSHPD (GDPR-aligned, EU candidate)
  MK: { minAge: 15, framework: "gdpr" }, // North Macedonia LZLP (EU candidate)
  UA: { minAge: 14, framework: "gdpr" }, // Ukrainian Law on Personal Data (EU alignment)
  MD: { minAge: 16, framework: "gdpr" }, // Moldova Law 133 (GDPR-equivalent)
  BY: { minAge: 14, framework: "coppa" }, // Belarus LPPD
  RU: { minAge: 14, framework: "coppa" }, // Federal Law 149-FZ / 152-FZ

  // ── Africa ────────────────────────────────────────────────────────────────
  ZA: { minAge: 18, framework: "coppa" }, // POPIA s. 35 — parental consent for all under 18
  NG: { minAge: 13, framework: "coppa" }, // Nigeria Data Protection Act 2023
  GH: { minAge: 13, framework: "coppa" }, // Data Protection Act 2012 (Ghana)
  KE: { minAge: 13, framework: "coppa" }, // Data Protection Act 2019 (Kenya)
  TZ: { minAge: 13, framework: "coppa" }, // Personal Data Protection Act 2022
  UG: { minAge: 13, framework: "coppa" },
  EG: { minAge: 13, framework: "coppa" }, // Personal Data Protection Law 151/2020
  MA: { minAge: 13, framework: "coppa" }, // Loi 09-08 (Morocco)
  TN: { minAge: 13, framework: "coppa" }, // Loi organique 63-2004 (Tunisia)
  RW: { minAge: 13, framework: "coppa" }, // Law No. 058/2021 (Rwanda DPP)
  SN: { minAge: 13, framework: "coppa" }, // Loi 2008-12 (Senegal CDP)
  MU: { minAge: 13, framework: "coppa" }, // Data Protection Act 2017 (Mauritius)
  CM: { minAge: 13, framework: "coppa" },
};

export const REQUIRES_GUARDIAN = new Set<ConsentTier>(["coppa", "gdpr_eu"]);

/**
 * Returns the consent tier for a given date of birth and country code.
 *
 * - "coppa"   : US-COPPA-style strict guardian consent required.
 * - "gdpr_eu" : EU-GDPR-style strict guardian consent required.
 * - "gdpr_es" : Above local GDPR threshold but still a minor (<18) in a GDPR
 *               jurisdiction; consent notice applies, no guardian email needed.
 * - "general" : No special consent regime applies.
 */
export function getConsentTier(dob: Date, countryCode: string): ConsentTier {
  const age = differenceInYears(new Date(), dob);
  const country = countryCode.toUpperCase();
  const rule = CONSENT_RULES[country] ?? DEFAULT_RULE;

  if (age < rule.minAge) {
    return rule.framework === "gdpr" ? "gdpr_eu" : "coppa";
  }

  if (age < 18 && rule.framework === "gdpr") {
    // Above local digital-consent threshold but still a legal minor in a GDPR
    // jurisdiction. No guardian email required; platform records the tier.
    return "gdpr_es";
  }

  return "general";
}

export function createDob(day: string, month: string, year: string): Date | null {
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (
    !Number.isInteger(dayNum) ||
    !Number.isInteger(monthNum) ||
    !Number.isInteger(yearNum)
  ) {
    return null;
  }

  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
    return null;
  }

  const dob = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
  if (
    dob.getUTCFullYear() !== yearNum ||
    dob.getUTCMonth() !== monthNum - 1 ||
    dob.getUTCDate() !== dayNum
  ) {
    return null;
  }

  return dob;
}
