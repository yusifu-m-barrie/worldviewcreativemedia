import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ManageAdmins } from "@/components/admin/manage-admins";
import { canManageAdmins } from "@/lib/permissions";
import { listStaffAdmins } from "@/services/admin-users.service";
import { adminPageTitle, adminSubtitle } from "@/lib/admin-ui";
import type { Role } from "@/config/roles";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!canManageAdmins(role)) {
    redirect("/admin");
  }

  const admins = await listStaffAdmins();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminPageTitle}>Manage Admins</h1>
        <p className={`mt-1 ${adminSubtitle}`}>
          Add dashboard users and control access to articles, videos, live TV, and settings.
        </p>
      </div>
      <ManageAdmins admins={admins} />
    </div>
  );
}
