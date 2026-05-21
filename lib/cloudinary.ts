import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

export function getCloudinaryApiSecret(): string | undefined {
  return process.env.CLOUDINARY_API_SECRET?.trim();
}

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadToCloudinary(
  file: string,
  options: { folder?: string; resource_type?: "image" | "video" | "auto" } = {}
) {
  return cloudinary.uploader.upload(file, {
    folder: options.folder || "worldview-media",
    resource_type: options.resource_type || "auto",
  });
}
