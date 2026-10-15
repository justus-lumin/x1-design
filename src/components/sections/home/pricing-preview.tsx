import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/brand/primitives";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "to start",
    items: ["Up to 1 GB of documents", "20 questions every 30 days", "Export your record"],
    cta: { label: "Create a free account", href: "/pricing" },
  },
  {
    name: "Membership",
    price: "$97",
    cadence: "a month, or $997 a year",
    items: ["Automatic organization by entity", "Tax and estate document reviews", "The Weekly Brief", "Live bank connections"],
    cta: { label: "Become a member", href: "/pricing" },
    featured: true,
  },
  {
    name: "Professionals",
    price: "$499",
    cadence: "a month, from",
    items: ["Advisor Pro, Team and Practice plans", "From 10 to 30 client households", "One household review free"],
    cta: { label: "For professionals", href: "/professionals" },
  },
];

export function PricingPreview() {
  return (
    <section className="section-y">
      <Container>
        <SectionHeading title="Free to start. Build your family office." lede="Membership is the office that keeps going after the first question." />
        <Reveal className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-2 md:mt-20 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              data-reveal
              className={cn("flex flex-col rounded-[var(--radius)] bg-card p-7", p.featured && "bg-raised")}
            >
              <p className="text-[0.8125rem] text-muted-foreground">{p.name}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl font-medium tabular-nums tracking-tight">{p.price}</span>
                <span className="text-[0.8125rem] text-muted-foreground">{p.cadence}</span>
              </p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {p.items.map((it) => (
                  <li key={it} className="text-[0.8125rem] text-foreground/85">{it}</li>
                ))}
              </ul>
              <Button className="mt-8 self-start" size="sm" variant={p.featured ? "default" : "outline"} asChild>
                <Link href={p.cta.href}>
                  {p.cta.label} <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
