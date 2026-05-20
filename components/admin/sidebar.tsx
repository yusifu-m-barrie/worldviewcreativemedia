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
  X,
  Info,
  Users,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isSuperAdmin, type Role } from "@/config/roles";
import {
  hasPermission,
  type AdminPermissions,
  type PermissionKey,
} from "@/lib/admin-permissions";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
  permission?: PermissionKey;
}

const allLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Admins", icon: UserCog, superAdminOnly: true },
  { href: "/admin/articles", label: "Articles", icon: FileText, permission: "articles" },
  { href: "/admin/articles/new", label: "New Article", icon: Plus, permission: "articles" },
  { href: "/admin/team", label: "Team Activity", icon: Users, superAdminOnly: true },
  { href: "/admin/about", label: "About Page", icon: Info, superAdminOnly: true },
  { href: "/admin/videos", label: "Videos", icon: Video, permission: "videos" },
  { href: "/admin/live", label: "Live TV", icon: Radio, permission: "liveTv" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
];

interface AdminSidebarProps {
  role: Role;
  permissions: AdminPermissions;
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ role, permissions, open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const superAdmin = isSuperAdmin(role);

  const links = allLinks.filter((link) => {
    if (link.superAdminOnly) return superAdmin;
    if (link.permission) return hasPermission(role, permissions, link.permission);
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,17rem)] shrink-0 flex-col border-r border-white/10 bg-[#2E2A86] text-white shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="relative border-b border-white/10 p-4 pr-12">
        <SiteLogo href="/admin" onDark width={180} height={50} imageClassName="h-8 max-w-full sm:h-9" />
        <p className="mt-1 text-xs text-white/60">
          {superAdmin ? "Main Admin" : "Dashboard User"}
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-4 rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-[#E8872A] text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
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
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          Sign Out
        </Button>
        <Link
          href="/"
          onClick={onClose}
          className="mt-2 block text-center text-xs text-white/50 hover:text-white"
        >
          View Site →
        </Link>
      </div>
    </aside>
  );
}
