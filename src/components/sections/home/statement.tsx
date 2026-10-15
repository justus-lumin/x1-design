import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/brand/primitives";
import { ScrubWords } from "@/components/motion/scrub-words";
import { Button } from "@/components/ui/button";

/** Ownership thesis, said once and plainly. Words ink in as you read. */
export function Statement() {
  return (
    <section className="section-y">
      <Container className="flex flex-col items-center text-center">
        <ScrubWords
          className="max-w-4xl font-display text-display-lg font-medium"
          text="Your financial life belongs to you. The work you do to understand it should keep helping you."
        />
        <p className="mt-8 max-w-lg text-muted-foreground text-pretty">
          Know what the record holds, choose who uses it, and carry it with you as advisors, institutions and AI models change.
        </p>
        <Button variant="ghost" className="mt-6" asChild>
          <Link href="/manifesto">
            Read the manifesto <ArrowRight />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
