import { getSiteSettings } from "@/services/settings.service";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2A86] dark:text-white">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Social links, live TV defaults, contact info, and analytics
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
