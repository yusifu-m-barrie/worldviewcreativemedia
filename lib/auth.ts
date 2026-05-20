import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { User } from "@/models/User";
import { resolvePermissions, type AdminPermissions } from "@/lib/admin-permissions";
import { type Role } from "@/config/roles";
import type { SessionUser } from "@/types";
import { authConfig } from "@/lib/auth.config";

declare module "next-auth" {
  interface User {
    role: Role;
    permissions?: AdminPermissions;
  }
  interface Session {
    user: SessionUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    permissions?: AdminPermissions;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!isDbConfigured()) return null;

        if (!(await tryConnectDB())) return null;

        const user = await User.findOne({
          email: credentials.email as string,
          isActive: true,
        }).select("+password");

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: resolvePermissions(user.role, user.permissions ?? undefined),
          image: user.image,
        };
      },
    }),
  ],
});
