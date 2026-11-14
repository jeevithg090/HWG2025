import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Community",
  description: "Chat with groups and members of the TechCollab community.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
