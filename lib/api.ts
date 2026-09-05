import { auth } from "./auth";
import { DirectoryError } from "./employee-service";
import { ZodError } from "zod";
export async function apiActor(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.BETTER_AUTH_URL;
  if (!origin || !expected || origin !== new URL(expected).origin)
    throw new DirectoryError("Invalid request origin.", 403);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new DirectoryError("Sign in to continue.", 401);
  return session.user;
}
export function apiError(error: unknown) {
  if (error instanceof DirectoryError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return Response.json(
      { error: error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  if (error instanceof SyntaxError)
    return Response.json({ error: "Invalid request." }, { status: 400 });
  console.error(
    "Directory operation failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return Response.json(
    { error: "Could not save this change. Please try again." },
    { status: 500 },
  );
}
