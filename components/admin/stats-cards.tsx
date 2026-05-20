import { FileText, Eye, Video, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string | number;
  icon: "articles" | "views" | "videos" | "live";
}

const icons = {
  articles: FileText,
  views: Eye,
  videos: Video,
  live: Radio,
};

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = icons[stat.icon];
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-foreground-muted">{stat.label}</CardTitle>
              <Icon className="h-4 w-4 text-[#E8872A]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
