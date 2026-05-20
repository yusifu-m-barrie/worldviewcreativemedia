"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  parsePermissionsFromForm,
  resolvePermissions,
  type AdminPermissions,
} from "@/lib/admin-permissions";
import { canManageAdmins } from "@/lib/permissions";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { CONTENT_ADMIN_ROLES, type Role } from "@/config/roles";
import { User } from "@/models/User";
import type { Role as RoleType } from "@/config/roles";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "editor", "journalist", "moderator"]),
});

const updateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "journalist", "moderator"]),
  password: z.union([z.string().min(8), z.literal("")]).optional(),
});

async function requireSuperAdmin() {
  const session = await auth();
  const role = session?.user?.role as RoleType | undefined;
  if (!session?.user?.id || !canManageAdmins(role)) {
    return { error: "Only the main admin can manage admins." as const, session: null };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" as const, session: null };
  }
  if (!(await tryConnectDB())) {
    return { error: "Could not connect to database" as const, session: null };
  }
  return { error: null, session };
}

function permissionsFromForm(formData: FormData): AdminPermissions {
  const parsed = parsePermissionsFromForm(formData);
  if (
    !parsed.articles &&
    !parsed.videos &&
    !parsed.liveTv &&
    !parsed.settings
  ) {
    return { ...parsed, articles: true };
  }
  return parsed;
}

export async function createStaffAdmin(formData: FormData) {
  const check = await requireSuperAdmin();
  if (check.error) return { error: check.error };

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const permissions = permissionsFromForm(formData);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    password: passwordHash,
    role: parsed.data.role,
    permissions,
    isActive: true,
    bookmarks: [],
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateStaffAdmin(userId: string, formData: FormData) {
  const check = await requireSuperAdmin();
  if (check.error) return { error: check.error };

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") || "",
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const user = await User.findById(userId);
  if (!user || !CONTENT_ADMIN_ROLES.includes(user.role)) {
    return { error: "Admin not found" };
  }

  const emailTaken = await User.findOne({
    email: parsed.data.email.toLowerCase(),
    _id: { $ne: userId },
  });
  if (emailTaken) {
    return { error: "Email is already in use" };
  }

  user.name = parsed.data.name;
  user.email = parsed.data.email.toLowerCase();
  user.role = parsed.data.role;
  user.permissions = permissionsFromForm(formData);

  const newPassword = parsed.data.password?.trim();
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 12);
  }

  await user.save();

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setStaffAdminActive(userId: string, isActive: boolean) {
  const check = await requireSuperAdmin();
  if (check.error) return { error: check.error };

  const user = await User.findById(userId);
  if (!user || !CONTENT_ADMIN_ROLES.includes(user.role)) {
    return { error: "Admin not found" };
  }

  if (check.session?.user?.id === userId && !isActive) {
    return { error: "You cannot deactivate your own account" };
  }

  user.isActive = isActive;
  await user.save();

  revalidatePath("/admin/users");
  return { success: true };
}
