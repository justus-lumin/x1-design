import { SplitHeading } from "@/components/motion/split-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const homeFaq = [
  {
    q: "What can I do for free, and what does membership add?",
    a: "Create a free account and add your documents, up to 1 GB, and X1 prepares supported files for search. Ask up to 20 questions every 30 days, download your originals and export your supported record. Membership adds automatic organization under the business, trust, property or person each document belongs to, tax and estate document reviews, the Weekly Brief, live bank connections, and more capacity.",
  },
  {
    q: "Who can see my documents?",
    a: "Access follows roles, household relationships, and the sharing permissions you grant. Authorized X1 staff and service providers may also process information to run and secure the service. The security page explains who can access documents, which providers process them, model training, deletion and export.",
  },
  {
    q: "Does X1 give financial, tax or legal advice?",
    a: "No. X1 is software for organizing your record and preparing questions for your CPA, attorney or advisor. It is not a registered investment adviser, law firm, or accounting firm, and it does not hold your money.",
  },
  {
    q: "Do my professionals need an X1 account?",
    a: "No. For supported email handoffs, they receive the question and selected material and reply by email without creating an account. You review what to share before sending it.",
  },
  {
    q: "Can I use it from Claude or ChatGPT?",
    a: "With assistant access on your X1 account, you can use your saved record in Claude, Claude Code, ChatGPT or Codex. Muse is available for professional accounts. Your assistant's own plan and settings apply.",
  },
  {
    q: "Who is behind X1?",
    a: "X1 Wealth Technologies, Inc., founded by Mat Silverstein, working from San Diego and New York. Write to hello@x1wealth.com and a human answers.",
  },
];

export function Faq({ items = homeFaq }: { items?: { q: string; a: string }[] }) {
  return (
    <section className="section-y">
      <div className="container-x1">
        <div className="mx-auto max-w-3xl">
          <SplitHeading className="text-center font-display text-display-md font-medium">Questions before you start.</SplitHeading>
          <Accordion type="single" collapsible className="mt-14 flex flex-col gap-2">
            {items.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
