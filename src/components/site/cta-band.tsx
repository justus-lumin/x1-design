import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { Container } from "@/components/brand/primitives";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";

/** Closing slice for every page. One shader moment, one question, one action. */
export function CtaBand({
  title = "Start with one question.",
  body = "Ask the thing you keep meaning to ask. X1 answers from your own record and, when the answer needs a professional, writes the question for them.",
  primary = { label: "Start free", href: "/pricing" },
}: {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
}) {
  return (
    <section className="section-y">
      <Container>
        <div className="dark relative isolate overflow-hidden rounded-[var(--radius-tile)] bg-background text-foreground">
          <GrainShader angle={70} light={0.3} folds={0.8} interactive />
          {/* Soft pool of the surface tone behind the copy keeps it legible over bright grain. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,var(--background)_0%,transparent_100%)] opacity-80" />
          <div className="relative flex flex-col items-center px-6 py-24 text-center md:py-40">
            <SplitHeading className="max-w-2xl font-display text-display-lg font-medium">{title}</SplitHeading>
            <p className="mt-6 max-w-md text-muted-foreground text-pretty">{body}</p>
            <div className="mt-9">
              <Magnetic>
                <Button size="lg" asChild>
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
