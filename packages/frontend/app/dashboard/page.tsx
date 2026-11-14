"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, DollarSign, Users, ArrowUpRight, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { freelanceApi, eventApi } from "@/lib/api-client";
import { formatCurrency, formatDate, formatTime, humanize } from "@/lib/format";
import type { Gig, TechEvent } from "@/lib/types";
import { LoadingState } from "@/components/page-state";

interface DashboardStats {
  openGigs: number;
  upcomingEvents: number;
  registeredEvents: number;
  myGigsOrProposals: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    openGigs: 0,
    upcomingEvents: 0,
    registeredEvents: 0,
    myGigsOrProposals: 0,
  });
  const [events, setEvents] = useState<TechEvent[]>([]);
  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const canPostGigs = user?.type === "client" || user?.type === "startup" || user?.type === "admin";

  // Redirect only once the session check has finished.
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [eventsResponse, projectsResponse, registrationsResponse, mineResponse] =
      await Promise.all([
        eventApi.getAllEvents({ isActive: true }),
        freelanceApi.getProjects(),
        eventApi.getUserEvents(userId),
        canPostGigs
          ? freelanceApi.getGigsByClientId(userId)
          : freelanceApi.getProposalsByFreelancerId(userId),
      ]);

    const nextErrors: string[] = [];
    const now = Date.now();
    let upcoming: TechEvent[] = [];
    if (eventsResponse.success) {
      upcoming = (eventsResponse.events ?? [])
        .filter((event) => new Date(event.startDateTime).getTime() >= now)
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
      setEvents(upcoming.slice(0, 3));
    } else {
      nextErrors.push(`Events: ${eventsResponse.message}`);
    }

    let openGigs = 0;
    if (projectsResponse.success) {
      const gigs = projectsResponse.data ?? [];
      setProjects(gigs.slice(0, 3));
      openGigs = gigs.filter((gig) => gig.status === "open").length;
    } else {
      nextErrors.push(`Projects: ${projectsResponse.message}`);
    }

    setStats({
      openGigs,
      upcomingEvents: upcoming.length,
      registeredEvents: registrationsResponse.success
        ? (registrationsResponse.events ?? []).filter((r) => r.status !== "CANCELLED").length
        : 0,
      myGigsOrProposals: mineResponse.success ? (mineResponse.data ?? []).length : 0,
    });
    setErrors(nextErrors);
    setLoading(false);
  }, [userId, canPostGigs]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isAuthLoading || !isAuthenticated) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        {canPostGigs ? (
          <Button className="gap-2" asChild>
            <Link href="/dashboard/freelancing/create-gig">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Project
            </Link>
          </Button>
        ) : (
          <Button className="gap-2" asChild>
            <Link href="/dashboard/freelancing">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              Find Work
            </Link>
          </Button>
        )}
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p className="font-medium">Some data could not be loaded.</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadData()}>
            Try again
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.openGigs}</div>
            <p className="text-xs text-muted-foreground">Across the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Active events ahead</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.registeredEvents}</div>
            <p className="text-xs text-muted-foreground">Events you signed up for</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {canPostGigs ? "My Projects" : "My Proposals"}
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.myGigsOrProposals}</div>
            <p className="text-xs text-muted-foreground">
              {canPostGigs ? "Projects you posted" : "Proposals you sent"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recent gigs and applications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/freelancing">
                View all
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
            ) : projects.length > 0 ? (
              <div className="space-y-8">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/freelance/projects/${project.id}`}
                    className="flex items-start space-x-4 rounded-md hover:bg-muted/50"
                  >
                    <div>
                      <div className="rounded w-12 h-12 flex items-center justify-center bg-primary/10 text-primary">
                        <Briefcase className="h-6 w-6" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium leading-none">{project.title}</p>
                        <Badge>{humanize(project.status) || "Open"}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <DollarSign className="mr-1 h-3 w-3" aria-hidden="true" />
                        <span>{formatCurrency(project.budget)}</span>
                        <span className="mx-2">•</span>
                        <span>{project.proposalCount ?? 0} proposals</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active projects found</p>
                <Button asChild>
                  <Link href="/dashboard/freelancing">Find Projects</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>The next events on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : events.length > 0 ? (
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/events/${event.id}`} className="font-medium hover:underline">
                        {event.title}
                      </Link>
                      <Badge variant="outline">{humanize(event.eventType)}</Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" aria-hidden="true" />
                      <span>{formatDate(event.startDateTime)}</span>
                      <span className="mx-1">•</span>
                      <span>{formatTime(event.startDateTime)}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" aria-hidden="true" />
                      <span>
                        {event.currentAttendees ?? 0}/{event.maxAttendees || "∞"} registered
                      </span>
                    </div>
                  </div>
                ))}
                <Button size="sm" className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/events">View All Events</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming events</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/events">Find Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
