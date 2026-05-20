"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import type { Role } from "@/config/roles";
import type { AdminPermissions } from "@/lib/admin-permissions";

interface AdminShellProps {
  name: string;
  role: Role;
  permissions: AdminPermissions;
  children: React.ReactNode;
}

export function AdminShell({ name, role, permissions, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <AdminSidebar
        role={role}
        permissions={permissions}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <AdminHeader
          name={name}
          role={role}
          onMenuClick={() => setMenuOpen(true)}
        />
        <main className="admin-main flex-1 p-4 text-foreground sm:p-6">{children}</main>
      </div>
    </div>
  );
}
