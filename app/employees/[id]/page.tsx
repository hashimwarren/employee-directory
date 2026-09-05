import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  Pencil,
  Mail,
  MapPin,
  Network,
  UsersRound,
} from "lucide-react";
import { db } from "@/db";
import { employees, type Employee } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { canEdit } from "@/lib/permissions";
import { Shell } from "@/components/shell";
import { Avatar } from "@/components/avatar";
function PersonLink({ person }: { person: Employee }) {
  return (
    <Link className="relationship-person" href={`/employees/${person.id}`}>
      <Avatar name={person.name} image={person.image} size={48} />
      <span>
        <strong>{person.name}</strong>
        <small>{person.title}</small>
      </span>
      <ArrowUpRight size={17} />
    </Link>
  );
}
export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(),
    { id } = await params;
  const [person] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));
  if (!person) notFound();
  const [managerRows, reports] = await Promise.all([
    person.managerId
      ? db.select().from(employees).where(eq(employees.id, person.managerId))
      : Promise.resolve([]),
    db
      .select()
      .from(employees)
      .where(eq(employees.managerId, id))
      .orderBy(asc(employees.name)),
  ]);
  const manager = managerRows[0];
  return (
    <Shell actor={session.user}>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        All people
      </Link>
      <section className="profile-hero">
        <div className="profile-cover">
          <span>GOOFY / PEOPLE</span>
        </div>
        <div className="profile-identity">
          <Avatar name={person.name} image={person.image} size={112} />
          {canEdit(session.user, person) && (
            <Link
              className="button secondary profile-edit"
              href={`/employees/${id}/edit`}
            >
              <Pencil size={16} />
              Edit profile
            </Link>
          )}
          <h1>{person.name}</h1>
          <p>{person.title}</p>
          <div className="profile-meta">
            <Link
              className={`team-badge team-${person.team.toLowerCase().replace(/[^a-z]/g, "")}`}
              href={`/?team=${encodeURIComponent(person.team)}`}
            >
              {person.team}
            </Link>
            <span>
              {person.level === "IC" ? "Individual contributor" : person.level}
            </span>
            {person.location && (
              <span>
                <MapPin size={15} />
                {person.location}
              </span>
            )}
          </div>
        </div>
      </section>
      <div className="profile-columns">
        <section className="detail-panel">
          <h2>About {person.name.split(" ")[0]}</h2>
          <p className="bio">{person.bio || "No introduction added yet."}</p>
          <div className="contact-row">
            <Mail size={18} />
            <div>
              <small>WORK EMAIL</small>
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </div>
          </div>
          <div className="contact-row">
            <UsersRound size={18} />
            <div>
              <small>TEAM</small>
              <Link href={`/?team=${encodeURIComponent(person.team)}`}>
                Meet the {person.team} team <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          {person.isDemo && (
            <p className="sample-label">Fictional demo employee</p>
          )}
        </section>
        <section className="detail-panel connections-panel">
          <h2>
            <Network size={20} />
            Reporting relationships
          </h2>
          <div className="relationship-heading">REPORTS TO</div>
          {manager ? (
            <PersonLink person={manager} />
          ) : (
            <div className="no-manager">No manager assigned</div>
          )}
          <div className="connection-line" />
          <div className="current-person">
            <Avatar name={person.name} image={person.image} size={48} />
            <span>
              <strong>{person.name}</strong>
              <small>{person.title}</small>
            </span>
            <span className="you-are-here">This profile</span>
          </div>
          <div className="connection-line" />
          <div className="relationship-heading reports-label">
            DIRECT REPORTS <span>{reports.length}</span>
          </div>
          {reports.length ? (
            <div className="reports-list">
              {reports.map((r) => (
                <PersonLink key={r.id} person={r} />
              ))}
            </div>
          ) : (
            <p className="no-manager">No direct reports</p>
          )}
        </section>
      </div>
    </Shell>
  );
}
