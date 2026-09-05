import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "People · Goofy", template: "%s · Goofy People" },
  description: "The people, teams, and connections behind Goofy.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
