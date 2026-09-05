"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function PasswordForm() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      className="profile-form password-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget,
          d = new FormData(form);
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const r = await authClient.changePassword({
            currentPassword: String(d.get("current")),
            newPassword: String(d.get("next")),
            revokeOtherSessions: true,
          });
          if (r.error)
            setError(r.error.message || "Could not change password.");
          else {
            setMessage(
              "Your password has been changed. Other sessions are signed out.",
            );
            form.reset();
          }
        } catch {
          setError("Unable to connect. Try again.");
        }
        setBusy(false);
      }}
    >
      <h2>Change password</h2>
      <label>
        Current password
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        New password
        <input
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
