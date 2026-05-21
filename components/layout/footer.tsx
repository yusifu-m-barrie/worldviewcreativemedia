"use client";

import Link from "next/link";
import { Share2, Globe, Video, Camera, Music2 } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { useTranslations } from "@/components/i18n/locale-provider";
import { siteConfig } from "@/config/site";

export function Footer() {
  const t = useTranslations();

  const footerSections = [
    {
      title: t("footer.news"),
      links: [
        { href: "/news", label: t("footer.latestNews") },
        { href: "/categories", label: t("footer.allCategories") },
        { href: "/category/national", label: t("footer.national") },
        { href: "/category/africa", label: t("footer.africa") },
        { href: "/category/world", label: t("footer.world") },
      ],
    },
    {
      title: t("footer.media"),
      links: [
        { href: "/live-tv", label: t("nav.liveTv") },
        { href: "/videos", label: t("nav.videos") },
        { href: "/blog", label: t("nav.blog") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("footer.aboutUs") },
        { href: "/contact", label: t("footer.contact") },
        { href: "/advertise", label: t("footer.advertise") },
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms", label: t("footer.terms") },
      ],
    },
  ];

  return (
    <footer className="bg-[#2E2A86] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute -bottom-20 left-0 h-32 w-full bg-[#E8872A]/20 skew-y-2" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <SiteLogo href="/" onDark className="mb-4" width={200} height={56} />
              <p className="text-sm text-white/70">{siteConfig.description.slice(0, 120)}…</p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 font-bold text-[#E8872A]">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} {siteConfig.name}. {t("common.allRights")}
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.social.facebook} aria-label="Facebook" className="text-white/70 hover:text-[#E8872A]">
                <Share2 className="h-5 w-5" />
              </a>
              <a href={siteConfig.social.twitter} aria-label="Twitter" className="text-white/70 hover:text-[#E8872A]">
                <Globe className="h-5 w-5" />
              </a>
              <a href={siteConfig.social.youtube} aria-label="YouTube" className="text-white/70 hover:text-[#E8872A]">
                <Video className="h-5 w-5" />
              </a>
              {siteConfig.social.tiktok ? (
                <a href={siteConfig.social.tiktok} aria-label="TikTok" className="text-white/70 hover:text-[#E8872A]">
                  <Music2 className="h-5 w-5" />
                </a>
              ) : null}
              <a href={siteConfig.social.instagram} aria-label="Instagram" className="text-white/70 hover:text-[#E8872A]">
                <Camera className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
