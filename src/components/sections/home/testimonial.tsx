import { Container } from "@/components/brand/primitives";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";

export function Testimonial() {
  return (
    <section className="section-y">
      <Container>
        <figure className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <SplitHeading as="blockquote" className="font-display text-display-md font-medium">
            &ldquo;I&rsquo;m building my virtual family office on X1. It&rsquo;s what I wished existed when I started advising
            families twenty years ago.&rdquo;
          </SplitHeading>
          <Reveal as="figcaption" className="mt-10 flex flex-col items-center gap-1">
            <span data-reveal className="text-sm font-medium">Garrett Gunderson</span>
            <span data-reveal className="text-[0.8125rem] text-muted-foreground">Author of Killing Sacred Cows. Paying X1 customer.</span>
          </Reveal>
        </figure>
      </Container>
    </section>
  );
}
