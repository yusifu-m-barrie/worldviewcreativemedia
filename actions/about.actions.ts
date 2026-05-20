"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { canManageSite } from "@/lib/permissions";
import type { AboutPageValue, TeamMember } from "@/lib/about-defaults";
import { saveAboutPage } from "@/services/about.service";
import type { Role } from "@/config/roles";

const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
  order: z.number(),
});

const aboutSchema = z.object({
  headline: z.string().min(3),
  description: z.string().min(20),
  mission: z.string().min(10),
  teamMembers: z.array(teamMemberSchema),
});

export async function updateAboutPage(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!session?.user?.id || !canManageSite(role)) {
    return { error: "Only the main admin can update the About page." };
  }

  if (!isDbConfigured()) {
    return { error: "Database not configured" };
  }

  let teamMembers: TeamMember[] = [];
  const raw = formData.get("teamMembers");
  if (typeof raw === "string" && raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) teamMembers = parsed as TeamMember[];
    } catch {
      return { error: "Invalid team members data" };
    }
  }

  const parsed = aboutSchema.safeParse({
    headline: formData.get("headline"),
    description: formData.get("description"),
    mission: formData.get("mission"),
    teamMembers,
  });

  if (!parsed.success) {
    return { error: "Invalid About page data", details: parsed.error.flatten() };
  }

  if (!(await tryConnectDB())) {
    return { error: "Could not connect to database" };
  }

  const value: AboutPageValue = {
    ...parsed.data,
    teamMembers: parsed.data.teamMembers.map((m) => ({
      ...m,
      bio: m.bio ?? "",
      image: m.image ?? "",
    })),
  };
  await saveAboutPage(value);

  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}
