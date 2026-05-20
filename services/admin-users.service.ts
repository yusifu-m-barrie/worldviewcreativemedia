import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { resolvePermissions, type AdminPermissions } from "@/lib/admin-permissions";
import { CONTENT_ADMIN_ROLES, ROLES, type Role } from "@/config/roles";
import { User } from "@/models/User";

export interface StaffAdminRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: AdminPermissions;
  isActive: boolean;
  createdAt: string;
}

export async function listStaffAdmins(): Promise<StaffAdminRow[]> {
  if (!isDbConfigured() || !(await tryConnectDB())) return [];

  const users = await User.find({
    role: { $in: [...CONTENT_ADMIN_ROLES] },
  })
    .select("name email role permissions isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role as Role,
    permissions: resolvePermissions(u.role as Role, u.permissions ?? undefined),
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function getStaffAdminById(id: string): Promise<StaffAdminRow | null> {
  if (!isDbConfigured() || !(await tryConnectDB())) return null;

  const u = await User.findById(id)
    .select("name email role permissions isActive createdAt")
    .lean();

  if (!u || !CONTENT_ADMIN_ROLES.includes(u.role as Role)) return null;

  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role as Role,
    permissions: resolvePermissions(u.role as Role, u.permissions ?? undefined),
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}
