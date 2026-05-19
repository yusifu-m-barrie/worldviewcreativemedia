"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Radio } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/live-tv", label: "Live TV" },
  { href: "/videos", label: "Videos" },
  { href: "/blog", label: "Blog" },
  { href: "/categories", label: "Categories" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#2E2A86] shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <SiteLogo href="/" onDark priority />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/live-tv"
            className="ml-2 flex items-center gap-1 rounded-full bg-[#E8872A] px-3 py-1.5 text-xs font-bold uppercase text-white"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden rounded-md p-2 text-white hover:bg-white/10 sm:block">
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <Button asChild variant="orange" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <button
            type="button"
            className="rounded-md p-2 text-white lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-white/10 lg:hidden", open ? "block" : "hidden")}>
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/search" className="rounded-md px-3 py-2 text-white hover:bg-white/10" onClick={() => setOpen(false)}>
            Search
          </Link>
          <Link href="/login" className="rounded-md px-3 py-2 font-semibold text-[#E8872A]" onClick={() => setOpen(false)}>
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
