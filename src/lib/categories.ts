import type { PublicationType } from "@shared/types";

export const CATEGORIES: Array<{ label: string; value: string; icon: string; subcategories?: string[] }> = [
  { label: "Computer Science", value: "computer_science", icon: "star", subcategories: ["Programming"] },
  { label: "Physical Sciences", value: "physical_sciences", icon: "flask", subcategories: ["Mathematics", "Physics", "Chemistry"] },
  { label: "Biological Sciences", value: "biological_sciences", icon: "dna", subcategories: ["Neuroscience", "Computational Neuroscience", "Molecular Biology"] },
  { label: "Social Sciences", value: "social_sciences", icon: "users", subcategories: ["Law", "Creative"] },
  { label: "Arts & Humanities", value: "arts_humanities", icon: "palette", subcategories: ["Arts and Crafts", "Statues"] },
  { label: "Technology", value: "technology", icon: "microchip" },
];
