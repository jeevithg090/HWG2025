"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Clock,
  DollarSign,
  Star,
  Users,
  Briefcase,
  Calendar,
  MessageCircle,
  Edit,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/lib/user-context";
import { freelanceApi } from "@/lib/api-client";
import {
  computeProposalStats,
  countGigsByStatus,
  fetchClientProjects,
  fetchProjects,
  fetchProposalsByFreelancerId,
  filterGigs,
  totalBudget,
} from "@/lib/dashboard-helpers";
import type { BudgetRange } from "@/lib/dashboard-helpers";
import { formatCurrency, formatDate, humanize, truncate } from "@/lib/format";
import type { Gig, Proposal } from "@/lib/types";
import { ErrorState, LoadingState } from "@/components/page-state";

function gigStatusVariant(status: Gig["status"]) {
  if (status === "open") return "default" as const;
  if (status === "cancelled") return "destructive" as const;
  return "secondary" as const;
}

function proposalStatusVariant(status: Proposal["status"]) {
  if (status === "accepted") return "default" as const;
  if (status === "pending") return "secondary" as const;
  return "destructive" as const;
}

function SkillBadges({ skills }: { skills?: string[] | null }) {
  if (!skills?.length) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={skill} variant="secondary">
          {skill}
        </Badge>
      ))}
    </div>
  );
}

