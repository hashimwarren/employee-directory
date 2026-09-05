import { z } from "zod";
import { isBlobPhoto } from "./photos";
export const employeeInput = z.object({
  name: z.string().trim().min(2, "Enter a full name.").max(100),
  email: z
    .email("Enter a valid email.")
    .transform((v) => v.trim().toLowerCase()),
  title: z.string().trim().min(2, "Enter a job title.").max(120),
  team: z.string().trim().min(2, "Enter a team.").max(60),
  level: z.enum(["Director", "Manager", "IC"]),
  location: z.string().trim().max(100).default(""),
  bio: z.string().trim().max(1000).default(""),
  image: z
    .string()
    .max(200000)
    .default("")
    .refine(
      (v) =>
        !v ||
        isBlobPhoto(v) ||
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
      "Choose a JPG, PNG, or WebP image.",
    ),
  managerId: z.string().max(100).nullable().default(null),
  ownerId: z.string().max(100).nullable().optional(),
});
