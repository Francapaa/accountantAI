import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import {
  Cta,
  Faq,
  Features,
  Footer,
  Header,
  Hero,
  HowItWorks,
  PinHighlights,
  Problem,
  StructuredData,
} from "./components";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <Header />
      <main id="contenido">
        <Hero />
        <PinHighlights />
        <Problem />
        <Features />
        <HowItWorks />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}