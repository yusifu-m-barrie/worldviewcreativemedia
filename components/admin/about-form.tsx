"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateAboutPage } from "@/actions/about.actions";
import { MediaUpload } from "@/components/admin/media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { AboutPageValue, TeamMember } from "@/lib/about-defaults";
import { adminLabel, adminPanel, adminSectionTitle, adminTextarea } from "@/lib/admin-ui";

function newMember(order: number): TeamMember {
  return {
    id: crypto.randomUUID(),
    name: "",
    title: "",
    bio: "",
    image: "",
    order,
  };
}

export function AboutForm({ about }: { about: AboutPageValue }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    about.teamMembers.length ? about.teamMembers : []
  );
  const [pending, setPending] = useState(false);

  function updateMember(id: string, patch: Partial<TeamMember>) {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMember(id: string) {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set(
      "teamMembers",
      JSON.stringify(teamMembers.map((m, i) => ({ ...m, order: i })))
    );
    const result = await updateAboutPage(formData);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else toast.success("About page saved");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-8">
      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>Company overview</h2>
        <div>
          <label htmlFor="headline" className={adminLabel}>
            Headline
          </label>
          <Input id="headline" name="headline" defaultValue={about.headline} required />
        </div>
        <div>
          <label htmlFor="description" className={adminLabel}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            defaultValue={about.description}
            className={adminTextarea}
            placeholder="Brief description of WorldView Creative Media"
          />
        </div>
        <div>
          <label htmlFor="mission" className={adminLabel}>
            Mission
          </label>
          <textarea
            id="mission"
            name="mission"
            rows={3}
            required
            defaultValue={about.mission}
            className={adminTextarea}
          />
        </div>
      </section>

      <section className={`space-y-4 ${adminPanel}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={adminSectionTitle}>Team members</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setTeamMembers((prev) => [...prev, newMember(prev.length)])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add member
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <p className="text-sm text-foreground-muted">No team members yet. Click Add member to start.</p>
        ) : null}

        {teamMembers.map((member, index) => (
          <div
            key={member.id}
            className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Member {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700"
                onClick={() => removeMember(member.id)}
                aria-label="Remove team member"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={adminLabel}>Name</label>
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.id, { name: e.target.value })}
                  required
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={adminLabel}>Role / title</label>
                <Input
                  value={member.title}
                  onChange={(e) => updateMember(member.id, { title: e.target.value })}
                  required
                  placeholder="e.g. Editor-in-Chief"
                />
              </div>
            </div>
            <div>
              <label className={adminLabel}>Bio</label>
              <textarea
                rows={2}
                value={member.bio}
                onChange={(e) => updateMember(member.id, { bio: e.target.value })}
                className={adminTextarea}
                placeholder="Short bio"
              />
            </div>
            <MediaUpload
              label="Photo"
              accept="image/*"
              resourceType="image"
              folder="worldview/team"
              value={member.image || ""}
              onChange={(url) => updateMember(member.id, { image: url })}
            />
          </div>
        ))}
      </section>

      <Button type="submit" variant="orange" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save About page"}
      </Button>
    </form>
  );
}
