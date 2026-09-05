import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone-state">
      <h1>This profile isn’t here.</h1>
      <p>It may have been removed or moved.</p>
      <Link className="button primary" href="/">
        Back to directory
      </Link>
    </main>
  );
}
