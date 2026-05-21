import { siteConfig } from "@/config/site";
import type { LivePlatform } from "@/lib/live-embed";

export const SETTINGS_KEY = "site";

export interface SiteSettingsValue {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  social: {
    facebook: string;
    youtube: string;
    tiktok: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
  };
  live: {
    defaultPlatform: LivePlatform;
    facebookPageUrl: string;
    youtubeChannelUrl: string;
    tiktokProfileUrl: string;
    /** Shown when no embed is active */
    offlineMessage: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
  ads?: {
    enabled?: boolean;
    adsenseClientId?: string;
    slots?: {
      homepageHero?: string;
      homepageSidebar?: string;
      homepageMid?: string;
      articleMid?: string;
      footer?: string;
    };
  };
}

export const defaultSiteSettings: SiteSettingsValue = {
  siteName: siteConfig.name,
  tagline: siteConfig.description,
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
  contactAddress: siteConfig.contact.address,
  social: {
    facebook: siteConfig.social.facebook,
    youtube: siteConfig.social.youtube,
    tiktok: siteConfig.social.tiktok,
    instagram: siteConfig.social.instagram,
    twitter: siteConfig.social.twitter,
    whatsapp: siteConfig.social.whatsapp,
  },
  live: {
    defaultPlatform: "facebook",
    facebookPageUrl: siteConfig.social.facebook,
    youtubeChannelUrl: siteConfig.social.youtube,
    tiktokProfileUrl: siteConfig.social.tiktok,
    offlineMessage:
      "We are currently offline. Follow us on Facebook, YouTube, or TikTok for the next live broadcast.",
  },
  analytics: {},
  ads: {
    enabled: true,
    adsenseClientId: "",
    slots: {},
  },
};
