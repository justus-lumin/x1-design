import { Capabilities } from "@/components/sections/home/capabilities";
import { Faq } from "@/components/sections/home/faq";
import { Hero } from "@/components/sections/home/hero";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { PricingPreview } from "@/components/sections/home/pricing-preview";
import { Someone } from "@/components/sections/home/someone";
import { Statement } from "@/components/sections/home/statement";
import { Testimonial } from "@/components/sections/home/testimonial";
import { CtaBand } from "@/components/site/cta-band";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Capabilities />
      <Someone />
      <Statement />
      <Testimonial />
      <PricingPreview />
      <Faq />
      <CtaBand />
    </>
  );
}
