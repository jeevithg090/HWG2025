import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events Hub",
  description: "Discover, join and organize tech events.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
