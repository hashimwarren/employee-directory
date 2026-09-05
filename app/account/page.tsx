import { requireSession } from "@/lib/session";
import { Shell } from "@/components/shell";
import { SignOut } from "@/components/sign-out";
import { PasswordForm } from "@/components/password-form";
export default async function Account() {
  const s = await requireSession();
  return (
    <Shell actor={s.user}>
      <div className="page-heading compact">
        <div>
          <div className="eyebrow">YOUR ACCOUNT</div>
          <h1>Account settings</h1>
          <p>Signed in as {s.user.name}.</p>
        </div>
      </div>
      <PasswordForm />
      <div className="account-signout">
        <span>Finished for now?</span>
        <SignOut />
      </div>
    </Shell>
  );
}
