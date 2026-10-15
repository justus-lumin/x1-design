import Link from "next/link";
import { X1Mark } from "@/components/brand/logo";
import { Container } from "@/components/brand/primitives";
import { footer, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="pt-24 pb-10">
      <Container>
        <div className="grid-12 gap-y-14">
          <div className="col-span-4 flex flex-col gap-5 md:col-span-4">
            <X1Mark className="h-7 self-start" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A family office built around you. The record stays yours as the people around it change.
            </p>
            <a href={`mailto:${SITE.email}`} className="text-sm text-foreground/80 hover:text-foreground">
              {SITE.email}
            </a>
          </div>
          {footer.map((group) => (
            <div key={group.title} className="col-span-2">
              <p className="mb-5 text-[0.8125rem] text-muted-foreground">{group.title}</p>
              <ul className="flex flex-col gap-3">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[0.8125rem] text-foreground/80 transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-24 flex flex-col gap-6 text-xs leading-relaxed text-subtle md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl">
            X1 Wealth Technologies, Inc. San Diego and New York. X1 is software for organizing your record and preparing
            questions for your professionals. It is not a registered investment adviser, law firm, or accounting firm, and it
            does not hold, trade or move money.
          </p>
          <div className="flex gap-6">
            <Link href="/legal/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <Link href="/legal/terms-and-conditions" className="hover:text-foreground">Terms</Link>
            <span>© 2026</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
