"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, Save, Trash2 } from "lucide-react";
import type { Employee } from "@/db/schema";
import { Avatar } from "./avatar";
export function EmployeeForm({
  employee,
  people,
  accounts,
  isHR,
  defaults,
}: {
  employee?: Employee;
  people: { id: string; name: string; team: string }[];
  accounts: { id: string; name: string; email: string }[];
  isHR: boolean;
  defaults: { name: string; email: string };
}) {
  const [image, setImage] = useState(employee?.image || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      const edge = Math.min(bitmap.width, bitmap.height);
      ctx.drawImage(
        bitmap,
        (bitmap.width - edge) / 2,
        (bitmap.height - edge) / 2,
        edge,
        edge,
        0,
        0,
        256,
        256,
      );
      setImage(canvas.toDataURL("image/jpeg", 0.85));
      bitmap.close();
      setError("");
    } catch {
      setError("This image couldn’t be opened. Try another file.");
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    delete body.photo;
    const payload = {
      ...body,
      image,
      managerId: body.managerId || null,
      ...(isHR ? { ownerId: body.ownerId || null } : {}),
    };
    try {
      const res = await fetch(
        employee ? `/api/employees/${employee.id}` : "/api/employees",
        {
          method: employee ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      window.location.href = `/employees/${result.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !employee ||
      !confirm(
        `Remove ${employee.name} from the directory? Their direct reports will have no manager until reassigned.`,
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error);
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove profile.");
      setBusy(false);
    }
  }
  return (
    <form className="profile-form" onSubmit={submit}>
      <div className="form-section photo-section">
        <Avatar
          name={employee?.name || defaults.name || "New employee"}
          image={image}
          size={88}
        />
        <div>
          <label className="button secondary upload-button">
            <Camera size={17} />
            Change photo
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
          <p>JPG, PNG, or WebP. Up to 5 MB. Photos have a public image URL.</p>
        </div>
      </div>
      <section className="form-section">
        <h2>About this person</h2>
        <div className="form-grid">
          <label>
            Full name
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={employee?.name ?? defaults.name}
            />
          </label>
          <label>
            Work email
            <input
              name="email"
              type="email"
              required
              defaultValue={employee?.email ?? defaults.email}
            />
          </label>
          <label>
            Job title
            <input
              name="title"
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Product Designer"
              defaultValue={employee?.title}
            />
          </label>
          <label>
            Location
            <input
              name="location"
              maxLength={100}
              placeholder="e.g. Greensboro, NC"
              defaultValue={employee?.location}
            />
          </label>
        </div>
        <label>
          About
          <textarea
            name="bio"
            rows={4}
            maxLength={1000}
            defaultValue={employee?.bio}
            placeholder="What do you work on? What can teammates ask you about?"
          />
        </label>
      </section>
      <section className="form-section">
        <h2>Team & reporting</h2>
        <div className="form-grid">
          <label>
            Team
            <input
              name="team"
              required
              minLength={2}
              maxLength={60}
              list="teams"
              defaultValue={employee?.team}
              placeholder="Choose or enter a team"
            />
            <datalist id="teams">
              {[...new Set(people.map((p) => p.team))].sort().map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label>
            Career level
            <select name="level" defaultValue={employee?.level || "IC"}>
              <option value="IC">Individual contributor</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
            </select>
          </label>
          <label className="span-two">
            Reports to
            <select name="managerId" defaultValue={employee?.managerId || ""}>
              <option value="">No manager</option>
              {people
                .filter((p) => p.id !== employee?.id)
                .map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name} · {p.team}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </section>
      {isHR && (
        <section className="form-section">
          <h2>Profile ownership</h2>
          <label>
            Employee account
            <select name="ownerId" defaultValue={employee?.ownerId || ""}>
              <option value="">HR-managed record</option>
              {accounts.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name} · {a.email}
                </option>
              ))}
            </select>
          </label>
          <p className="field-hint">
            Link an account to let that employee edit this profile. Each account
            can own one profile.
          </p>
        </section>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        {isHR && employee && (
          <button
            type="button"
            className="button danger"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 size={17} />
            Remove employee
          </button>
        )}
        <div className="action-right">
          <Link
            href={employee ? `/employees/${employee.id}` : "/"}
            className="button secondary"
          >
            Cancel
          </Link>
          <button className="button primary" disabled={busy}>
            <Save size={17} />
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
