"use client";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
export function SignOut() {
  return (
    <button
      className="icon-button"
      aria-label="Sign out"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/sign-in";
      }}
    >
      <LogOut size={18} />
    </button>
  );
}
