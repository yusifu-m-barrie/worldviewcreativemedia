import { siteConfig } from "@/config/site";
import type { ContentTranslations } from "@/lib/i18n/types";

export const ABOUT_SETTINGS_KEY = "about";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image?: string;
  order: number;
}

export interface AboutPageValue {
  headline: string;
  description: string;
  mission: string;
  teamMembers: TeamMember[];
  translations?: ContentTranslations;
}

export const defaultAboutPage: AboutPageValue = {
  headline: `About ${siteConfig.name}`,
  description:
    "WorldView Creative Media is a digital news and media platform delivering trusted journalism, live broadcasts, and stories that matter across Sierra Leone, Africa, and the world.",
  mission:
    "To inform, inspire, and connect our audience through accurate reporting, compelling storytelling, and innovative media.",
  teamMembers: [],
};
