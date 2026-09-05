import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { employees } from "@/db/schema";
export default async function Me() {
  const session = await requireSession();
  const [profile] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.ownerId, session.user.id));
  redirect(profile ? `/employees/${profile.id}` : "/employees/new");
}
