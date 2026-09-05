import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { employees, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { Shell } from "@/components/shell";
import { EmployeeForm } from "@/components/employee-form";
export default async function NewEmployee() {
  const session = await requireSession(),
    isHR = session.user.role === "hr";
  const people = await db.select().from(employees).orderBy(asc(employees.name));
  if (!isHR && people.some((p) => p.ownerId === session.user.id))
    redirect("/me");
  const accounts = isHR
    ? await db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .orderBy(asc(user.name))
    : [];
  return (
    <Shell actor={session.user}>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        All people
      </Link>
      <div className="page-heading compact">
        <div>
          <div className="eyebrow">GROW THE DIRECTORY</div>
          <h1>{isHR ? "Add employee" : "Add your profile"}</h1>
          <p>A face, a role, and a place on the team.</p>
        </div>
      </div>
      <EmployeeForm
        people={people}
        accounts={accounts}
        isHR={isHR}
        defaults={
          isHR
            ? { name: "", email: "" }
            : { name: session.user.name, email: session.user.email }
        }
      />
    </Shell>
  );
}
