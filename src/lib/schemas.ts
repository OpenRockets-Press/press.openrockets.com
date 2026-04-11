import { z } from "zod";

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(3, "Display name must be at least 3 characters.")
      .max(100, "Display name must be 100 characters or fewer."),
    email: z.email({ message: "Email must be a valid email address." }),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    day: z.string().min(1, "Please select a birth day."),
    month: z.string().min(1, "Please select a birth month."),
    year: z.string().min(1, "Please select a birth year."),
    country: z.string().length(2, "Please select a valid country."),
    guardianEmail: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.guardianEmail && !z.email().safeParse(value.guardianEmail).success) {
      ctx.addIssue({
        code: "custom",
        path: ["guardianEmail"],
        message: "Guardian email must be a valid email address.",
      });
    }
  });

export const consentSchema = z.object({
  guardianEmail: z.string().trim().email("Guardian email must be a valid email address."),
  check1: z.boolean().refine((value) => value, {
    message: "Please confirm you are the parent or legal guardian.",
  }),
  check2: z.boolean().refine((value) => value, {
    message: "Please confirm you have read and understood the consent text.",
  }),
  check3: z.boolean().refine((value) => value, {
    message: "Please confirm consent to create and operate the account.",
  }),
});

export const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "ES", label: "Spain" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "BR", label: "Brazil" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
] as const;

export const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;
