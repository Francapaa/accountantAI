import Script from "next/script";

/**
 * Privacy-first analytics (Plausible). Activate by setting
 * NEXT_PUBLIC_ANALYTICS_DOMAIN in .env.local. If unset, nothing is loaded.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!domain) {
    return null;
  }

  return (
    <Script
      defer
      data-domain={domain}
      data-api="/api/event"
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}