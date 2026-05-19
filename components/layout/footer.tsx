import Link from "next/link";
import { Share2, Globe, Video, Camera } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { siteConfig } from "@/config/site";

const footerLinks = {
  News: [
    { href: "/news", label: "Latest News" },
    { href: "/categories", label: "All Categories" },
    { href: "/category/national", label: "National" },
    { href: "/category/africa", label: "Africa" },
    { href: "/category/world", label: "World" },
  ],
  Media: [
    { href: "/live-tv", label: "Live TV" },
    { href: "/videos", label: "Videos" },
    { href: "/blog", label: "Blog" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/advertise", label: "Advertise" },
    { href: "/careers", label: "Careers" },
  ],
};

export function Footer() {
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
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-4 font-bold text-[#E8872A]">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
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
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
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
