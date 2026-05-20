import { isSuperAdmin, ROLES, type Role } from "@/config/roles";

export interface AdminPermissions {
  articles: boolean;
  videos: boolean;
  liveTv: boolean;
  settings: boolean;
}

export const FULL_ADMIN_PERMISSIONS: AdminPermissions = {
  articles: true,
  videos: true,
  liveTv: true,
  settings: true,
};

export const DEFAULT_STAFF_PERMISSIONS: AdminPermissions = {
  articles: true,
  videos: false,
  liveTv: false,
  settings: false,
};

export type PermissionKey = keyof AdminPermissions;

/** Roles that can be created from the Manage Admins screen */
export const MANAGED_STAFF_ROLES = [ROLES.ADMIN, ROLES.EDITOR, ROLES.JOURNALIST, ROLES.MODERATOR] as const;

export function resolvePermissions(
  role: Role,
  stored?: Partial<AdminPermissions> | null
): AdminPermissions {
  if (isSuperAdmin(role)) return { ...FULL_ADMIN_PERMISSIONS };

  const resolved: AdminPermissions = {
    articles: Boolean(stored?.articles),
    videos: Boolean(stored?.videos),
    liveTv: Boolean(stored?.liveTv),
    settings: Boolean(stored?.settings),
  };

  // Legacy admins created before permissions existed — default to articles only
  const noFlags =
    !resolved.articles && !resolved.videos && !resolved.liveTv && !resolved.settings;
  if (noFlags && role !== ROLES.USER && role !== ROLES.SUPER_ADMIN) {
    return { ...DEFAULT_STAFF_PERMISSIONS };
  }

  return resolved;
}

export function hasPermission(
  role: Role | undefined,
  permissions: AdminPermissions | undefined,
  key: PermissionKey
): boolean {
  if (!role) return false;
  if (isSuperAdmin(role)) return true;
  return Boolean(permissions?.[key]);
}

export function canManageAdmins(role: Role | undefined): boolean {
  return isSuperAdmin(role);
}

/** Any dashboard section that uses media uploads */
export function canUseMediaUpload(
  role: Role | undefined,
  permissions: AdminPermissions | undefined
): boolean {
  if (!role) return false;
  if (isSuperAdmin(role)) return true;
  return (
    hasPermission(role, permissions, "articles") ||
    hasPermission(role, permissions, "videos") ||
    hasPermission(role, permissions, "liveTv") ||
    hasPermission(role, permissions, "settings")
  );
}

export function parsePermissionsFromForm(formData: FormData): AdminPermissions {
  return {
    articles: formData.get("permArticles") === "on",
    videos: formData.get("permVideos") === "on",
    liveTv: formData.get("permLiveTv") === "on",
    settings: formData.get("permSettings") === "on",
  };
}

export function getDefaultAdminLanding(permissions: AdminPermissions): string {
  if (permissions.articles) return "/admin/articles";
  if (permissions.videos) return "/admin/videos";
  if (permissions.liveTv) return "/admin/live";
  if (permissions.settings) return "/admin/settings";
  return "/admin";
}
