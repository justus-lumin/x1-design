import type { Metadata } from "next";
import { NotFoundStage } from "@/components/slices/hub-not-found";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundStage />;
}
