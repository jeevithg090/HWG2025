"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  DollarSign,
  SendHorizontal,
  Star,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { ErrorState, LoadingState } from "@/components/page-state";
import { useAuth } from "@/lib/auth-context";
import { freelanceApi } from "@/lib/api-client";
import { formatCurrency, formatDate, humanize } from "@/lib/format";
import type { Gig, Proposal, ProposalStatus } from "@/lib/types";

function statusVariant(status: string) {
  switch (status) {
    case "open":
    case "accepted":
      return "default" as const;
    case "cancelled":
    case "rejected":
      return "destructive" as const;
    case "in_progress":
    case "pending":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
    </span>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const gigId = params.id;
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();

  const [project, setProject] = useState<Gig | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const userId = user?.id;

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    const response = await freelanceApi.getGigById(gigId);
    if (!response.success) {
      if (response.status === 404) setNotFound(true);
      else setError(response.message || "Failed to load project details");
      setLoading(false);
      return;
    }
    const gig = response.data;
    setProject(gig);

    if (userId && gig.clientId === userId) {
      const proposalsResponse = await freelanceApi.getProposalsByGigId(gig.id);
      setProposals(proposalsResponse.success ? (proposalsResponse.data ?? []) : []);
      if (!proposalsResponse.success) {
        toast.error(proposalsResponse.message || "Failed to load proposals");
      }
    } else if (userId) {
      const mine = await freelanceApi.getProposalsByFreelancerId(userId);
      setMyProposal(
        mine.success ? ((mine.data ?? []).find((p) => p.gigId === gig.id) ?? null) : null,
      );
    }
    setLoading(false);
  }, [gigId, userId]);

  useEffect(() => {
    if (!isAuthLoading) void loadProject();
  }, [isAuthLoading, loadProject]);

  const isProjectOwner = !!user && project?.clientId === user.id;
  const acceptedProposal = useMemo(
    () => proposals.find((proposal) => proposal.status === "accepted") ?? null,
    [proposals],
  );
  const alreadyReviewed = !!user && !!project?.reviews?.some((r) => r.reviewerId === user.id);

  const updateProposalStatus = async (proposal: Proposal, status: ProposalStatus) => {
    setBusyId(proposal.id);
    const response = await freelanceApi.updateProposal(proposal.id, { status });
    setBusyId(null);
    if (!response.success) {
      toast.error(response.message || "Failed to update proposal");
      return;
    }
    toast.success(`Proposal ${status}`);
    void loadProject();
  };

  const updateGigStatus = async (status: Gig["status"]) => {
    if (!project) return;
    setBusyId(project.id);
    const response = await freelanceApi.updateGig(project.id, { status });
    setBusyId(null);
    if (!response.success) {
      toast.error(response.message || "Failed to update project");
      return;
    }
    setProject((prev) => (prev ? { ...prev, ...response.data, reviews: prev.reviews } : prev));
    toast.success(`Project marked as ${humanize(status).toLowerCase()}`);
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !acceptedProposal) return;
    setSubmittingReview(true);
    const response = await freelanceApi.createReview({
      gigId: project.id,
      revieweeId: acceptedProposal.freelancerId,
      rating,
      comment: comment.trim() || undefined,
    });
    setSubmittingReview(false);
    if (!response.success) {
      toast.error(response.message || "Failed to submit review");
      return;
    }
    toast.success("Review submitted");
    setComment("");
    void loadProject();
  };

  const shell = (content: ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">{content}</main>
    </div>
  );

  if (loading || isAuthLoading) {
    return shell(<LoadingState label="Loading project details..." />);
  }

  if (error) {
    return shell(<ErrorState message={error} onRetry={() => void loadProject()} />);
  }

  if (notFound || !project) {
    return shell(
      <div className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Project not found</h1>
        <Button asChild>
          <Link href="/freelance">
            <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Projects
          </Link>
        </Button>
      </div>,
    );
  }

  return shell(
    <>
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/freelance">
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Projects
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={statusVariant(project.status)}>{humanize(project.status)}</Badge>
            </div>
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">{project.title}</h1>
            <p className="text-muted-foreground">Posted on {formatDate(project.createdAt)}</p>
          </div>

          <section>
            <h2 className="mb-2 text-xl font-semibold">Project Description</h2>
            <p className="whitespace-pre-line text-muted-foreground">{project.description}</p>
          </section>

          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {isProjectOwner && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Proposals ({proposals.length})</h2>
              {proposals.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    No proposals yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">
                            Bid {formatCurrency(proposal.bidAmount, "—")}
                            {proposal.estimatedTimeInDays
                              ? ` • ${proposal.estimatedTimeInDays} days`
                              : ""}
                          </CardTitle>
                          <Badge variant={statusVariant(proposal.status)}>
                            {humanize(proposal.status)}
                          </Badge>
                        </div>
                        <CardDescription>
                          Submitted {formatDate(proposal.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="whitespace-pre-line text-sm">{proposal.coverLetter}</p>
                        {proposal.status === "pending" && project.status === "open" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={busyId === proposal.id}
                              onClick={() => void updateProposalStatus(proposal, "accepted")}
                            >
                              <Check className="mr-1 h-4 w-4" aria-hidden="true" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === proposal.id}
                              onClick={() => void updateProposalStatus(proposal, "rejected")}
                            >
                              <X className="mr-1 h-4 w-4" aria-hidden="true" /> Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
            {project.reviews && project.reviews.length > 0 ? (
              <div className="space-y-3">
                {project.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="space-y-2 pt-6">
                      <div className="flex items-center justify-between">
                        <Stars rating={review.rating} />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && <p className="text-sm">{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}

            {isProjectOwner &&
              project.status === "completed" &&
              acceptedProposal &&
              !alreadyReviewed && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-4 space-y-3 rounded-lg border p-4"
                >
                  <h3 className="font-medium">Review the freelancer</h3>
                  <fieldset>
                    <legend className="mb-1 text-sm">Rating</legend>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          aria-pressed={rating === value}
                          onClick={() => setRating(value)}
                        >
                          <Star
                            aria-hidden="true"
                            className={`h-5 w-5 ${value <= rating ? "fill-yellow-400 text-yellow-400" : ""}`}
                          />
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="space-y-1">
                    <Label htmlFor="review-comment">Comment</Label>
                    <Textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? "Submitting..." : "Submit review"}
                  </Button>
                </form>
              )}
          </section>
        </div>

        <aside>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Project Details</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <DollarSign
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(project.budget, "Negotiable")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(project.deadline, "Flexible")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">Proposals</p>
                  <p className="text-sm text-muted-foreground">
                    {project.proposalCount ?? proposals.length} received
                  </p>
                </div>
              </div>
              {project.attachmentUrl && (
                <div className="flex gap-3">
                  <Tag className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                  <a
                    href={project.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View attachment
                  </a>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {isProjectOwner ? (
              <div className="space-y-2">
                {project.status === "in_progress" && (
                  <Button
                    className="w-full"
                    disabled={busyId === project.id}
                    onClick={() => void updateGigStatus("completed")}
                  >
                    Mark as completed
                  </Button>
                )}
                {project.status === "open" && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={busyId === project.id}
                    onClick={() => void updateGigStatus("cancelled")}
                  >
                    Close project
                  </Button>
                )}
                {project.status === "cancelled" && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={busyId === project.id}
                    onClick={() => void updateGigStatus("open")}
                  >
                    Reopen project
                  </Button>
                )}
              </div>
            ) : myProposal ? (
              <div className="space-y-2 text-center">
                <Badge variant={statusVariant(myProposal.status)}>
                  Your proposal: {humanize(myProposal.status)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  Submitted {formatDate(myProposal.createdAt)}
                </p>
                {myProposal.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={busyId === myProposal.id}
                    onClick={() => void updateProposalStatus(myProposal, "withdrawn")}
                  >
                    Withdraw proposal
                  </Button>
                )}
              </div>
            ) : project.status === "open" ? (
              isAuthenticated ? (
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/freelancing/gig/${project.id}/apply`}>
                    <SendHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                    Submit a Proposal
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/auth/signin">Sign in to submit a proposal</Link>
                </Button>
              )
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                This project is not accepting proposals.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>,
  );
}
