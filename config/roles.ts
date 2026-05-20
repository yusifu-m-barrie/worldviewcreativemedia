export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EDITOR: "editor",
  JOURNALIST: "journalist",
  MODERATOR: "moderator",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  journalist: 40,
  moderator: 30,
  user: 10,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.JOURNALIST,
  ROLES.MODERATOR,
];

/** Main admin — full CMS access including About, settings, videos, team oversight */
export const SUPER_ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN];

/** Sub-admins — create and edit their own articles only */
export const CONTENT_ADMIN_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.JOURNALIST,
  ROLES.MODERATOR,
];

export function isSuperAdmin(role: Role | undefined): boolean {
  return role === ROLES.SUPER_ADMIN;
}

export function isContentAdmin(role: Role | undefined): boolean {
  return Boolean(role && CONTENT_ADMIN_ROLES.includes(role));
}

export function canAccessAdmin(role: Role | undefined): boolean {
  return Boolean(role && ADMIN_ROLES.includes(role));
}
