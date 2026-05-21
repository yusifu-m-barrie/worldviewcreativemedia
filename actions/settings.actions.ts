"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { canAccessPermission } from "@/lib/permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";
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
  socialTiktok: z.union([z.string().url(), z.literal("")]).optional(),
  socialInstagram: z.union([z.string().url(), z.literal("")]).optional(),
  socialTwitter: z.union([z.string().url(), z.literal("")]).optional(),
  socialWhatsapp: z.string().optional(),
  liveDefaultPlatform: z.enum(["facebook", "youtube", "tiktok", "custom"]),
  liveFacebookPageUrl: z.string().url(),
  liveYoutubeChannelUrl: z.string().url(),
  liveTiktokProfileUrl: z.union([z.string().url(), z.literal("")]).optional(),
  liveOfflineMessage: z.string().min(5),
  googleAnalyticsId: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || /^(G-[A-Z0-9]+|UA-\d+-\d+)$/i.test(val.trim()), {
      message: "Use a valid ID like G-XXXXXXXXXX or UA-XXXXXXXX-X",
    }),
  adsenseEnabled: z.coerce.boolean().optional(),
  adsenseClientId: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || /^ca-pub-\d+$/i.test(val.trim()), {
      message: "Use a valid publisher ID like ca-pub-XXXXXXXXXX",
    }),
  slotHomepageHero: z.string().optional(),
  slotHomepageSidebar: z.string().optional(),
  slotHomepageMid: z.string().optional(),
  slotArticleMid: z.string().optional(),
  slotFooter: z.string().optional(),
});

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !canAccessPermission(role, perms, "settings")) {
    return { error: "You do not have permission to change site settings." };
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
    socialTiktok: formData.get("socialTiktok") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialTwitter: formData.get("socialTwitter") || "",
    socialWhatsapp: formData.get("socialWhatsapp") || "",
    liveDefaultPlatform: formData.get("liveDefaultPlatform"),
    liveFacebookPageUrl: formData.get("liveFacebookPageUrl"),
    liveYoutubeChannelUrl: formData.get("liveYoutubeChannelUrl"),
    liveTiktokProfileUrl: formData.get("liveTiktokProfileUrl") || "",
    liveOfflineMessage: formData.get("liveOfflineMessage"),
    googleAnalyticsId: formData.get("googleAnalyticsId") || undefined,
    adsenseEnabled: formData.get("adsenseEnabled") === "on",
    adsenseClientId: formData.get("adsenseClientId") || "",
    slotHomepageHero: formData.get("slotHomepageHero") || "",
    slotHomepageSidebar: formData.get("slotHomepageSidebar") || "",
    slotHomepageMid: formData.get("slotHomepageMid") || "",
    slotArticleMid: formData.get("slotArticleMid") || "",
    slotFooter: formData.get("slotFooter") || "",
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
      tiktok: d.socialTiktok || "",
      instagram: d.socialInstagram || "",
      twitter: d.socialTwitter || "",
      whatsapp: d.socialWhatsapp || "",
    },
    live: {
      defaultPlatform: d.liveDefaultPlatform,
      facebookPageUrl: d.liveFacebookPageUrl,
      youtubeChannelUrl: d.liveYoutubeChannelUrl,
      tiktokProfileUrl: d.liveTiktokProfileUrl || "",
      offlineMessage: d.liveOfflineMessage,
    },
    analytics: {
      googleAnalyticsId: d.googleAnalyticsId?.trim() || undefined,
    },
    ads: {
      enabled: d.adsenseEnabled ?? true,
      adsenseClientId: d.adsenseClientId?.trim() || undefined,
      slots: {
        homepageHero: d.slotHomepageHero?.trim() || undefined,
        homepageSidebar: d.slotHomepageSidebar?.trim() || undefined,
        homepageMid: d.slotHomepageMid?.trim() || undefined,
        articleMid: d.slotArticleMid?.trim() || undefined,
        footer: d.slotFooter?.trim() || undefined,
      },
    },
  };

  await saveSiteSettings(value);

  revalidatePath("/");
  revalidatePath("/live-tv");
  revalidatePath("/admin/settings");
  return { success: true };
}
