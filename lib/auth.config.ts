import type { NextAuthConfig } from "next-auth";
import { ADMIN_ROLES, ROLES, isSuperAdmin, type Role } from "@/config/roles";
import {
  getDefaultAdminLanding,
  hasPermission,
  resolvePermissions,
  type AdminPermissions,
  type PermissionKey,
} from "@/lib/admin-permissions";

const SUPER_ADMIN_ONLY_PREFIXES = ["/admin/about", "/admin/team", "/admin/users"];

const ROUTE_PERMISSIONS: [string, PermissionKey][] = [
  ["/admin/articles", "articles"],
  ["/admin/videos", "videos"],
  ["/admin/live", "liveTv"],
  ["/admin/settings", "settings"],
];

/**
 * Edge-safe Auth.js config (no MongoDB/bcrypt).
 * Used by middleware; extended with Credentials in lib/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      if (!auth?.user) return false;

      const role = auth.user.role as Role | undefined;
      if (!role || !ADMIN_ROLES.includes(role)) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      const perms =
        (auth.user as { permissions?: AdminPermissions }).permissions ??
        resolvePermissions(role, null);

      const path = request.nextUrl.pathname;

      if (
        SUPER_ADMIN_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
        !isSuperAdmin(role)
      ) {
        return Response.redirect(new URL(getDefaultAdminLanding(perms), request.nextUrl));
      }

      for (const [prefix, key] of ROUTE_PERMISSIONS) {
        if (path.startsWith(prefix) && !hasPermission(role, perms, key)) {
          return Response.redirect(new URL(getDefaultAdminLanding(perms), request.nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user.role as Role) || ROLES.USER;
        token.permissions = (user as { permissions?: AdminPermissions }).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || ROLES.USER;
        session.user.permissions = resolvePermissions(
          session.user.role,
          token.permissions as AdminPermissions | undefined
        );
      }
      return session;
    },
  },
  providers: [],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
