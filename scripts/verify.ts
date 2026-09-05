import "dotenv/config";
import assert from "node:assert/strict";
import { eq, like, sql } from "drizzle-orm";
import { db, pool } from "../db";
import { employees, user } from "../db/schema";
import { auth } from "../lib/auth";
import { POST } from "../app/api/employees/route";
import { PATCH, DELETE } from "../app/api/employees/[id]/route";
const origin = process.env.BETTER_AUTH_URL!,
  tag = `verify_${Date.now()}`;
const testPassword = crypto.randomUUID() + "aA1!";
let checks = 0;
function check(value: unknown, message: string) {
  assert.ok(value, message);
  checks++;
  console.log("PASS", message);
}
async function authenticate(path: string, body: Record<string, unknown>) {
  const response = await auth.handler(
    new Request(`${origin}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify(body),
    }),
  );
  if (!response.ok)
    throw new Error(
      `Authentication failed (${response.status}): ${await response.text()}`,
    );
  const cookie = response.headers
    .getSetCookie()
    .map((s) => s.split(";")[0])
    .join("; ");
  return { cookie, data: await response.json() };
}
function request(
  method: string,
  body?: object,
  cookie = "",
  requestOrigin = origin,
) {
  return new Request(`${origin}/api/employees`, {
    method,
    headers: {
      "Content-Type": "application/json",
      origin: requestOrigin,
      cookie,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
function context(id: string) {
  return { params: Promise.resolve({ id }) };
}
async function main() {
  try {
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        teams: sql<number>`count(distinct team)::int`,
        directors: sql<number>`count(*) filter (where level='Director')::int`,
        managers: sql<number>`count(*) filter (where level='Manager')::int`,
        ics: sql<number>`count(*) filter (where level='IC')::int`,
        images: sql<number>`count(*) filter (where image <> '')::int`,
      })
      .from(employees)
      .where(eq(employees.isDemo, true));
    check(
      counts.total === 100 &&
        counts.teams === 5 &&
        counts.directors === 5 &&
        counts.managers === 15 &&
        counts.ics === 80 &&
        counts.images === 100,
      "100 seeded profiles, five teams, 5 directors / 15 managers / 80 ICs, all with images",
    );
    const hr = await authenticate("sign-in/username", {
      username: "HR",
      password: process.env.HR_INITIAL_PASSWORD,
    });
    check(
      hr.data.user.role === "hr",
      "HR username/password signs in with HR role",
    );
    const a = await authenticate("sign-up/email", {
      name: "Verification Employee A",
      username: `${tag}a`,
      email: `${tag}a@example.com`,
      password: testPassword,
      role: "hr",
    });
    const b = await authenticate("sign-up/email", {
      name: "Verification Employee B",
      username: `${tag}b`,
      email: `${tag}b@example.com`,
      password: testPassword,
    });
    check(
      a.data.user.role === "employee",
      "Signup cannot grant itself HR permissions",
    );
    const attempt = await auth.handler(
      new Request(`${origin}/api/auth/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin,
          cookie: a.cookie,
        },
        body: JSON.stringify({ role: "hr" }),
      }),
    );
    check(
      !attempt.ok,
      "Employee cannot promote their account through update-user",
    );
    const input = {
      name: "Verification Employee",
      email: `${tag}@example.com`,
      title: "Software Engineer",
      team: "Engineering",
      level: "IC",
      image: "",
      managerId: "demo-002",
      ownerId: b.data.user.id,
    };
    check(
      (await POST(request("POST", input))).status === 401,
      "Unauthenticated record creation is rejected",
    );
    check(
      (
        await POST(
          request("POST", input, a.cookie, "https://malicious.example"),
        )
      ).status === 403,
      "Cross-origin mutation is rejected",
    );
    const create = await POST(request("POST", input, a.cookie));
    check(create.status === 201, "Employee creates their own profile");
    const profile = await create.json();
    check(
      profile.ownerId === a.data.user.id,
      "Client cannot spoof profile ownership",
    );
    check(
      (
        await POST(
          request(
            "POST",
            { ...input, email: `${tag}duplicate@example.com` },
            a.cookie,
          ),
        )
      ).status === 409,
      "Second employee profile is rejected",
    );
    check(
      (
        await PATCH(
          request("PATCH", { ...input, title: "Staff Engineer" }, b.cookie),
          context(profile.id),
        )
      ).status === 403,
      "Another employee cannot edit the profile",
    );
    check(
      (
        await DELETE(
          request("DELETE", undefined, a.cookie),
          context(profile.id),
        )
      ).status === 403,
      "Only HR can delete records",
    );
    check(
      (
        await PATCH(
          request("PATCH", { ...input, title: "Senior Engineer" }, a.cookie),
          context(profile.id),
        )
      ).status === 200,
      "Employee can update their own profile",
    );
    const [director] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, "demo-001"));
    check(
      (
        await PATCH(
          request("PATCH", { ...director, managerId: "demo-005" }, hr.cookie),
          context(director.id),
        )
      ).status === 400,
      "HR cannot create an indirect reporting cycle",
    );
    check(
      (
        await PATCH(
          request(
            "PATCH",
            {
              ...input,
              ownerId: b.data.user.id,
              title: "HR-reassigned profile",
            },
            hr.cookie,
          ),
          context(profile.id),
        )
      ).status === 200,
      "HR can edit and reassign a profile",
    );
    check(
      (
        await PATCH(
          request("PATCH", { ...input, title: "New owner edit" }, a.cookie),
          context(profile.id),
        )
      ).status === 403,
      "Former owner loses edit access immediately",
    );
    check(
      (
        await PATCH(
          request("PATCH", { ...input, title: "New owner edit" }, b.cookie),
          context(profile.id),
        )
      ).status === 200,
      "New owner can edit their assigned profile",
    );
    const childResponse = await POST(
      request(
        "POST",
        {
          ...input,
          name: "Verification child",
          email: `${tag}child@example.com`,
          managerId: profile.id,
          ownerId: null,
        },
        hr.cookie,
      ),
    );
    check(
      childResponse.status === 201,
      "HR creates a record without an employee account",
    );
    const child = await childResponse.json();
    check(
      (
        await DELETE(
          request("DELETE", undefined, hr.cookie),
          context(profile.id),
        )
      ).status === 200,
      "HR can remove a profile",
    );
    const [updatedChild] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, child.id));
    check(
      updatedChild.managerId === null,
      "Deleting a manager preserves reports and clears their manager",
    );
    await auth.handler(
      new Request(`${origin}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          origin,
          cookie: hr.cookie,
          "Content-Type": "application/json",
        },
        body: "{}",
      }),
    );
    console.log(`${checks} integration checks passed.`);
  } finally {
    await db.delete(employees).where(like(employees.email, `${tag}%`));
    await db.delete(user).where(like(user.username, `${tag}%`));
    await pool.end();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
