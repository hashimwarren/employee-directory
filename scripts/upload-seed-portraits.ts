import "dotenv/config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import source from "../assets/portrait-sources.json";
import { db, pool } from "../db";
import { employees } from "../db/schema";
async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    throw new Error(
      "Connect a Vercel Blob store and configure BLOB_STORE_ID first.",
    );
  const result: Record<string, string> = {};
  for (let offset = 0; offset < source.portraits.length; offset += 5) {
    await Promise.all(
      source.portraits.slice(offset, offset + 5).map(async (p) => {
        const bytes = process.env.PORTRAIT_SOURCE_DIR
          ? await readFile(join(process.env.PORTRAIT_SOURCE_DIR, p.file))
          : Buffer.from(await (await fetch(p.source)).arrayBuffer());
        const blob = await put(`employee-portraits/seed/${p.file}`, bytes, {
          access: "public",
          contentType: "image/jpeg",
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        result[p.file] = blob.url;
        // Migrate only the original demo photo, preserving a photo subsequently edited by HR.
        const id = `demo-${p.file.slice(0, 3)}`;
        const [record] = await db
          .select()
          .from(employees)
          .where(eq(employees.id, id));
        if (record && (!record.image || record.image.startsWith("/avatars/")))
          await db
            .update(employees)
            .set({ image: blob.url })
            .where(eq(employees.id, id));
      }),
    );
    console.log(
      `Uploaded ${Math.min(offset + 5, source.portraits.length)} of ${source.portraits.length} portraits.`,
    );
  }
  await mkdir("data", { recursive: true });
  await writeFile(
    "data/seed-portraits.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    `Uploaded ${Object.keys(result).length} profile photos to Vercel Blob.`,
  );
  await pool.end();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
