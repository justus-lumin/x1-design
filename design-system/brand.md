# Brand

What X1 is, how it speaks, the example household every page uses, how provenance looks, and how the logo is used.

---

## 1. What X1 is

**A family office built around you.** X1 is software for complex households: an operating business, trusts, properties, and several professionals (CPA, attorney, advisor). It keeps the whole record, reads the documents, and tells the household which professional needs to hear about what, before the deadline instead of after.

What it does:

- Files every document under the business, trust, property or person it belongs to, and asks the household to confirm.
- Answers questions from the household's own record, citing the page and the clause.
- Notices when documents disagree (a K-1 against the operating agreement, a deed against the policy).
- Keeps the next 90 days of deadlines in context.
- Drafts the question for the right professional, with the documents attached. Nothing is sent until the household approves.
- Keeps decisions with their reasons, so the next advisor doesn't start from zero.
- Works from Claude, ChatGPT, Codex and Muse with the household's permissions.

What it never does, and the UI must never imply:

- It never trades, holds or moves money. No "transfer", "buy", "rebalance", "execute" affordances. No balances presented as live custody.
- It does not give investment, tax or legal advice. It is not a registered investment adviser, law firm or accounting firm. The professional decides.
- It never sends anything to a professional without the household's approval.
- It does not own the record. The household does, and can export it.

## 2. Messaging pillars

| Pillar | Line used on the site | Proof on the page |
|---|---|---|
| The whole record | "X1 keeps the whole record, reads the documents…" | Vault, filing suggestions with confirm |
| Sourced answers | "Ask your record. The answer cites the page and the clause." | SourceChip on every fact |
| Ahead of the deadline | "…which professional needs to hear about what, before the deadline instead of after." | Next 90 days, handoffs |
| The household decides | "Nothing is sent without your approval." | Approve and send, hatched drafts |
| Ownership | "Your financial life belongs to you. The work you do to understand it should keep helping you." | Export, assistants, manifesto |
| Less remembering, more deciding | "A family can have the work of a family office long before it has the staff." | The "someone" jobs: intake, deadlines, counsel, review |

## 3. Voice and copy rules

- **Plain and calm.** Short declarative sentences. Concrete nouns (K-1, operating agreement, Article IV) over abstractions (insights, solutions).
- **Sentence case everywhere**: headings, buttons, nav, eyebrows. Never Title Case, never ALL CAPS.
- **No em dashes.** Use a period, a comma, or a colon. Metadata is separated by a middle dot with spaces: `Harbor Works LLC · 2 documents`.
- Headlines end with a period when they are statements ("Start with one question.", "Questions before you start.").
- Curly quotes and apostrophes in JSX (`&rsquo;`, `&ldquo;`).
- No hype: no "revolutionize", "unlock", "supercharge", "seamless", "AI-powered magic", no exclamation marks.
- Say "you" and "your household". Professionals are named by role: "your CPA", "Sam Reyes, CPA".
- Be honest about limits: "Different figures don't always mean an error. The CPA decides."
- Numbers keep their source precision (`50.000%`), dates are short (`Mar 14`, `Sep 15`).
- CTAs: "Start free", "Create a free account", "Become a member", "Approve and send", "Read the manifesto". Never "Get rich", never urgency ("Only today").

## 4. The Avery household (the example story)

Every illustration on the site uses one household, so the story stays consistent. Reuse it; do not invent new families.

| | |
|---|---|
| Member | **Morgan Avery** (greeting: "Evening, Morgan"; avatar initials "MA") |
| Entities | 1 business · 1 trust · 1 property |
| Business | **Harbor Works LLC** (Morgan is a partner) |
| Trust | The family trust; questions reference **Article IV** |
| Professional | **Sam Reyes, CPA** |
| Unconfirmed | Life policy: unconfirmed (hatched) |
| Deadlines | Extended K-1s · Sep 15; Q3 estimate · Sep 15; Trust review · Oct 1 |

**The story (How it works, four steps):**

1. **The K-1 arrives.** Schedule K-1 (Form 1065), 2025, Harbor Works LLC, received Mar 14. X1 reads it, files it under Harbor Works LLC, and asks you to confirm (hatched "Harbor Works LLC · confirm?").
2. **It's read against the agreement.** Item J on the K-1 says 50.000% share of profit. Section 5.2 (Sch. A) of the operating agreement says 40.000% percentage interest. "Different figures don't always mean an error. The CPA decides."
3. **The question goes to your CPA.** Draft to Sam Reyes, CPA, with both documents cited: "Which should the Q3 estimate use?" Hatched until approved. "Nothing is sent until you approve."
4. **The answer is filed.** "The operating agreement governs. The K-1 will be amended." Sam Reyes, CPA · answered by email · Mar 21. "Q3 estimate uses 40%. The reason is kept with both documents."

Example questions for prompts: "know what Article IV of the trust actually says", "check the K-1 against the operating agreement", "prepare questions for my CPA meeting", "Which trust owns the rental LLC?".

## 5. Provenance UI patterns

Provenance and freshness are first class. Every fact on an X1 surface answers "where does this come from?" and "how old is it?".

| Pattern | How |
|---|---|
| Cite a fact | `<SourceChip doc="K-1" locator="Item J" />` next to or under the figure |
| Freshness | `asOf="Mar 14"` on the chip, or a mono date in the row (`font-mono text-data text-muted-foreground`) |
| Two sources disagree | Show both figures, each with its chip; the second figure in `text-muted-foreground`. Label the widget plainly: "Two documents disagree" |
| Suggested, not confirmed | `.hatch` on the element (`hatch bg-raised`), with a question: "confirm?" |
| Pending source | `<SourceChip pending />`, `<Badge variant="pending">` |
| Confirmed | Hatch removed; confirm actions turn `bg-primary text-primary-foreground`; a round primary `Check` |
| Awaiting approval | Draft is hatched; action reads "Approve and send"; helper line "Nothing is sent until you approve." |
| Decision record | `CornerDownRight` icon, the decision in `font-medium`, then "Name, role · channel · date", then the source chips |
| Unknown | Say "Unknown" in muted text with a pending chip. Never fill a gap with a guess |

Never show a figure without a source on a product illustration. Never show precision the source does not have.

## 6. Logo

Assets: `assets/brand/x1-mark.svg` (currentColor), `x1-mark-black.svg`, `x1-mark-white.svg`. In code, always `<X1Mark />` (`src/components/brand/logo.tsx`), which uses the official paths from `logo-paths.ts` and `fill="currentColor"`. The favicon is `src/app/icon.svg`.

- **Color:** `text-foreground` on `bg-background` (either theme). Muted uses are allowed for in-product chrome (`text-subtle` in the How it works panel). No other colors, gradients or effects.
- **Size:** set height, width follows (`h-5 w-auto`). In use: 12px (`h-3`, product chrome), 14px (`h-3.5`, app window bar), 20px (`h-5`, header), 28px (`h-7`, footer). Minimum 12px.
- **Clear space:** at least half the mark's height on every side.
- **Lockup:** `<X1Lockup />` stacks the mark over "Wealth" in the display face. Footer and brand moments only. The header uses the mark alone.
- **Don't:** stretch or squash, rotate, outline or stroke, add shadows or glows, place it in low contrast or a color, place it directly on a busy part of the shader without a surface, or redraw it in a font.
- The accessible name is "X1" (`aria-label`); header links use `aria-label="X1 Wealth home"`.
