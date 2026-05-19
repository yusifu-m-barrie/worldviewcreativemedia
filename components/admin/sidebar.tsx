"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Video,
  Radio,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/articles/new", label: "New Article", icon: Plus },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/live", label: "Live TV", icon: Radio },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-[#2E2A86] text-white">
      <div className="border-b border-white/10 p-4">
        <SiteLogo href="/admin" onDark width={180} height={50} imageClassName="h-9" />
        <p className="mt-1 text-xs text-white/60">Content Management</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-[#E8872A] text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        <Link href="/" className="mt-2 block text-center text-xs text-white/50 hover:text-white">
          View Site →
        </Link>
      </div>
    </aside>
  );
}
