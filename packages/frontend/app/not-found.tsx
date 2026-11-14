import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
          404
        </p>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Page not found</h1>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/events">Browse events</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
