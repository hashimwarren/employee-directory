export type Actor = { id: string; role?: string | null };
export function canEdit(actor: Actor, record: { ownerId: string | null }) {
  return actor.role === "hr" || record.ownerId === actor.id;
}
export function wouldCreateCycle(
  id: string,
  managerId: string | null,
  records: { id: string; managerId: string | null }[],
) {
  const byId = new Map(records.map((r) => [r.id, r.managerId]));
  const visited = new Set([id]);
  let cursor = managerId;
  while (cursor) {
    if (visited.has(cursor)) return true;
    visited.add(cursor);
    cursor = byId.get(cursor) ?? null;
  }
  return false;
}
