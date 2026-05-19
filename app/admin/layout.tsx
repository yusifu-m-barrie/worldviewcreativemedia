import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/config/roles";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import type { Role } from "@/config/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <AdminHeader name={session.user.name ?? "Admin"} role={role} />
        <main className="admin-main p-6 text-foreground">{children}</main>
      </div>
    </div>
  );
}
