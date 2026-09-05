import Link from "next/link";
import {
  UsersRound,
  Network,
  UserRound,
  ArrowUpRight,
  Settings2,
} from "lucide-react";
import { SignOut } from "./sign-out";
import { Avatar } from "./avatar";
export function Shell({
  children,
  actor,
}: {
  children: React.ReactNode;
  actor: { name: string; role?: string | null };
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <UsersRound size={23} />
          </span>
          <span>
            goofy<span className="brand-dot">.</span>
            <small>PEOPLE DIRECTORY</small>
          </span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/" className="nav-primary">
            <UsersRound size={19} />
            People
            <ArrowUpRight size={15} className="nav-arrow" />
          </Link>
          <Link href="/me">
            <UserRound size={19} />
            My profile
          </Link>
          <Link href="/account">
            <Settings2 size={19} />
            Account
          </Link>
        </nav>
        <div className="sidebar-note">
          <Network size={26} />
          <h3>People make it happen.</h3>
          <p>Find a teammate. Understand the connections.</p>
        </div>
        <div className="sidebar-user">
          <Avatar name={actor.name} size={36} />
          <div>
            <strong>{actor.name}</strong>
            <small>
              {actor.role === "hr" ? "HR administrator" : "Employee"}
            </small>
          </div>
          <SignOut />
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span> <strong>People</strong>
          </span>
          <span className="access-label">
            {actor.role === "hr" ? "HR workspace" : "Employee workspace"}
          </span>
        </header>
        <main className="main-content">{children}</main>
        <footer className="footer">
          Goofy People <span>A little more connected.</span>
        </footer>
      </div>
    </div>
  );
}
