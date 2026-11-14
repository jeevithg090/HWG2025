"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, DollarSign, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ErrorState, LoadingState } from "@/components/page-state";
import { freelanceApi } from "@/lib/api-client";
import { useUser } from "@/lib/user-context";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Gig } from "@/lib/types";

const MIN_COVER_LETTER = 20;
const MAX_COVER_LETTER = 5000;

export default function ApplyToGigPage() {
  const params = useParams<{ id: string }>();
  const gigId = params.id;
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoadingGig, setIsLoadingGig] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [proposal, setProposal] = useState({
    coverLetter: "",
    bidAmount: "",
    estimatedTimeInDays: "",
  });

  const loadGig = useCallback(async () => {
    setIsLoadingGig(true);
    setLoadError(null);
    const response = await freelanceApi.getGigById(gigId);
    if (response.success) {
      setGig(response.data);
    } else if (response.status === 404) {
      setGig(null);
    } else {
      setLoadError(response.message || "Failed to load project details");
    }
    setIsLoadingGig(false);
  }, [gigId]);

  useEffect(() => {
    void loadGig();
  }, [loadGig]);

  const handleInputChange = (field: keyof typeof proposal, value: string) => {
    setProposal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit a proposal.");
      router.push("/auth/signin");
      return;
    }

    const coverLetter = proposal.coverLetter.trim();
    if (coverLetter.length < MIN_COVER_LETTER) {
      toast.error(`Cover letter must be at least ${MIN_COVER_LETTER} characters.`);
      return;
    }
    const bidAmount = Number(proposal.bidAmount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      toast.error("Please enter a bid amount greater than zero.");
      return;
    }
    const days = proposal.estimatedTimeInDays ? Number(proposal.estimatedTimeInDays) : undefined;
    if (days !== undefined && (!Number.isInteger(days) || days <= 0)) {
      toast.error("Estimated time must be a whole number of days.");
      return;
    }

    setIsSubmitting(true);
    const response = await freelanceApi.createProposal({
      gigId,
      coverLetter,
      bidAmount,
      estimatedTimeInDays: days,
    });
    setIsSubmitting(false);

    if (response.success) {
      toast.success("Proposal submitted successfully!");
      router.push("/dashboard/freelancing");
      return;
    }
    if (response.status === 409) {
      toast.error("You have already applied to this project.");
    } else if (response.status === 401) {
      toast.error("Your session has expired. Please sign in again.");
      router.push("/auth/signin");
    } else {
      toast.error(response.message || "Failed to submit proposal");
    }
  };

  const isOwnGig = !!user && !!gig && gig.clientId === user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/freelancing" aria-label="Back to freelancing">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Submit Proposal</h1>
          <p className="text-muted-foreground">Apply for this gig with your best proposal</p>
        </div>
      </div>

      {isLoadingGig || isUserLoading ? (
        <LoadingState label="Loading project details..." />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadGig()} />
      ) : !gig ? (
        <Card>
          <CardContent className="py-10">
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-semibold">Project Not Found</h3>
              <p className="text-muted-foreground">
                The project you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/dashboard/freelancing">Back to Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {gig.status !== "open" || isOwnGig ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  {isOwnGig
                    ? "You can't submit a proposal to your own project."
                    : "This project is no longer accepting proposals."}
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Proposal</CardTitle>
                    <CardDescription>
                      Write a compelling proposal to win this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Introduce yourself and explain why you're the perfect fit for this project..."
                        value={proposal.coverLetter}
                        onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                        rows={8}
                        minLength={MIN_COVER_LETTER}
                        maxLength={MAX_COVER_LETTER}
                        required
                        aria-describedby="coverLetter-count"
                      />
                      <p id="coverLetter-count" className="text-xs text-muted-foreground">
                        {proposal.coverLetter.length}/{MAX_COVER_LETTER} characters (minimum{" "}
                        {MIN_COVER_LETTER})
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="bidAmount">Your Bid (USD) *</Label>
                        <div className="relative">
                          <DollarSign
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="bidAmount"
                            type="number"
                            min="1"
                            step="any"
                            placeholder="3200"
                            value={proposal.bidAmount}
                            onChange={(e) => handleInputChange("bidAmount", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedTimeInDays">Estimated Time (days)</Label>
                        <Input
                          id="estimatedTimeInDays"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="30"
                          value={proposal.estimatedTimeInDays}
                          onChange={(e) => handleInputChange("estimatedTimeInDays", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard/freelancing">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{gig.title}</CardTitle>
                <CardDescription>Posted {formatDate(gig.createdAt, "recently")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line text-sm">{gig.description}</p>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">{formatCurrency(gig.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{gig.deadline ? `Due ${formatDate(gig.deadline)}` : "No deadline"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{gig.proposalCount ?? 0} proposals submitted</span>
                  </div>
                </div>

                {gig.requiredSkills && gig.requiredSkills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {gig.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposal Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["bg-green-500", "Personalize your proposal to the specific project"],
                  ["bg-blue-500", "Highlight relevant experience and skills"],
                  ["bg-purple-500", "Ask thoughtful questions about the project"],
                  ["bg-orange-500", "Include portfolio samples if relevant"],
                ].map(([color, tip]) => (
                  <div key={tip} className="flex items-start gap-2">
                    <div className={`mt-2 h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
                    <p>{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
