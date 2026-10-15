import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/templates/article";
import { HubTemplate } from "@/components/templates/hub";
import { LandingTemplate } from "@/components/templates/landing";
import { allPaths, getPage } from "@/lib/content";

type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return allPaths()
    .filter((p) => p !== "/")
    .map((p) => ({ slug: p.split("/").filter(Boolean) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: { title: page.title, description: page.description, url: page.path },
  };
}

export default async function SeoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  if (!page) notFound();
  if (page.template === "hub") return <HubTemplate page={page} />;
  if (page.template === "article") return <ArticleTemplate page={page} />;
  return <LandingTemplate page={page} />;
}
