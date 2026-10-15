# X1 Wealth: website and design system preview

Captured from the local dev build on 2026-10-15. Dark theme unless the filename says `light`.

- `contact-sheet.jpg`: all nine boards on one sheet (3792x2217).
- `homepage-scroll.mp4`: 14 s scroll through the homepage at 1440x900, hero to pricing (H.264, 30 fps).

## boards/ (3840x2160, 16:9)

| File | What it shows |
| --- | --- |
| `01-cover.png` | Cover: X1 mark and "A family office built around you." over a grain shader frame |
| `02-system.png` | Twelve page heroes in a grid: home, product, audience, trust, integration, editorial, design system |
| `03-landing.png` | Landing pages: Vault, For professionals, Connect / Claude |
| `04-mobile.png` | Six phone frames: home, capabilities, Vault, pricing, compare article, statistics |
| `05-light-dark.png` | Homepage hero split down the middle, dark and light |
| `06-design-system.png` | Ink scale, semantic tokens in both themes, type roles and scale, buttons, badges, input, table, shader |
| `07-articles-and-data.png` | Addepar alternatives table, wealth transfer statistics, K-1 guide |
| `08-motion.png` | Hero headline entrance at 0.4 to 3.2 s, plus three moments of the grain shader |
| `09-homepage.png` | Full homepage column with How it works steps 2 and 3, capabilities and pricing |

## hero/ (1440x900 at 2x = 2880x1800, first viewport)

Dark: `home`, `vault`, `professionals`, `pricing`, `security`, `company`, `connect-claude`, `plaid`, `ai-native-family-office`, `design-system`, `resources`, `compare`, `integrations`, `statistics`, `tools`, `k1-article` (/resources/how-to-read-a-k1), `addepar-alternatives` (/compare/addepar-alternatives), `wealth-transfer` (/statistics/wealth-transfer).

Light: `home`, `vault`, `pricing`, `addepar-alternatives`, `design-system`.

## mobile/ (390x844 at 2x = 780x1688)

Each page has `-1-top` (first viewport) and `-2-mid` (a mid-page section): `home`, `vault`, `pricing`, `professionals`, `security`, `connect-claude`, `design-system`, `resources`, `addepar-alternatives`, `wealth-transfer`.

## full/ (full-page, 1440 wide at 1x, JPEG)

- `home.jpg`: homepage. The pinned How it works section is shown unpinned at step 1 so the page reads top to bottom.
- `vault.jpg`: /features/vault landing page.
- `professionals.jpg`: /professionals landing page.
- `addepar-alternatives.jpg`: /compare/addepar-alternatives article.
- `resources.jpg`: /resources hub.
- `design-system.jpg`: /design-system reference page.
