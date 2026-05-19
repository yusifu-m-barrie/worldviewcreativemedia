"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { ADMIN_ROLES } from "@/config/roles";
import { saveSiteSettings } from "@/services/settings.service";
import type { SiteSettingsValue } from "@/lib/settings-defaults";
import type { Role } from "@/config/roles";

const settingsSchema = z.object({
  siteName: z.string().min(2),
  tagline: z.string().min(10),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  socialFacebook: z.string().url(),
  socialYoutube: z.string().url(),
  socialInstagram: z.union([z.string().url(), z.literal("")]).optional(),
  socialTwitter: z.union([z.string().url(), z.literal("")]).optional(),
  socialWhatsapp: z.string().optional(),
  liveDefaultPlatform: z.enum(["facebook", "youtube", "custom"]),
  liveFacebookPageUrl: z.string().url(),
  liveYoutubeChannelUrl: z.string().url(),
  liveOfflineMessage: z.string().min(5),
  googleAnalyticsId: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || /^(G-[A-Z0-9]+|UA-\d+-\d+)$/i.test(val.trim()), {
      message: "Use a valid ID like G-XXXXXXXXXX or UA-XXXXXXXX-X",
    }),
});

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return { error: "Unauthorized" };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" };
  }

  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || "",
    contactAddress: formData.get("contactAddress") || "",
    socialFacebook: formData.get("socialFacebook"),
    socialYoutube: formData.get("socialYoutube"),
    socialInstagram: formData.get("socialInstagram") || "",
    socialTwitter: formData.get("socialTwitter") || "",
    socialWhatsapp: formData.get("socialWhatsapp") || "",
    liveDefaultPlatform: formData.get("liveDefaultPlatform"),
    liveFacebookPageUrl: formData.get("liveFacebookPageUrl"),
    liveYoutubeChannelUrl: formData.get("liveYoutubeChannelUrl"),
    liveOfflineMessage: formData.get("liveOfflineMessage"),
    googleAnalyticsId: formData.get("googleAnalyticsId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid settings", details: parsed.error.flatten() };
  }

  const d = parsed.data;
  const value: SiteSettingsValue = {
    siteName: d.siteName,
    tagline: d.tagline,
    contactEmail: d.contactEmail,
    contactPhone: d.contactPhone || "",
    contactAddress: d.contactAddress || "",
    social: {
      facebook: d.socialFacebook,
      youtube: d.socialYoutube,
      instagram: d.socialInstagram || "",
      twitter: d.socialTwitter || "",
      whatsapp: d.socialWhatsapp || "",
    },
    live: {
      defaultPlatform: d.liveDefaultPlatform,
      facebookPageUrl: d.liveFacebookPageUrl,
      youtubeChannelUrl: d.liveYoutubeChannelUrl,
      offlineMessage: d.liveOfflineMessage,
    },
    analytics: {
      googleAnalyticsId: d.googleAnalyticsId?.trim() || undefined,
    },
  };

  await saveSiteSettings(value);

  revalidatePath("/");
  revalidatePath("/live-tv");
  revalidatePath("/admin/settings");
  return { success: true };
}
