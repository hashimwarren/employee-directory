# Goofy People

An employee directory built with Next.js App Router, Neon Postgres, Drizzle ORM, Better Auth, and Vercel Blob. Production target: https://employees.goofy.computer.

## Features

- 100 fictional employees with portraits: 5 directors, 15 managers, and 80 individual contributors.
- Five teams: Engineering, Product, Design, Marketing, Operations (20 people each).
- A dedicated `/employees/[id]` route with team, manager, and direct-report links.
- Search by name, title, team, or location; filter by team and career level.
- Employees sign up, create one profile, and edit their own profile, including a photo.
- HR can create, edit, remove, or reassign any employee record.
- Account settings allow password changes and signing out.
- Responsive layouts; employee records require authentication.

## Local setup

Requires Node.js 24 (Node 20.9+ is supported by Next.js).

```sh
npm ci
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, HR_INITIAL_PASSWORD, BLOB_READ_WRITE_TOKEN.
npm run db:migrate
node --import tsx scripts/upload-seed-portraits.ts
npm run db:seed
npm run dev
```

Use a random secret of at least 32 characters. Set `BETTER_AUTH_URL=http://localhost:3000` locally. The seed uses `HR_INITIAL_PASSWORD` to create username **HR**. It never changes an existing HR password or overwrites existing employee records. The bootstrap account has no employee profile of its own, keeping the initial directory at exactly 100 employees.

The seed is an explicit command, not a web-accessible endpoint. Do not set `HR_INITIAL_PASSWORD` in the public client or commit it to Git. Change the bootstrap password in Account settings before using this directory for real employee information.

## Neon Launchpad / Claimable Neon

This project was provisioned using Claimable Neon, the current successor to Neon Launchpad (`neon.new`). See [Neon’s current documentation](https://neon.com/docs/reference/claimable-neon).

Unclaimed projects expire after 72 hours. Claiming transfers the project to a Neon organization and revokes the temporary database credential. Copy the new connection string into local and Vercel `DATABASE_URL` after claiming, then redeploy. No database credentials or claim tokens are stored in this repository.

## Profile image storage

Connect a public Vercel Blob store to the project, then set `BLOB_READ_WRITE_TOKEN`. `scripts/upload-seed-portraits.ts` downloads the documented portrait sources, uploads them to `employee-portraits/seed/`, writes the public URL manifest, and migrates existing demo photo paths. Set `PORTRAIT_SOURCE_DIR` to use already-downloaded originals. Binary images are not committed to GitHub or stored in Postgres.

The photo picker resizes new uploads to 256 × 256. The authenticated profile service checks ownership and the reporting graph before validating image bytes and uploading them to Blob. The database stores only the resulting URL. User-supplied remote image URLs are rejected unless they are the existing photo for that record.

## Authorization and data integrity

| Action                                        | Employee        | HR  |
| --------------------------------------------- | --------------- | --- |
| Read directory and profiles                   | Yes, signed in  | Yes |
| Create own profile                            | One per account | Yes |
| Edit own profile                              | Yes             | Yes |
| Create/edit another record                    | No              | Yes |
| Delete records                                | No              | Yes |
| Assign profile ownership                      | No              | Yes |
| Grant HR role through signup or profile forms | No              | No  |

Better Auth owns credentials and sessions. Its `role` additional field is server-controlled (`input: false`). API handlers validate the session and same-origin request independently of the UI. Ownership cannot be supplied by employees. The two-character HR username is supported with the username plugin.

Every hierarchy mutation acquires a transaction-scoped PostgreSQL advisory lock. After acquiring it, the service reads the current reporting graph, checks manager existence, and rejects both direct and indirect cycles. A foreign key clears the reports’ `manager_id` when a manager is deleted; their employee records remain intact. Deleting an employee profile does not delete its login account.

Signups are open, as requested for employee self-service. Accounts are not email-verified. An existing HR-created record is linked to a user by HR, never automatically claimed by an unverified matching email. The sample names, email addresses, teams, and relationships are fictional. Portrait sources and usage attribution are in `assets/PORTRAIT_ATTRIBUTION.md` and `assets/portrait-sources.json`. All profile image bytes are stored in Vercel Blob; Neon and `data/seed-portraits.json` contain image URLs only. Photos have public Blob URLs even though directory pages require sign-in.

## Project structure

- `app/` — directory, profile, editing, account, sign-in, and API routes.
- `components/` — directory cards, profile form, authentication form, and shared UI.
- `db/schema.ts` — Better Auth and employee tables, constraints, and indexes.
- `drizzle/` — checked-in, reproducible SQL migrations.
- `lib/employee-service.ts` — transactional authorization and hierarchy rules.
- `scripts/seed.ts` — idempotent demo data and HR bootstrap.
- `scripts/verify.ts` — real-database integration verification with temporary accounts, cleaned up afterward.

## Verification

```sh
npm run typecheck
npm test
node --import tsx scripts/verify.ts
npm run build
```

The integration script requires the configured HR bootstrap password to still be valid. It checks username login, role injection resistance, authenticated and same-origin mutations, profile ownership, reassignment, cycle rejection, HR deletion, and preservation of direct reports. Run it only against a development or demo database.

## Vercel

Configure these server environment variables:

- `DATABASE_URL`: the Neon connection string.
- `BETTER_AUTH_SECRET`: random secret, at least 32 characters.
- `BLOB_READ_WRITE_TOKEN`: token from the project’s Vercel Blob store (server only).
- `BETTER_AUTH_URL`: `https://employees.goofy.computer` for production.

For a preview deployment, use that preview’s exact origin as `BETTER_AUTH_URL`. Do not share the production database with untrusted preview code. Run migrations and seed against the intended database before deploying. The normal build command is `npm run build` and install command is `npm ci`.

The pre-existing GitHub app is preserved in repository history. This implementation replaces its unauthenticated CRUD/init/seed routes with authenticated routes and explicit local migration/seed commands. The previous Vercel application’s database is not migrated or overwritten by this setup.
