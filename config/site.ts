export const siteConfig = {
  name: "WorldView Creative Media",
  shortName: "WorldView",
  description:
    "Professional online TV, news, and digital media platform — Sierra Leone and West Africa's premier destination for breaking news, live broadcasts, and video journalism.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: "/images/logo.png",
  colors: {
    primary: "#2E2A86",
    orange: "#E8872A",
    white: "#FFFFFF",
    gray: "#F5F5F7",
    grayDark: "#6B7280",
  },
  social: {
    facebook: "https://facebook.com/worldviewcreativemedia",
    twitter: "https://x.com/worldviewmedia",
    youtube: "https://www.youtube.com/@worldview-creative-media",
    instagram: "https://instagram.com/worldviewcreativemedia",
    whatsapp: "https://wa.me/",
  },
  contact: {
    email: "news@worldviewcreativemedia.com",
    phone: "+232",
    address: "Freetown, Sierra Leone",
  },
  defaultLocale: "en",
  supportedLocales: ["en", "fr"] as const,
};

export type SiteConfig = typeof siteConfig;
