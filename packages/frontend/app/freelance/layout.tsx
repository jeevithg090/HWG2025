import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Freelance Marketplace",
  description: "Find freelance tech projects or post your own to hire talented professionals.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
