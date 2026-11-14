import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover tech meetups, workshops, hackathons, and conferences.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
