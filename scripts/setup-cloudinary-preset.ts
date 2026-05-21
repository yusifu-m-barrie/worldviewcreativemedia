/**
 * One-time setup: creates unsigned video upload preset in Cloudinary.
 * Run: npx tsx --env-file=.env.local scripts/setup-cloudinary-preset.ts
 */
import { v2 as cloudinary } from "cloudinary";

const PRESET_NAME = "worldview_videos";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing CLOUDINARY_* in .env.local");
    process.exit(1);
  }

  try {
    await cloudinary.api.create_upload_preset({
      name: PRESET_NAME,
      unsigned: true,
      folder: "worldview/videos",
      resource_type: "video",
      allowed_formats: "mp4,mov,webm,avi,mkv",
    });
    console.log(`Created unsigned preset: ${PRESET_NAME}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/already exists|exists/i.test(msg)) {
      console.log(`Preset "${PRESET_NAME}" already exists — OK`);
    } else {
      console.error("Could not create preset:", msg);
      process.exit(1);
    }
  }

  console.log("\nAdd to .env.local and Vercel (Production + Preview):");
  console.log(`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${PRESET_NAME}`);
}

main();
