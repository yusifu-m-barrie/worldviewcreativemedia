import { getSiteSettings } from "@/services/settings.service";
import { SettingsForm } from "./settings-form";
import { adminPageTitle, adminSubtitle } from "@/lib/admin-ui";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminPageTitle}>Site Settings</h1>
        <p className={`mt-1 ${adminSubtitle}`}>
          Social links, live TV defaults, contact info, and analytics
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
