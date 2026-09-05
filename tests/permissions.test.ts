import { test } from "node:test";
import assert from "node:assert/strict";
import { canEdit, wouldCreateCycle } from "../lib/permissions";
import { employeeInput } from "../lib/employee-input";
test("employees can edit only their own records; HR can edit all", () => {
  assert.equal(canEdit({ id: "a", role: "employee" }, { ownerId: "a" }), true);
  assert.equal(canEdit({ id: "a", role: "employee" }, { ownerId: "b" }), false);
  assert.equal(
    canEdit({ id: "a", role: "employee" }, { ownerId: null }),
    false,
  );
  assert.equal(canEdit({ id: "hr", role: "hr" }, { ownerId: "b" }), true);
});
test("reporting graph rejects self-management and indirect cycles", () => {
  const graph = [
    { id: "director", managerId: null },
    { id: "manager", managerId: "director" },
    { id: "ic", managerId: "manager" },
  ];
  assert.equal(wouldCreateCycle("director", "director", graph), true);
  assert.equal(wouldCreateCycle("director", "ic", graph), true);
  assert.equal(wouldCreateCycle("manager", "ic", graph), true);
  assert.equal(wouldCreateCycle("ic", "director", graph), false);
  assert.equal(wouldCreateCycle("director", null, graph), false);
});
test("input validation rejects SVG and non-Blob image URLs, sanitizes fields", () => {
  const input = {
    name: "  Test Person ",
    email: "Person@example.com",
    title: "Engineer",
    team: "Engineering",
    level: "IC",
  };
  assert.equal(employeeInput.parse(input).email, "person@example.com");
  assert.equal(employeeInput.parse(input).name, "Test Person");
  assert.equal(
    employeeInput.safeParse({
      ...input,
      image: "data:image/svg+xml;base64,PHN2Zz4=",
    }).success,
    false,
  );
  assert.equal(
    employeeInput.safeParse({
      ...input,
      image: "https://example.com/image.jpg",
    }).success,
    false,
  );
  assert.equal(
    employeeInput.safeParse({
      ...input,
      image:
        "https://example.public.blob.vercel-storage.com/employee-portraits/seed/001.jpg",
    }).success,
    true,
  );
});
