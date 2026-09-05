import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { employees, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { canEdit } from "@/lib/permissions";
import { Shell } from "@/components/shell";
import { EmployeeForm } from "@/components/employee-form";
export default async function EditEmployee({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(),
    { id } = await params;
  const people = await db.select().from(employees).orderBy(asc(employees.name));
  const employee = people.find((p) => p.id === id);
  if (!employee) notFound();
  if (!canEdit(session.user, employee)) redirect(`/employees/${id}`);
  const isHR = session.user.role === "hr";
  const accounts = isHR
    ? await db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .orderBy(asc(user.name))
    : [];
  return (
    <Shell actor={session.user}>
      <Link href={`/employees/${id}`} className="back-link">
        <ArrowLeft size={16} />
        Back to profile
      </Link>
      <div className="page-heading compact">
        <div>
          <div className="eyebrow">KEEP THE CONNECTIONS CURRENT</div>
          <h1>Edit profile</h1>
        </div>
      </div>
      <EmployeeForm
        employee={employee}
        people={people}
        accounts={accounts}
        isHR={isHR}
        defaults={{ name: "", email: "" }}
      />
    </Shell>
  );
}
