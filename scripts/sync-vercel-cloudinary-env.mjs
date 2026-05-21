import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { resolve } from "path";

const PRESET = "worldview_videos";
const envPath = resolve(process.cwd(), ".env.local");
const raw = readFileSync(envPath, "utf8");
const vars = {};
for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const toSync = [
  ["CLOUDINARY_CLOUD_NAME", vars.CLOUDINARY_CLOUD_NAME],
  ["CLOUDINARY_API_KEY", vars.CLOUDINARY_API_KEY],
  ["CLOUDINARY_API_SECRET", vars.CLOUDINARY_API_SECRET],
  ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", vars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || vars.CLOUDINARY_CLOUD_NAME],
  ["NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", PRESET],
];

for (const [name, value] of toSync) {
  if (!value) {
    console.error(`Missing ${name} in .env.local`);
    process.exit(1);
  }
  const r = spawnSync("vercel", ["env", "add", name, "production"], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  });
  if (r.status !== 0 && !/already exists/i.test(r.stderr || "")) {
    console.error(`Failed to set ${name}:`, r.stderr || r.stdout);
    process.exit(1);
  }
  console.log(`Set ${name} on Vercel production`);
}

console.log("Done. Run: vercel deploy --prod");
