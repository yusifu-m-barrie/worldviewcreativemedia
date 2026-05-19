"use client";

import { ThemeToggle } from "@/components/theme-toggle";

interface AdminHeaderProps {
  name: string;
  role: string;
}

export function AdminHeader({ name, role }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <p className="text-sm text-foreground/65">
        Signed in as <span className="font-semibold text-foreground">{name}</span>
        <span className="ml-2 rounded bg-[#2E2A86]/10 px-2 py-0.5 text-xs font-medium text-[#2E2A86] dark:bg-[#E8872A]/20 dark:text-[#E8872A]">
          {role}
        </span>
      </p>
      <ThemeToggle variant="admin" />
    </header>
  );
}
