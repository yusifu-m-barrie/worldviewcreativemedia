/** Shared Tailwind classes for admin CMS — respects light/dark theme */

export const adminPageTitle = "text-xl font-bold text-foreground sm:text-2xl";

export const adminPageHeader =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

export const adminSubtitle = "text-sm font-medium text-foreground-muted";

export const adminLabel = "mb-1 block text-sm font-medium text-foreground";

export const adminField =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground ring-offset-background placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E2A86] dark:focus-visible:ring-[#E8872A]";

export const adminTextarea =
  "flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E2A86] dark:focus-visible:ring-[#E8872A]";

export const adminPanel =
  "rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6";

export const adminTableWrap =
  "overflow-x-auto rounded-xl border border-border bg-background [-webkit-overflow-scrolling:touch]";

export const adminTable = "w-full min-w-[640px] text-left text-sm text-foreground";

export const adminTableHead = "border-b border-border bg-muted";

export const adminTableRow = "border-b border-border last:border-0";

export const adminMuted = "text-sm text-foreground-muted";

export const adminSectionTitle = "font-bold text-foreground";
