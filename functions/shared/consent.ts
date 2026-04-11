import { differenceInYears } from "date-fns";

export type ConsentTier = "coppa" | "gdpr_eu" | "gdpr_es" | "general";

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

export function getConsentTier(dob: Date, countryCode: string): ConsentTier {
  const age = differenceInYears(new Date(), dob);
  const country = countryCode.toUpperCase();

  if (country === "US" && age < 13) return "coppa";
  if (country === "ES" && age < 14) return "gdpr_eu";
  if (country === "ES" && age < 18) return "gdpr_es";
  if (EU_COUNTRIES.has(country) && age < 16) return "gdpr_eu";
  return "general";
}

export const REQUIRES_GUARDIAN = new Set<ConsentTier>(["coppa", "gdpr_eu"]);
