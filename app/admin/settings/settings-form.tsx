"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { SiteSettingsValue } from "@/lib/settings-defaults";
import { adminField, adminLabel, adminPanel, adminSectionTitle, adminTextarea } from "@/lib/admin-ui";

export function SettingsForm({ settings }: { settings: SiteSettingsValue }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSettings(formData);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Settings saved");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 sm:space-y-8">
      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>General</h2>
        <div>
          <label htmlFor="siteName" className={adminLabel}>Site name</label>
          <Input id="siteName" name="siteName" defaultValue={settings.siteName} required />
        </div>
        <div>
          <label htmlFor="tagline" className={adminLabel}>Tagline</label>
          <textarea
            id="tagline"
            name="tagline"
            rows={2}
            defaultValue={settings.tagline}
            required
            className={adminTextarea}
          />
        </div>
      </section>

      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>Contact</h2>
        <div>
          <label htmlFor="contactEmail" className={adminLabel}>Email</label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} required />
        </div>
        <div>
          <label htmlFor="contactPhone" className={adminLabel}>Phone</label>
          <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} />
        </div>
        <div>
          <label htmlFor="contactAddress" className={adminLabel}>Address</label>
          <Input id="contactAddress" name="contactAddress" defaultValue={settings.contactAddress} />
        </div>
      </section>

      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>Social media</h2>
        <div>
          <label htmlFor="socialFacebook" className={adminLabel}>Facebook Page URL</label>
          <Input id="socialFacebook" name="socialFacebook" defaultValue={settings.social.facebook} required />
        </div>
        <div>
          <label htmlFor="socialYoutube" className={adminLabel}>YouTube Channel URL</label>
          <Input id="socialYoutube" name="socialYoutube" defaultValue={settings.social.youtube} required />
        </div>
        <div>
          <label htmlFor="socialTiktok" className={adminLabel}>TikTok Profile URL</label>
          <Input id="socialTiktok" name="socialTiktok" defaultValue={settings.social.tiktok} placeholder="https://www.tiktok.com/@username" />
        </div>
        <div>
          <label htmlFor="socialInstagram" className={adminLabel}>Instagram</label>
          <Input id="socialInstagram" name="socialInstagram" defaultValue={settings.social.instagram} />
        </div>
        <div>
          <label htmlFor="socialTwitter" className={adminLabel}>X (Twitter)</label>
          <Input id="socialTwitter" name="socialTwitter" defaultValue={settings.social.twitter} />
        </div>
        <div>
          <label htmlFor="socialWhatsapp" className={adminLabel}>WhatsApp link</label>
          <Input id="socialWhatsapp" name="socialWhatsapp" defaultValue={settings.social.whatsapp} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-[#E8872A]/30 bg-[#E8872A]/5 p-6 dark:bg-[#E8872A]/10">
        <h2 className={adminSectionTitle}>Live TV defaults</h2>
        <div>
          <label htmlFor="liveDefaultPlatform" className={adminLabel}>Default platform</label>
          <select
            id="liveDefaultPlatform"
            name="liveDefaultPlatform"
            defaultValue={settings.live.defaultPlatform}
            className={adminField}
          >
            <option value="facebook">Facebook Live (recommended)</option>
            <option value="youtube">YouTube Live</option>
            <option value="tiktok">TikTok Live</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label htmlFor="liveFacebookPageUrl" className={adminLabel}>Facebook Page URL</label>
          <Input id="liveFacebookPageUrl" name="liveFacebookPageUrl" defaultValue={settings.live.facebookPageUrl} required />
        </div>
        <div>
          <label htmlFor="liveYoutubeChannelUrl" className={adminLabel}>YouTube Channel URL</label>
          <Input id="liveYoutubeChannelUrl" name="liveYoutubeChannelUrl" defaultValue={settings.live.youtubeChannelUrl} required />
        </div>
        <div>
          <label htmlFor="liveTiktokProfileUrl" className={adminLabel}>TikTok Profile URL</label>
          <Input id="liveTiktokProfileUrl" name="liveTiktokProfileUrl" defaultValue={settings.live.tiktokProfileUrl} placeholder="https://www.tiktok.com/@username" />
        </div>
        <div>
          <label htmlFor="liveOfflineMessage" className={adminLabel}>Offline message</label>
          <textarea
            id="liveOfflineMessage"
            name="liveOfflineMessage"
            rows={2}
            defaultValue={settings.live.offlineMessage}
            required
            className={adminTextarea}
          />
        </div>
      </section>

      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>Google AdSense</h2>
        <p className="text-sm text-foreground-muted">
          Up to 5 ad slots (homepage hero, sidebar, mid-content, article mid, footer). Leave slot IDs empty to hide a placement.
        </p>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="adsenseEnabled"
            defaultChecked={settings.ads?.enabled !== false}
            className="rounded"
          />
          Enable AdSense
        </label>
        <div>
          <label htmlFor="adsenseClientId" className={adminLabel}>Publisher ID (ca-pub-…)</label>
          <Input
            id="adsenseClientId"
            name="adsenseClientId"
            defaultValue={settings.ads?.adsenseClientId || ""}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slotHomepageHero" className={adminLabel}>Homepage — below hero</label>
            <Input id="slotHomepageHero" name="slotHomepageHero" defaultValue={settings.ads?.slots?.homepageHero || ""} placeholder="1234567890" />
          </div>
          <div>
            <label htmlFor="slotHomepageSidebar" className={adminLabel}>Homepage — sidebar</label>
            <Input id="slotHomepageSidebar" name="slotHomepageSidebar" defaultValue={settings.ads?.slots?.homepageSidebar || ""} placeholder="1234567890" />
          </div>
          <div>
            <label htmlFor="slotHomepageMid" className={adminLabel}>Homepage — mid content</label>
            <Input id="slotHomepageMid" name="slotHomepageMid" defaultValue={settings.ads?.slots?.homepageMid || ""} placeholder="1234567890" />
          </div>
          <div>
            <label htmlFor="slotArticleMid" className={adminLabel}>Articles — between paragraphs</label>
            <Input id="slotArticleMid" name="slotArticleMid" defaultValue={settings.ads?.slots?.articleMid || ""} placeholder="1234567890" />
          </div>
          <div>
            <label htmlFor="slotFooter" className={adminLabel}>Footer — site-wide</label>
            <Input id="slotFooter" name="slotFooter" defaultValue={settings.ads?.slots?.footer || ""} placeholder="1234567890" />
          </div>
        </div>
      </section>

      <section className={`space-y-4 ${adminPanel}`}>
        <h2 className={adminSectionTitle}>Analytics</h2>
        <div>
          <label htmlFor="googleAnalyticsId" className={adminLabel}>
            Google Analytics ID
          </label>
          <Input
            id="googleAnalyticsId"
            name="googleAnalyticsId"
            defaultValue={settings.analytics?.googleAnalyticsId || ""}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="mt-1 text-xs text-foreground-muted">
            From Google Analytics → Admin → Data streams → your web stream → Measurement ID.
            Starts with <code className="rounded bg-muted px-1">G-</code>. Leave empty to disable.
            You can also set <code className="rounded bg-muted px-1">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> on
            Vercel (overrides this field).
          </p>
        </div>
      </section>

      <Button type="submit" variant="orange" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
