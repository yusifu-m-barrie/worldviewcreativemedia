"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  variant?: "header" | "admin";
}

export function ThemeToggle({ variant = "header" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const className =
    variant === "admin"
      ? "rounded-md p-2 text-foreground/70 hover:bg-muted"
      : "rounded-md p-2 text-white hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={className}
      aria-label="Toggle theme"
    >
      {!mounted ? (
        <span className="inline-block h-5 w-5" aria-hidden />
      ) : resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
