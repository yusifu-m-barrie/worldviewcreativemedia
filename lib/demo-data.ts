import type { ArticleCard, LiveStreamCard, VideoCard } from "@/types";

/** Fallback content when MongoDB is not configured (local dev preview) */
export const demoArticles: ArticleCard[] = [
  {
    _id: "1",
    title: "Sierra Leone Advances Digital Media Infrastructure Nationwide",
    slug: "sierra-leone-digital-media-infrastructure",
    excerpt:
      "Government and private sector partners unveil ambitious plans to expand broadband and media production capabilities across the country.",
    featuredImage:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    category: { name: "National", slug: "national" },
    author: { name: "Aminata Koroma" },
    publishedAt: new Date().toISOString(),
    isBreaking: true,
    isFeatured: true,
    viewCount: 12400,
    region: "freetown",
  },
  {
    _id: "2",
    title: "ECOWAS Summit: West African Leaders Address Regional Security",
    slug: "ecowas-summit-regional-security",
    excerpt:
      "Heads of state gather in Abuja to discuss coordinated responses to economic challenges and cross-border security threats.",
    featuredImage:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    category: { name: "Africa", slug: "africa" },
    author: { name: "Ibrahim Sesay" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    isFeatured: true,
    viewCount: 8900,
    region: "freetown",
  },
  {
    _id: "3",
    title: "Freetown Tech Hub Launches Youth Journalism Training Program",
    slug: "freetown-tech-hub-journalism-training",
    excerpt:
      "A new initiative aims to equip young Sierra Leoneans with digital storytelling and broadcast production skills.",
    featuredImage:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80",
    category: { name: "Business", slug: "business" },
    author: { name: "Mariama Bangura" },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    viewCount: 5600,
    region: "freetown",
  },
  {
    _id: "4",
    title: "Premier League: African Stars Shine in Weekend Fixtures",
    slug: "premier-league-african-stars",
    excerpt:
      "Top performers from West Africa dominate headlines as clubs battle for European qualification spots.",
    featuredImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    category: { name: "Sports", slug: "sports" },
    author: { name: "David Kamara" },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    viewCount: 15200,
    region: "bo",
  },
  {
    _id: "5",
    title: "Climate Resilience: Coastal Communities Adopt New Flood Defenses",
    slug: "climate-resilience-coastal-flood-defenses",
    excerpt:
      "Engineers and environmental groups collaborate on sustainable infrastructure to protect vulnerable shoreline areas.",
    featuredImage:
      "https://images.unsplash.com/photo-1611273426854-450a8a2a8b0c?w=800&q=80",
    category: { name: "Environment", slug: "environment" },
    author: { name: "Fatmata Jalloh" },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    viewCount: 4300,
    region: "western-area",
  },
  {
    _id: "6",
    title: "WorldView Creative Media Expands Live Broadcast Coverage",
    slug: "worldview-expands-live-coverage",
    excerpt:
      "The network announces 24/7 streaming capabilities and partnerships with regional correspondents across West Africa.",
    featuredImage:
      "https://images.unsplash.com/photo-1478737273-78417779e661?w=800&q=80",
    category: { name: "Media", slug: "media" },
    author: { name: "WorldView Editorial" },
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    isFeatured: true,
    viewCount: 9800,
    region: "kenema",
  },
];

export const demoCategories = [
  { name: "National", slug: "national", count: 124 },
  { name: "Africa", slug: "africa", count: 89 },
  { name: "World", slug: "world", count: 156 },
  { name: "Business", slug: "business", count: 67 },
  { name: "Sports", slug: "sports", count: 98 },
  { name: "Entertainment", slug: "entertainment", count: 45 },
  { name: "Technology", slug: "technology", count: 34 },
  { name: "Opinion", slug: "opinion", count: 28 },
  { name: "Education", slug: "education", count: 42 },
];

export const demoLiveStream: LiveStreamCard = {
  _id: "live-1",
  title: "WorldView Live — Evening News Bulletin",
  slug: "evening-news-bulletin",
  isLive: true,
  youtubeEmbedUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_LIVE_EMBED ||
    "https://www.youtube.com/embed/jfKfPfyJRdk",
  thumbnail:
    "https://images.unsplash.com/photo-1478737273-78417779e661?w=1200&q=80",
  viewCount: 12840,
};

export const demoVideos: VideoCard[] = [
  {
    _id: "v1",
    title: "Inside Freetown: A Day in the Capital",
    slug: "inside-freetown",
    thumbnail:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
    duration: 720,
    viewCount: 45000,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: "v2",
    title: "West Africa Economic Outlook 2026",
    slug: "west-africa-economic-outlook",
    thumbnail:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    duration: 1240,
    viewCount: 28000,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "v3",
    title: "Sports Weekly: SL Premier League Highlights",
    slug: "sl-premier-league-highlights",
    thumbnail:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    duration: 480,
    viewCount: 67000,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const demoBreakingHeadlines = demoArticles
  .filter((a) => a.isBreaking)
  .map((a) => a.title)
  .concat([
    "Markets rally as regional currencies stabilize against dollar",
    "Health ministry announces expanded vaccination drive in rural districts",
  ]);
