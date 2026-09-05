import portraitMap from "@/data/seed-portraits.json";
const portraits: Record<string, string> = portraitMap;
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersRound, Network } from "lucide-react";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Avatar } from "@/components/avatar";
export default async function SignIn() {
  if (await auth.api.getSession({ headers: await headers() })) redirect("/");
  return (
    <main className="signin-page">
      <section className="signin-story">
        <div className="brand light">
          <span className="brand-icon">
            <UsersRound size={25} />
          </span>
          <span>goofy.</span>
        </div>
        <div className="signin-message">
          <div className="portrait-stack">
            {[1, 8, 15, 24, 37].map((i) => (
              <Avatar
                key={i}
                name="Demo employee"
                image={portraits[`${String(i).padStart(3, "0")}.jpg`]}
                size={62}
              />
            ))}
          </div>
          <h2>
            Great work
            <br />
            starts with
            <br />
            <span>your people.</span>
          </h2>
          <p>
            Meet the teams. Find the right person.
            <br />
            See how it all connects.
          </p>
        </div>
        <div className="signin-caption">
          <Network size={20} />
          ONE DIRECTORY. EVERY CONNECTION.
        </div>
      </section>
      <section className="signin-form-side">
        <AuthForm />
        <small className="signin-footer">Employee directory · Goofy</small>
      </section>
    </main>
  );
}
