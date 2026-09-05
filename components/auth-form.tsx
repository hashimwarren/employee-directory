"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
export function AuthForm() {
  const [signup, setSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    const login = String(d.get("login") || "").trim();
    try {
      const result = signup
        ? await authClient.signUp.email({
            name: String(d.get("name")),
            username: String(d.get("username")),
            email: String(d.get("email")),
            password: String(d.get("password")),
          })
        : login.includes("@")
          ? await authClient.signIn.email({
              email: login,
              password: String(d.get("password")),
            })
          : await authClient.signIn.username({
              username: login,
              password: String(d.get("password")),
            });
      if (result.error) {
        setError(result.error.message || "Please check your details.");
        setBusy(false);
        return;
      }
      window.location.href = signup ? "/me" : "/";
    } catch {
      setError("Unable to connect. Please try again.");
      setBusy(false);
    }
  }
  return (
    <div className="auth-form">
      <div className="eyebrow">GOOFY PEOPLE</div>
      <h1>{signup ? "Join the directory." : "Welcome back."}</h1>
      <p>
        {signup
          ? "Create your account, then add your employee profile."
          : "Sign in to find your people."}
      </p>
      <form onSubmit={submit}>
        {signup ? (
          <>
            <label>
              Full name
              <input
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Your full name"
              />
            </label>
            <label>
              Username
              <input
                name="username"
                required
                minLength={2}
                maxLength={30}
                pattern="[A-Za-z0-9_.]+"
                autoComplete="username"
                placeholder="Choose a username"
              />
            </label>
            <label>
              Work email
              <input
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
              />
            </label>
          </>
        ) : (
          <label>
            Username or email
            <input
              name="login"
              required
              autoComplete="username"
              placeholder="Your username or email"
            />
          </label>
        )}
        <label>
          Password
          <div className="password-input">
            <input
              name="password"
              required
              minLength={8}
              type={show ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={
                signup ? "At least 8 characters" : "Enter your password"
              }
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full" disabled={busy}>
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        {signup ? "Already have an account?" : "New to the directory?"}{" "}
        <button
          onClick={() => {
            setSignup(!signup);
            setError("");
          }}
        >
          {signup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