export default function FreelancingPage() {
  const { user, isLoading: isUserLoading, canPostGigs, isStartup } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange>("all");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingGigId, setUpdatingGigId] = useState<string | null>(null);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    if (canPostGigs) {
      const result = await fetchClientProjects(userId);
      setMyGigs(result.data);
      setError(result.error);
    } else {
      const [gigsResult, proposalsResult] = await Promise.all([
        fetchProjects(),
        fetchProposalsByFreelancerId(userId),
      ]);
      setGigs(gigsResult.data);
      setProposals(proposalsResult.data);
      setError(gigsResult.error ?? proposalsResult.error);
    }
    setIsLoading(false);
  }, [userId, canPostGigs]);

  useEffect(() => {
    if (!isUserLoading) void loadData();
  }, [isUserLoading, loadData]);

  const filteredGigs = useMemo(
    () => filterGigs(gigs, searchTerm, selectedBudget).filter((gig) => gig.clientId !== userId),
    [gigs, searchTerm, selectedBudget, userId],
  );
  const proposalStats = useMemo(() => computeProposalStats(proposals), [proposals]);
  const gigCounts = useMemo(() => countGigsByStatus(myGigs), [myGigs]);
  const activeContracts = useMemo(
    () => myGigs.filter((gig) => gig.status === "in_progress"),
    [myGigs],
  );
  const gigTitles = useMemo(() => new Map(gigs.map((gig) => [gig.id, gig.title])), [gigs]);

  const toggleGigStatus = async (gig: Gig) => {
    const nextStatus = gig.status === "open" ? "cancelled" : "open";
    setUpdatingGigId(gig.id);
    const result = await freelanceApi.updateGig(gig.id, { status: nextStatus });
    setUpdatingGigId(null);
    if (!result.success) {
      toast.error(result.message || "Failed to update project");
      return;
    }
    setMyGigs((prev) =>
      prev.map((item) => (item.id === gig.id ? { ...item, ...result.data } : item)),
    );
    toast.success(nextStatus === "open" ? "Project reopened" : "Project closed");
  };

  if (isUserLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <ErrorState
        title="Sign in required"
        message="Please sign in to manage projects and proposals."
        action={
          <Button asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        }
      />
    );
  }

  // Client/Startup View
  if (canPostGigs) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Management</h1>
            <p className="text-muted-foreground">
              {isStartup
                ? "Manage your startup's projects and find talent"
                : "Post projects and manage your freelance team"}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/freelancing/create-gig">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Post New Project
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="active-contracts">Active Contracts</TabsTrigger>
            <TabsTrigger value="proposals">Proposals Received</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="space-y-6">
            {isLoading ? (
              <LoadingState label="Loading your projects..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => void loadData()} />
            ) : myGigs.length > 0 ? (
              <div className="grid gap-6">
                {myGigs.map((gig) => (
                  <Card key={gig.id} className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl">{gig.title}</CardTitle>
                            <Badge variant={gigStatusVariant(gig.status)}>
                              {humanize(gig.status)}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {truncate(gig.description, 240)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild aria-label="Edit">
                            <Link
                              href={`/freelance/projects/${gig.id}`}
                              aria-label={`Open ${gig.title}`}
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                          {(gig.status === "open" || gig.status === "cancelled") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={updatingGigId === gig.id}
                              onClick={() => void toggleGigStatus(gig)}
                              aria-label={
                                gig.status === "open" ? `Close ${gig.title}` : `Reopen ${gig.title}`
                              }
                            >
                              {gig.status === "open" ? (
                                <Pause className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Play className="h-4 w-4" aria-hidden="true" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <DollarSign
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="font-medium">{formatCurrency(gig.budget)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span>
                            {gig.deadline ? `Due ${formatDate(gig.deadline)}` : "No deadline"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span>{gig.proposalCount ?? 0} proposals</span>
                        </div>
                      </div>

                      <SkillBadges skills={gig.requiredSkills} />

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-muted-foreground">
                          Posted on {formatDate(gig.createdAt)}
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/freelance/projects/${gig.id}`}>
                            View Proposals ({gig.proposalCount ?? 0})
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="space-y-4 text-center">
                    <Briefcase
                      className="mx-auto h-12 w-12 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg font-semibold">No Projects Yet</h3>
                    <p className="text-muted-foreground">
                      Post your first project to find talented freelancers
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/freelancing/create-gig">Post Your First Project</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active-contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Contracts</CardTitle>
                <CardDescription>Projects currently in progress</CardDescription>
              </CardHeader>
              <CardContent>
                {activeContracts.length > 0 ? (
                  <ul className="divide-y">
                    {activeContracts.map((gig) => (
                      <li key={gig.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="font-medium">{gig.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(gig.budget)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/freelance/projects/${gig.id}`}>View</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center">
                    <Briefcase
                      className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <h3 className="mb-2 text-lg font-semibold">No Active Contracts</h3>
                    <p className="mb-4 text-muted-foreground">
                      Once you accept a proposal, the project will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposals Received</CardTitle>
                <CardDescription>Review and manage freelancer proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {myGigs.some((gig) => (gig.proposalCount ?? 0) > 0) ? (
                  <ul className="divide-y">
                    {myGigs
                      .filter((gig) => (gig.proposalCount ?? 0) > 0)
                      .map((gig) => (
                        <li key={gig.id} className="flex items-center justify-between gap-4 py-3">
                          <div>
                            <p className="font-medium">{gig.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {gig.proposalCount} proposal{gig.proposalCount === 1 ? "" : "s"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/freelance/projects/${gig.id}`}>Review</Link>
                          </Button>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center">
                    <MessageCircle
                      className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <h3 className="mb-2 text-lg font-semibold">No Proposals Yet</h3>
                    <p className="text-muted-foreground">
                      Proposals from freelancers will appear here once you post projects
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{myGigs.length}</div>
                  <p className="text-sm text-muted-foreground">{gigCounts.open} open</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(totalBudget(myGigs), "$0")}
                  </div>
                  <p className="text-sm text-muted-foreground">Across all projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{gigCounts.completed}</div>
                  <p className="text-sm text-muted-foreground">
                    {gigCounts.in_progress} in progress
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Freelancer View
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Work</h1>
          <p className="text-muted-foreground">
            Discover projects that match your skills and interests
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/freelancing/profile">
            <Users className="h-4 w-4" aria-hidden="true" />
            My Profile
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="browse-gigs" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="browse-gigs">Browse Projects</TabsTrigger>
          <TabsTrigger value="my-proposals">My Proposals</TabsTrigger>
          <TabsTrigger value="my-stats">My Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="browse-gigs" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      placeholder="Search projects by title, skills, or keywords..."
                      aria-label="Search projects"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedBudget}
                  onValueChange={(value) => setSelectedBudget(value as BudgetRange)}
                >
                  <SelectTrigger className="w-full md:w-48" aria-label="Budget range">
                    <SelectValue placeholder="Budget Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    <SelectItem value="under-1k">Under $1,000</SelectItem>
                    <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="over-10k">Over $10,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <LoadingState label="Loading projects..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void loadData()} />
          ) : filteredGigs.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {gigs.length === 0
                  ? "No projects have been posted yet."
                  : "No projects match your filters."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredGigs.map((gig) => (
                <Card key={gig.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{gig.title}</CardTitle>
                        <CardDescription className="text-base">
                          {truncate(gig.description, 240)}
                        </CardDescription>
                      </div>
                      <Badge variant={gigStatusVariant(gig.status)}>{humanize(gig.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">{formatCurrency(gig.budget)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>
                          {gig.deadline ? `Due ${formatDate(gig.deadline)}` : "No deadline"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{gig.proposalCount ?? 0} proposals</span>
                      </div>
                    </div>

                    <SkillBadges skills={gig.requiredSkills} />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-muted-foreground">
                        Posted {formatDate(gig.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/freelance/projects/${gig.id}`}>Details</Link>
                        </Button>
                        {gig.status === "open" && (
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/freelancing/gig/${gig.id}/apply`}>
                              Submit Proposal
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-proposals" className="space-y-6">
          {isLoading ? (
            <LoadingState label="Loading your proposals..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void loadData()} />
          ) : proposals.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                You haven&apos;t submitted any proposals yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {proposal.gig?.title ?? gigTitles.get(proposal.gigId) ?? "Project"}
                        </CardTitle>
                      </div>
                      <Badge variant={proposalStatusVariant(proposal.status)}>
                        {humanize(proposal.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{formatCurrency(proposal.bidAmount, "—")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>
                          {proposal.estimatedTimeInDays
                            ? `${proposal.estimatedTimeInDays} days`
                            : "Timeline not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>Submitted {formatDate(proposal.createdAt)}</span>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {truncate(proposal.coverLetter, 150)}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/freelance/projects/${proposal.gigId}`}>View Project</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-stats" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposals Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{proposalStats.total}</div>
                <p className="text-sm text-muted-foreground">{proposalStats.pending} pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{proposalStats.successRate}%</div>
                <p className="text-sm text-muted-foreground">Of decided proposals accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accepted Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(proposalStats.acceptedValue, "$0")}
                </div>
                <p className="text-sm text-muted-foreground">Sum of accepted bids</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Complete your profile to get more opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileCompletion hasBio={!!user.bio} hasSkills={user.skills.length > 0} />
              <Button asChild className="w-full">
                <Link href="/dashboard/freelancing/profile">
                  <Star className="mr-2 h-4 w-4" aria-hidden="true" />
                  Complete Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileCompletion({ hasBio, hasSkills }: { hasBio: boolean; hasSkills: boolean }) {
  const steps = [
    { label: "Basic information completed", done: true },
    { label: "Bio added", done: hasBio },
    { label: "Skills added", done: hasSkills },
  ];
  const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Profile completion</span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} aria-label="Profile completion" />
      </div>
      <ul className="space-y-2 text-sm">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${step.done ? "bg-green-500" : "bg-gray-300"}`}
              aria-hidden="true"
            />
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
