import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AboutForm } from "@/components/admin/about-form";
import { canManageSite } from "@/lib/permissions";
import { getAboutPage } from "@/services/about.service";
import { adminPageTitle, adminSubtitle } from "@/lib/admin-ui";
import type { Role } from "@/config/roles";

export default async function AdminAboutPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!canManageSite(role)) {
    redirect("/admin/articles");
  }

  const about = await getAboutPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminPageTitle}>About Page</h1>
        <p className={`mt-1 ${adminSubtitle}`}>
          Edit the public About Us page — company description and team members. Only the main admin
          can change this content.
        </p>
      </div>
      <AboutForm about={about} />
    </div>
  );
}
