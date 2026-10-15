import type { Chunk, Page } from "@/lib/content";

/**
 * Every content slice receives the chunk it renders, its position, and the page for context.
 * layout "full": a standalone landing-page slice (owns its <section>, Container and vertical rhythm).
 * layout "article": rendered inside the article body column (no Container, no section padding, fits ~42rem).
 */
export type SliceProps = { chunk: Chunk; index: number; page: Page; layout?: "full" | "article" };
