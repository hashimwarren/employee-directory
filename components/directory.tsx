"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MapPin,
  ArrowUpRight,
  UsersRound,
  Network,
  Layers3,
} from "lucide-react";
import type { Employee } from "@/db/schema";
import { Avatar } from "./avatar";
export function Directory({
  records,
  isHR,
  hasProfile,
  initialTeam = "",
}: {
  records: Employee[];
  isHR: boolean;
  hasProfile: boolean;
  initialTeam?: string;
}) {
  const [query, setQuery] = useState(""),
    [team, setTeam] = useState(initialTeam),
    [level, setLevel] = useState("");
  const teams = [...new Set(records.map((p) => p.team))].sort();
  const filtered = records.filter(
    (p) =>
      (!team || p.team === team) &&
      (!level || p.level === level) &&
      `${p.name} ${p.title} ${p.team} ${p.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE PEOPLE BEHIND THE WORK</div>
          <h1>
            Our people<span className="heading-dot">.</span>
          </h1>
          <p>Find your teammates and see how everyone connects.</p>
        </div>
        {(isHR || !hasProfile) && (
          <Link href="/employees/new" className="button primary">
            <Plus size={18} />
            {isHR ? "Add employee" : "Add my profile"}
          </Link>
        )}
      </div>
      <div className="stats">
        <div>
          <span className="stat-icon blue">
            <UsersRound size={21} />
          </span>
          <span>
            <strong>{records.length}</strong>
            <small>People</small>
          </span>
        </div>
        <div>
          <span className="stat-icon purple">
            <Layers3 size={21} />
          </span>
          <span>
            <strong>{teams.length}</strong>
            <small>Teams</small>
          </span>
        </div>
        <div>
          <span className="stat-icon green">
            <Network size={21} />
          </span>
          <span>
            <strong>{records.filter((p) => p.level !== "IC").length}</strong>
            <small>Directors & managers</small>
          </span>
        </div>
      </div>
      <div className="directory-panel">
        <div className="directory-toolbar">
          <label className="search">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, roles, or locations"
              aria-label="Search employees"
            />
          </label>
          <label className="sr-only" htmlFor="level">
            Career level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">All levels</option>
            <option value="Director">Directors</option>
            <option value="Manager">Managers</option>
            <option value="IC">Individual contributors</option>
          </select>
        </div>
        <div className="team-tabs" aria-label="Filter by team">
          <button
            aria-pressed={!team}
            className={!team ? "active" : ""}
            onClick={() => setTeam("")}
          >
            All people <span>{records.length}</span>
          </button>
          {teams.map((t) => (
            <button
              key={t}
              aria-pressed={team === t}
              className={team === t ? "active" : ""}
              onClick={() => setTeam(t)}
            >
              {t}
              <span>{records.filter((p) => p.team === t).length}</span>
            </button>
          ))}
        </div>
        <div className="results-heading">
          <span>
            {filtered.length} {filtered.length === 1 ? "person" : "people"}
            {team ? ` in ${team}` : ""}
          </span>
          <span>Alphabetical, A–Z</span>
        </div>
        {filtered.length ? (
          <div className="people-grid">
            {filtered.map((p) => (
              <Link
                href={`/employees/${p.id}`}
                className="person-card"
                key={p.id}
              >
                <div className="card-top">
                  <Avatar name={p.name} image={p.image} size={64} />
                  <ArrowUpRight size={18} />
                </div>
                <h2>{p.name}</h2>
                <p className="job-title">{p.title}</p>
                <div className="card-badges">
                  <span
                    className={`team-badge team-${p.team.toLowerCase().replace(/[^a-z]/g, "")}`}
                  >
                    {p.team}
                  </span>
                  {p.level !== "IC" && (
                    <span className="level-badge">{p.level}</span>
                  )}
                </div>
                <div className="card-bottom">
                  <MapPin size={14} />
                  {p.location || "Location not added"}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <UsersRound size={36} />
            <h2>
              {records.length ? "No matches yet" : "Make the first connection"}
            </h2>
            <p>
              {records.length
                ? "Try another name, team, or role."
                : "Add an employee profile to start the directory."}
            </p>
            {records.length > 0 && (
              <button
                className="button secondary"
                onClick={() => {
                  setQuery("");
                  setTeam("");
                  setLevel("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {records.some((r) => r.isDemo) && (
          <div className="demo-note">
            Sample directory · Fictional employees and reporting relationships.
            Portraits courtesy of Random User / UI Faces.
          </div>
        )}
      </div>
    </>
  );
}
