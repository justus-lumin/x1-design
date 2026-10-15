// Navigation and footer structure. Paths match the scraped SEO pages in content/pages.json.
export const nav = [
  { label: "Product", href: "/features" },
  { label: "For professionals", href: "/professionals" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
] as const;

export const footer = [
  {
    title: "Product",
    links: [
      { label: "Vault", href: "/features/vault" },
      { label: "Ask X1", href: "/features/ask-x1" },
      { label: "Estate planning", href: "/features/estate-planning" },
      { label: "Tax optimization", href: "/features/tax-optimization" },
      { label: "Integrations", href: "/integrations" },
      { label: "Connect an assistant", href: "/connect" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Family office",
    links: [
      { label: "AI-native family office", href: "/ai-native-family-office" },
      { label: "Family office software", href: "/family-office-software" },
      { label: "For professionals", href: "/professionals" },
      { label: "Virtual family office guide", href: "/resources/virtual-family-office-guide" },
      { label: "Compare platforms", href: "/compare" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Resources", href: "/resources" },
      { label: "Statistics", href: "/statistics" },
      { label: "Free tools", href: "/tools" },
      { label: "Research standards", href: "/resources/research-standards" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Manifesto", href: "/manifesto" },
      { label: "Company", href: "/company" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/contact" },
      { label: "Design system", href: "/design-system" },
    ],
  },
] as const;

export const SITE = {
  name: "X1 Wealth",
  url: "https://x1wealth.com",
  email: "hello@x1wealth.com",
  description:
    "A family office built around you. X1 keeps the whole record, reads the documents, and tells you which professional needs to hear about what, before the deadline instead of after.",
};
