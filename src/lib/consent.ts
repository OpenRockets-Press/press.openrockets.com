import { differenceInYears } from "date-fns";
import type { ConsentTier } from "@shared/types";

export const EU_COUNTRIES = [
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
] as const;

const EU_COUNTRY_SET = new Set<string>(EU_COUNTRIES);

export const REQUIRES_GUARDIAN = new Set<ConsentTier>(["coppa", "gdpr_eu"]);

export function getConsentTier(dob: Date, countryCode: string): ConsentTier {
  const age = differenceInYears(new Date(), dob);
  const country = countryCode.toUpperCase();
  const isUS = country === "US";
  const isSpain = country === "ES";
  const isEU = EU_COUNTRY_SET.has(country);

  if (isUS && age < 13) return "coppa";
  if (isSpain && age < 14) return "gdpr_eu";
  if (isSpain && age < 18) return "gdpr_es";
  if (isEU && age < 16) return "gdpr_eu";
  return "general";
}

export function createDob(day: string, month: string, year: string): Date | null {
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (!Number.isInteger(dayNum) || !Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
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
