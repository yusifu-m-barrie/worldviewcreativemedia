"use client";

import { useState } from "react";
import { Pencil, UserPlus, UserX, UserCheck } from "lucide-react";
import {
  createStaffAdmin,
  setStaffAdminActive,
  updateStaffAdmin,
} from "@/actions/admin-user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { StaffAdminRow } from "@/services/admin-users.service";
import { adminLabel, adminPanel, adminTable, adminTableHead, adminTableRow, adminTableWrap } from "@/lib/admin-ui";
import { MANAGED_STAFF_ROLES } from "@/lib/admin-permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";

function PermissionCheckboxes({ permissions }: { permissions: AdminPermissions }) {
  const items: { name: string; key: keyof AdminPermissions; label: string }[] = [
    { name: "permArticles", key: "articles", label: "Articles" },
    { name: "permVideos", key: "videos", label: "Videos" },
    { name: "permLiveTv", key: "liveTv", label: "Live TV" },
    { name: "permSettings", key: "settings", label: "Settings" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(({ name, key, label }) => (
        <label key={key} className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name={name}
            defaultChecked={permissions[key]}
            className="rounded border-border"
          />
          {label}
        </label>
      ))}
    </div>
  );
}

function permLabels(p: AdminPermissions): string[] {
  const out: string[] = [];
  if (p.articles) out.push("Articles");
  if (p.videos) out.push("Videos");
  if (p.liveTv) out.push("Live TV");
  if (p.settings) out.push("Settings");
  return out.length ? out : ["None"];
}

export function ManageAdmins({ admins }: { admins: StaffAdminRow[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editing = admins.find((a) => a.id === editingId);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const result = await createStaffAdmin(new FormData(e.currentTarget));
    setPending(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Admin created — they can sign in at /login");
      setShowCreate(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    if (!editingId) return;
    e.preventDefault();
    setPending(true);
    const result = await updateStaffAdmin(editingId, new FormData(e.currentTarget));
    setPending(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Admin updated — they may need to sign in again for new permissions");
      setEditingId(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setPending(true);
    const result = await setStaffAdminActive(id, !isActive);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else toast.success(isActive ? "Admin deactivated" : "Admin reactivated");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-muted">
          Create dashboard users and choose what they can access. Main admin (you) always has full access.
        </p>
        <Button
          type="button"
          variant="orange"
          className="w-full sm:w-auto"
          onClick={() => {
            setShowCreate(!showCreate);
            setEditingId(null);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add admin
        </Button>
      </div>

      {showCreate ? (
        <form onSubmit={handleCreate} className={`space-y-4 ${adminPanel}`}>
          <h2 className="font-bold text-foreground">New admin</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel}>Full name</label>
              <Input name="name" required placeholder="Jane Doe" />
            </div>
            <div>
              <label className={adminLabel}>Email</label>
              <Input name="email" type="email" required placeholder="admin@example.com" />
            </div>
            <div>
              <label className={adminLabel}>Password</label>
              <Input name="password" type="password" required minLength={8} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className={adminLabel}>Role label</label>
              <select name="role" className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm" defaultValue="editor">
                {MANAGED_STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className={adminLabel}>Dashboard access</p>
            <PermissionCheckboxes
              permissions={{ articles: true, videos: false, liveTv: false, settings: false }}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="orange" disabled={pending}>
              {pending ? "Creating…" : "Create admin"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {editing ? (
        <form onSubmit={handleUpdate} className={`space-y-4 ${adminPanel}`}>
          <h2 className="font-bold text-foreground">Edit {editing.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel}>Full name</label>
              <Input name="name" required defaultValue={editing.name} />
            </div>
            <div>
              <label className={adminLabel}>Email</label>
              <Input name="email" type="email" required defaultValue={editing.email} />
            </div>
            <div>
              <label className={adminLabel}>New password (optional)</label>
              <Input name="password" type="password" minLength={8} placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className={adminLabel}>Role label</label>
              <select
                name="role"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                defaultValue={editing.role}
              >
                {MANAGED_STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className={adminLabel}>Dashboard access</p>
            <PermissionCheckboxes permissions={editing.permissions} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="orange" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className={adminTableWrap}>
        <table className={adminTable}>
          <thead className={adminTableHead}>
            <tr>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className={adminTableRow}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{admin.name}</p>
                  <p className="text-xs text-foreground-muted">{admin.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {admin.role.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {permLabels(admin.permissions).map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={admin.isActive ? "default" : "secondary"}>
                    {admin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => {
                        setEditingId(admin.id);
                        setShowCreate(false);
                      }}
                      aria-label={`Edit ${admin.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      disabled={pending}
                      onClick={() => toggleActive(admin.id, admin.isActive)}
                      aria-label={admin.isActive ? "Deactivate" : "Activate"}
                    >
                      {admin.isActive ? (
                        <UserX className="h-4 w-4 text-red-600" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!admins.length ? (
          <p className="p-8 text-center text-foreground-muted">
            No other admins yet. Click Add admin to create one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
