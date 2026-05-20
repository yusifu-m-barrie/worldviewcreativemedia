import {
  canManageAdmins,
  hasPermission,
  type AdminPermissions,
  type PermissionKey,
} from "@/lib/admin-permissions";
import { isSuperAdmin, type Role } from "@/config/roles";

export type { AdminPermissions, PermissionKey };

export function canAccessPermission(
  role: Role | undefined,
  permissions: AdminPermissions | undefined,
  key: PermissionKey
): boolean {
  return hasPermission(role, permissions, key);
}

export { canManageAdmins };

/** About page + team dashboard — main admin only */
export function canManageSite(role: Role | undefined): boolean {
  return isSuperAdmin(role);
}

export function canEditArticle(
  role: Role | undefined,
  permissions: AdminPermissions | undefined,
  userId: string | undefined,
  authorId: string
): boolean {
  if (!role || !userId) return false;
  if (isSuperAdmin(role)) return true;
  if (!hasPermission(role, permissions, "articles")) return false;
  return String(authorId) === String(userId);
}
