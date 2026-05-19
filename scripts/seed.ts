/**
 * Seed script — run with: npm run seed
 * Requires MONGODB_URI in .env.local
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ROLES } from "../config/roles";
import { defaultSiteSettings, SETTINGS_KEY } from "../lib/settings-defaults";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@worldviewcreativemedia.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "WorldView2026!";

const categories = [
  { name: "National", slug: "national", order: 1 },
  { name: "Africa", slug: "africa", order: 2 },
  { name: "World", slug: "world", order: 3 },
  { name: "Business", slug: "business", order: 4 },
  { name: "Sports", slug: "sports", order: 5 },
  { name: "Entertainment", slug: "entertainment", order: 6 },
  { name: "Technology", slug: "technology", order: 7 },
  { name: "Opinion", slug: "opinion", order: 8 },
  { name: "Environment", slug: "environment", order: 9 },
  { name: "Media", slug: "media", order: 10 },
  { name: "Education", slug: "education", order: 11 },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is required. Add it to .env.local");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");

  const users = db.collection("users");
  const categoriesCol = db.collection("categories");

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await users.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: "WorldView Admin",
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: ROLES.SUPER_ADMIN,
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), bookmarks: [] },
    },
    { upsert: true }
  );
  console.log(`Admin user: ${ADMIN_EMAIL}`);

  for (const cat of categories) {
    await categoriesCol.updateOne(
      { slug: cat.slug },
      {
        $set: { ...cat, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }
  console.log(`Seeded ${categories.length} categories`);

  const settingsCol = db.collection("sitesettings");
  await settingsCol.updateOne(
    { key: SETTINGS_KEY },
    {
      $set: {
        key: SETTINGS_KEY,
        value: {
          ...defaultSiteSettings,
          live: {
            ...defaultSiteSettings.live,
            defaultPlatform: "facebook",
            facebookPageUrl: "https://www.facebook.com/worldviewcreativemedia",
            youtubeChannelUrl: "https://www.youtube.com/@worldview-creative-media",
          },
        },
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log("Site settings seeded (Facebook Live as default)");

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
