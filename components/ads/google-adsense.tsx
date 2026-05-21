import Script from "next/script";

interface GoogleAdsenseProps {
  clientId: string;
}

/** Loads AdSense library once per page (after interactive). */
export function GoogleAdsense({ clientId }: GoogleAdsenseProps) {
  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
