import type { Databases } from "node-appwrite";

export async function nextCounter(
  db: Databases,
  databaseId: string,
  counterId: string,
): Promise<number> {
  let value = 0;

  try {
    const counter = await db.getDocument(databaseId, "counters", counterId);
    value = Number(counter.value ?? 0);
  } catch {
    await db.createDocument(databaseId, "counters", counterId, { value: 0 });
  }

  const next = value + 1;
  await db.updateDocument(databaseId, "counters", counterId, { value: next });
  return next;
}

export function buildPubId(year: number, sequence: number): string {
  return `ORP-${year}-${String(sequence).padStart(4, "0")}`;
}

export function buildCaseNumber(year: number, sequence: number): string {
  return `CASE-${year}-${String(sequence).padStart(4, "0")}`;
}
