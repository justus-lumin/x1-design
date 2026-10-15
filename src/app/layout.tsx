import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "X1 Wealth: A family office built around you", template: "%s | X1 Wealth" },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: "website" },
};

// Runs before paint: JS flag for motion, and the saved theme (dark by default).
const boot = `(function(){var d=document.documentElement;d.classList.add('js');var t='dark';try{t=localStorage.getItem('x1-theme')||'dark'}catch(e){}if(t==='dark')d.classList.add('dark')})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <SiteHeader />
        <main className="pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
