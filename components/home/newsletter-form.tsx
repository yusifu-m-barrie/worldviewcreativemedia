"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "default" | "sidebar";
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isSidebar = variant === "sidebar";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setEmail("");
    toast.success("Thanks for subscribing to WorldView updates!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={isSidebar ? "flex flex-col gap-3" : "flex flex-col gap-3 sm:flex-row"}
    >
      <div className="relative flex-1">
        <Mail
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isSidebar ? "text-white/50" : "text-gray-400"}`}
        />
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={
            isSidebar
              ? "border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50"
              : "pl-10"
          }
          required
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className={
          isSidebar
            ? "w-full bg-red-600 font-semibold text-white hover:bg-red-700"
            : undefined
        }
        variant={isSidebar ? "default" : "orange"}
      >
        {loading ? "Subscribing…" : isSidebar ? "Subscribe Free →" : "Subscribe"}
      </Button>
    </form>
  );
}
