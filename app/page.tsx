import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { Shell } from "@/components/shell";
import { Directory } from "@/components/directory";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const session = await requireSession();
  const records = await db
    .select()
    .from(employees)
    .orderBy(asc(employees.name));
  return (
    <Shell actor={session.user}>
      <Directory
        records={records}
        isHR={session.user.role === "hr"}
        hasProfile={records.some((r) => r.ownerId === session.user.id)}
        initialTeam={(await searchParams).team}
      />
    </Shell>
  );
}
