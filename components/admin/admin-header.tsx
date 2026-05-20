"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  name: string;
  role: string;
  onMenuClick?: () => void;
}

export function AdminHeader({ name, role, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 sm:py-4">
      {onMenuClick ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground-muted">
          Signed in as{" "}
          <span className="font-semibold text-foreground">{name}</span>
        </p>
        <span className="mt-0.5 inline-block max-w-full truncate rounded bg-[#2E2A86]/10 px-2 py-0.5 text-xs font-medium text-[#2E2A86] dark:bg-[#E8872A]/20 dark:text-[#E8872A]">
          {role.replace(/_/g, " ")}
        </span>
      </div>

      <ThemeToggle variant="admin" />
    </header>
  );
}
