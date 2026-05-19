"use server";

import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { Category } from "@/models/Category";

/** Ensures Education category exists (safe to call on every admin load) */
export async function ensureEducationCategory() {
  if (!isDbConfigured()) return;
  if (!(await tryConnectDB())) return;
  await Category.updateOne(
    { slug: "education" },
    {
      $set: {
        name: "Education",
        slug: "education",
        order: 11,
        isActive: true,
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}
