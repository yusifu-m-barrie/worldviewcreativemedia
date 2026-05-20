import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/config/roles";
import { resolvePermissions } from "@/lib/admin-permissions";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Role } from "@/config/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    redirect("/login?callbackUrl=/admin");
  }

  const permissions = resolvePermissions(
    role,
    session.user.permissions ?? undefined
  );

  return (
    <AdminShell name={session.user.name ?? "Admin"} role={role} permissions={permissions}>
      {children}
    </AdminShell>
  );
}
