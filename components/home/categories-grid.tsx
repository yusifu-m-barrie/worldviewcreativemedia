"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryItem {
  name: string;
  slug: string;
  count?: number;
}

interface CategoriesGridProps {
  categories: CategoryItem[];
}

const colors = [
  "from-[#2E2A86] to-[#4a46a8]",
  "from-[#E8872A] to-[#f5a04d]",
  "from-[#2E2A86] to-[#E8872A]",
  "from-[#1a1760] to-[#2E2A86]",
];

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/category/${cat.slug}`}
            className={`block rounded-xl bg-gradient-to-br ${colors[i % colors.length]} p-5 text-white transition hover:scale-[1.02] hover:shadow-lg`}
          >
            <h3 className="font-bold">{cat.name}</h3>
            {cat.count != null && (
              <p className="mt-1 text-sm text-white/70">{cat.count} stories</p>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
