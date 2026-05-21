import { auth } from "@/lib/auth";
import { isSuperAdmin, type Role } from "@/config/roles";
import { isDbConfigured } from "@/lib/db";

export async function requireSuperAdmin() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!session?.user?.id || !isSuperAdmin(role)) {
    return { error: "Only the main admin can delete this item." as const, session: null };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" as const, session: null };
  }

  return { error: null, session };
}
