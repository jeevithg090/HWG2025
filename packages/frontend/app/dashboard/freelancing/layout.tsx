import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Freelancing",
  description: "Manage your projects, proposals and freelancer profile.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
