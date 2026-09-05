import "dotenv/config";
import portraitMap from "../data/seed-portraits.json";
const portraits: Record<string, string> = portraitMap;
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../db";
import { account, employees, user } from "../db/schema";
const female = [
  "Amara",
  "Chloe",
  "Priya",
  "Elena",
  "Maya",
  "Zoe",
  "Nadia",
  "Sofia",
  "Aisha",
  "Isabel",
  "Lena",
  "Grace",
  "Naomi",
  "Mei",
  "Olivia",
  "Jasmine",
  "Leila",
  "Nora",
  "Aria",
  "Vivian",
  "Clara",
  "Sana",
  "Emma",
  "Imani",
  "Tessa",
  "Yara",
  "Alice",
  "Camila",
  "Rina",
  "Eva",
  "Selena",
  "Freya",
  "Hana",
  "Avery",
  "Lucia",
  "Keira",
  "Ada",
  "Ines",
  "Mina",
  "Ruby",
  "Dalia",
  "Mira",
  "June",
  "Ayla",
  "Esme",
  "Fatima",
  "Iris",
  "Lila",
  "Nina",
  "Stella",
];
const male = [
  "Marcus",
  "Daniel",
  "Arjun",
  "Ethan",
  "Noah",
  "Liam",
  "Omar",
  "Lucas",
  "Theo",
  "Julian",
  "Andre",
  "Felix",
  "Isaac",
  "Kenji",
  "Owen",
  "Gabriel",
  "Mateo",
  "Leo",
  "Elias",
  "Miles",
  "Caleb",
  "Samir",
  "Henry",
  "Darius",
  "Jack",
  "Yusuf",
  "Adrian",
  "Diego",
  "Ravi",
  "Max",
  "Luca",
  "Finn",
  "Hugo",
  "Rowan",
  "Luis",
  "Aaron",
  "Ben",
  "Idris",
  "Kai",
  "Rafael",
  "Dante",
  "Nico",
  "James",
  "Adam",
  "Oscar",
  "Zain",
  "Cole",
  "Ezra",
  "Ryan",
  "Simon",
];
const surnames = [
  "Bennett",
  "Chen",
  "Patel",
  "Rivera",
  "Reed",
  "Kim",
  "Brooks",
  "Santos",
  "Morgan",
  "Hayes",
  "Clark",
  "Park",
  "Johnson",
  "Tanaka",
  "Williams",
  "Ahmed",
  "Torres",
  "Mitchell",
  "Thomas",
  "Singh",
];
const locations = [
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "Greensboro, NC",
  "London, UK",
  "Remote",
];
const teams = [
  {
    name: "Engineering",
    director: "Director of Engineering",
    manager: "Engineering Manager",
    roles: [
      "Software Engineer",
      "Senior Software Engineer",
      "Platform Engineer",
      "QA Engineer",
    ],
    focus:
      "reliable software, developer experience, and the systems that help our teams ship",
  },
  {
    name: "Product",
    director: "Director of Product",
    manager: "Product Lead",
    roles: [
      "Product Manager",
      "Product Analyst",
      "Product Operations Specialist",
      "Technical Product Manager",
    ],
    focus:
      "customer problems, product strategy, and turning insights into useful experiences",
  },
  {
    name: "Design",
    director: "Design Director",
    manager: "Design Manager",
    roles: [
      "Product Designer",
      "UX Researcher",
      "Design Systems Designer",
      "Brand Designer",
    ],
    focus:
      "clear experiences, customer research, and a consistent design language",
  },
  {
    name: "Marketing",
    director: "Director of Marketing",
    manager: "Marketing Manager",
    roles: [
      "Product Marketing Specialist",
      "Content Strategist",
      "Growth Marketer",
      "Community Specialist",
    ],
    focus:
      "connecting the right people with our work through stories, launches, and community",
  },
  {
    name: "Operations",
    director: "Director of Operations",
    manager: "Operations Manager",
    roles: [
      "People Operations Specialist",
      "Business Analyst",
      "Finance Specialist",
      "Workplace Coordinator",
    ],
    focus:
      "the people, processes, and day-to-day operations behind a healthy company",
  },
];
async function main() {
  const password = process.env.HR_INITIAL_PASSWORD;
  if (!password || password.length < 8)
    throw new Error("Set HR_INITIAL_PASSWORD to at least 8 characters.");
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(user)
      .where(eq(user.username, "hr"));
    if (existing) {
      if (existing.id !== "goofy-hr-admin" || existing.role !== "hr")
        throw new Error(
          "The HR username is already in use; refusing to promote or replace it.",
        );
    } else {
      await tx.insert(user).values({
        id: "goofy-hr-admin",
        name: "HR",
        email: "hr@employees.goofy.computer",
        emailVerified: true,
        username: "hr",
        displayUsername: "HR",
        role: "hr",
      });
      await tx.insert(account).values({
        id: "goofy-hr-credential",
        accountId: "goofy-hr-admin",
        providerId: "credential",
        userId: "goofy-hr-admin",
        password: await hashPassword(password),
      });
    }
  });
  const records = Array.from({ length: 100 }, (_, i) => {
    const t = teams[Math.floor(i / 20)],
      within = i % 20;
    const first =
      i % 2 === 0 ? female[Math.floor(i / 2)] : male[Math.floor(i / 2)];
    const last = surnames[(i * 7 + Math.floor(i / 20) * 3) % surnames.length];
    const level = within === 0 ? "Director" : within <= 3 ? "Manager" : "IC";
    const managerIndex =
      within === 0
        ? null
        : within <= 3
          ? Math.floor(i / 20) * 20
          : Math.floor(i / 20) * 20 + 1 + ((within - 4) % 3);
    const id = `demo-${String(i + 1).padStart(3, "0")}`;
    return {
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
      title:
        level === "Director"
          ? t.director
          : level === "Manager"
            ? t.manager
            : t.roles[(within - 4) % 4],
      team: t.name,
      level,
      location: locations[i % locations.length],
      image: portraits[`${String(i + 1).padStart(3, "0")}.jpg`] ?? "",
      managerId:
        managerIndex === null
          ? null
          : `demo-${String(managerIndex + 1).padStart(3, "0")}`,
      bio: `I work with the ${t.name} team on ${t.focus}. ${level === "Director" ? "I lead the team’s direction and help our managers do their best work." : level === "Manager" ? "I support our contributors and keep priorities clear across the team." : "Ask me about my current projects or how we can collaborate."}`,
      isDemo: true,
    };
  });
  // Idempotent: reruns preserve HR edits and the HR password. Never seed from a public endpoint.
  await db.transaction(async (tx) => {
    for (const r of records)
      await tx
        .insert(employees)
        .values(r)
        .onConflictDoNothing({ target: employees.id });
  });
  console.log(
    "HR account ready. Seeded 100 fictional employees: 5 directors, 15 managers, 80 ICs across 5 teams.",
  );
  await pool.end();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
