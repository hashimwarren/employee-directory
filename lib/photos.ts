import { put } from "@vercel/blob";
export function isBlobPhoto(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      url.pathname.startsWith("/employee-portraits/")
    );
  } catch {
    return false;
  }
}
export async function storePhoto(dataUrl: string, employeeId: string) {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(
    dataUrl,
  );
  if (!match) throw new Error("Invalid photo format.");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 150000) throw new Error("Photo is too large.");
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp =
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP";
  if (!(
    (match[1] === "jpeg" && isJpeg) ||
    (match[1] === "png" && isPng) ||
    (match[1] === "webp" && isWebp)
  ))
    throw new Error("Invalid image data.");
  return (
    await put(
      `employee-portraits/uploads/${employeeId}/${crypto.randomUUID()}.${match[1] === "jpeg" ? "jpg" : match[1]}`,
      bytes,
      {
        access: "public",
        contentType: `image/${match[1]}`,
        addRandomSuffix: false,
      },
    )
  ).url;
}
