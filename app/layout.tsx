import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = buildMetadata({});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${montserrat.variable} min-h-screen font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
