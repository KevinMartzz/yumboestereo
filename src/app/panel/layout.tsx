import type { Metadata } from "next";
import { MarcoPanel } from "@/components/panel/MarcoPanel";

export const metadata: Metadata = { title: "Panel" };

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return <MarcoPanel>{children}</MarcoPanel>;
}
