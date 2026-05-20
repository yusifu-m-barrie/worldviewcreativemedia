import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllVideosForAdmin } from "@/services/video.service";
import { formatDate } from "@/lib/utils";
import {
  adminMuted,
  adminPageHeader,
  adminPageTitle,
  adminSubtitle,
  adminTable,
  adminTableHead,
  adminTableRow,
  adminTableWrap,
} from "@/lib/admin-ui";
import { DeleteVideoButton } from "./delete-video-button";

export default async function AdminVideosPage() {
  const videos = await getAllVideosForAdmin();

  return (
    <div className="space-y-6">
      <div className={adminPageHeader}>
        <div className="min-w-0">
          <h1 className={adminPageTitle}>Videos</h1>
          <p className={adminSubtitle}>Upload via Cloudinary or embed YouTube/Facebook links</p>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/admin/videos/new">
            <Plus className="mr-2 h-4 w-4" />
            New Video
          </Link>
        </Button>
      </div>

      <div className={adminTableWrap}>
        <table className={adminTable}>
          <thead className={adminTableHead}>
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={String(v._id)} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-foreground-muted">{v.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={v.status === "published" ? "default" : "secondary"}>{v.status}</Badge>
                  {v.isFeatured && <Badge variant="orange" className="ml-1">Featured</Badge>}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{v.viewCount?.toLocaleString() ?? 0}</td>
                <td className="px-4 py-3 text-foreground-muted">
                  {v.publishedAt ? formatDate(v.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {v.status === "published" && (
                      <Link href={`/videos/${v.slug}`} className="text-[#E8872A] hover:underline" target="_blank">
                        View
                      </Link>
                    )}
                    <DeleteVideoButton id={String(v._id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!videos.length && (
          <p className="p-8 text-center text-foreground-muted">No videos yet. Upload your first video.</p>
        )}
      </div>
    </div>
  );
}
