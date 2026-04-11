import type { AdminClient } from "./appwrite";

export async function nextCounter(
  client: AdminClient,
  counterId: string,
): Promise<number> {
  const dbId = client.env.APPWRITE_DATABASE_ID;
  let value = 0;

  try {
    const counter = await client.db.getDocument(dbId, "counters", counterId);
    value = Number(counter.value ?? 0);
  } catch {
    await client.db.createDocument(dbId, "counters", counterId, { value: 0 });
  }

  const next = value + 1;
  await client.db.updateDocument(dbId, "counters", counterId, { value: next });
  return next;
}

export function buildPubId(year: number, sequence: number): string {
  return `ORP-${year}-${String(sequence).padStart(4, "0")}`;
}

export function buildCaseNumber(year: number, sequence: number): string {
  return `CASE-${year}-${String(sequence).padStart(4, "0")}`;
}
