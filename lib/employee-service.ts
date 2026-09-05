import { storePhoto } from "./photos";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { employeeInput } from "./employee-input";
import { canEdit, wouldCreateCycle, type Actor } from "./permissions";
export class DirectoryError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function saveEmployee(actor: Actor, raw: unknown, id?: string) {
  const input = employeeInput.parse(raw);
  return db.transaction(async (tx) => {
    // Serialize all hierarchy mutations; queries after this lock see the last committed graph.
    await tx.execute(sql`select pg_advisory_xact_lock(847291)`);
    const records = await tx.select().from(employees);
    const existing = id ? records.find((r) => r.id === id) : undefined;
    if (id && !existing) throw new DirectoryError("Employee not found.", 404);
    if (existing && !canEdit(actor, existing))
      throw new DirectoryError("You can only edit your own profile.", 403);
    const recordId = id ?? crypto.randomUUID();
    const ownerId =
      actor.role === "hr"
        ? input.ownerId === undefined
          ? (existing?.ownerId ?? null)
          : input.ownerId
        : (existing?.ownerId ?? actor.id);
    if (
      ownerId &&
      records.some((r) => r.ownerId === ownerId && r.id !== recordId)
    )
      throw new DirectoryError(
        "This account already has an employee profile.",
        409,
      );
    if (
      records.some(
        (r) => r.email.toLowerCase() === input.email && r.id !== recordId,
      )
    )
      throw new DirectoryError(
        "An employee already uses this email. Ask HR to link the existing record to your account.",
        409,
      );
    if (input.managerId && !records.some((r) => r.id === input.managerId))
      throw new DirectoryError("Choose an existing manager.");
    if (wouldCreateCycle(recordId, input.managerId, records))
      throw new DirectoryError(
        "This manager would create a circular reporting relationship.",
      );
    const { ownerId: ignored, ...fields } = input;
    void ignored;
    let image = input.image;
    if (image.startsWith("data:image/"))
      image = await storePhoto(image, recordId);
    else if (image && image !== existing?.image)
      throw new DirectoryError("Upload a new photo using the photo picker.");
    const values = { ...fields, image, ownerId, updatedAt: new Date() };
    if (existing)
      return (
        await tx
          .update(employees)
          .set(values)
          .where(eq(employees.id, recordId))
          .returning()
      )[0];
    return (
      await tx
        .insert(employees)
        .values({ ...values, id: recordId })
        .returning()
    )[0];
  });
}
export async function deleteEmployee(actor: Actor, id: string) {
  if (actor.role !== "hr")
    throw new DirectoryError("Only HR can remove employee records.", 403);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(847291)`);
    const rows = await tx
      .delete(employees)
      .where(eq(employees.id, id))
      .returning({ id: employees.id });
    if (!rows.length) throw new DirectoryError("Employee not found.", 404);
  });
}
