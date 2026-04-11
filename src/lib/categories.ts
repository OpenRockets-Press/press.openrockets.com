import type { PublicationType } from "@shared/types";

export const CATEGORIES: Array<{ label: string; value: PublicationType | "all" }> = [
  { label: "Categories", value: "all" },
  { label: "Research Papers", value: "research_paper" },
  { label: "Journals", value: "other" },
  { label: "Magazines", value: "magazine" },
  { label: "Literary Writing", value: "book" },
  { label: "Club Posters", value: "poster" },
];
