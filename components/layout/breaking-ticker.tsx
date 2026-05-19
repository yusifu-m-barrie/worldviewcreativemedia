"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface BreakingTickerProps {
  headlines: string[];
}

export function BreakingTicker({ headlines }: BreakingTickerProps) {
  if (!headlines.length) return null;

  const text = headlines.join("   •   ");

  return (
    <div className="overflow-hidden bg-[#E8872A] text-white">
      <motion.div
        className="flex items-center gap-3 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="flex shrink-0 items-center gap-1 bg-[#2E2A86] px-3 py-1 text-xs font-bold uppercase">
          <Zap className="h-3 w-3" />
          Breaking
        </span>
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="whitespace-nowrap text-sm font-medium"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <span className="inline-block pr-16">{text}</span>
            <span className="inline-block pr-16">{text}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
