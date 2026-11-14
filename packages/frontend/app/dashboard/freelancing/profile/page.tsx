"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ErrorState, LoadingState } from "@/components/page-state";
import { useAuth } from "@/lib/auth-context";
import { fetchFreelancerDashboard } from "@/lib/dashboard-helpers";
import { formatDate, getInitials, humanize } from "@/lib/format";
import type { FreelancerDashboard } from "@/lib/types";

const MAX_BIO = 2000;

export default function FreelancerProfilePage() {
  const { user, isLoading: isUserLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [stats, setStats] = useState<FreelancerDashboard | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
    setSkills(user?.skills ?? []);
    setNewSkill("");
  }, [user]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const userId = user?.id;
  const isFreelancer = user?.type === "freelancer";

  useEffect(() => {
    if (!userId || !isFreelancer) return;
    let cancelled = false;
    void fetchFreelancerDashboard(userId).then((result) => {
      if (cancelled) return;
      setStats(result.data);
      setStatsError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, isFreelancer]);

  if (isUserLoading) return <LoadingState />;

  if (!user) {
    return (
      <ErrorState
        title="Sign in required"
        message="Please sign in to view your profile."
        action={
          <Button asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        }
      />
    );
  }

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    const error = await updateProfile({
      name: name.trim(),
      bio: bio.trim() ? bio.trim() : null,
      skills,
    });
    setIsSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Profile updated");
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const completionSteps = [
    { label: "Basic Info", done: !!user.name && !!user.email },
    { label: "About Me", done: !!user.bio },
    { label: "Skills", done: (user.skills?.length ?? 0) > 0 },
  ];
  const completion = Math.round(
    (completionSteps.filter((step) => step.done).length / completionSteps.length) * 100,
  );
  const reviews = stats?.recentReviews ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your freelancer profile and showcase your skills
          </p>
        </div>
        <Button
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <div className="space-y-2 text-left">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">{humanize(user.type)}</p>
                  </div>
                )}

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{user.email}</p>
                  {user.createdAt && <p>Member since {formatDate(user.createdAt)}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" aria-label="Profile completion" />
              </div>
              <ul className="space-y-2 text-sm">
                {completionSteps.map((step) => (
                  <li key={step.label} className="flex items-center justify-between">
                    <span>{step.label}</span>
                    <span className={step.done ? "text-green-600" : "text-orange-600"}>
                      {step.done ? "Complete" : "Missing"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {isFreelancer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {statsError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {statsError}
                  </p>
                ) : !stats ? (
                  <LoadingState label="Loading stats..." />
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.totalProposals}</div>
                      <div className="text-xs text-muted-foreground">Proposals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.acceptedProposals}
                      </div>
                      <div className="text-xs text-muted-foreground">Accepted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.pendingProposals}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.averageRating !== null ? stats.averageRating.toFixed(1) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg. Rating</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <>
                      <Label htmlFor="profile-bio" className="sr-only">
                        About me
                      </Label>
                      <Textarea
                        id="profile-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell clients about your experience and expertise..."
                        rows={6}
                        maxLength={MAX_BIO}
                      />
                    </>
                  ) : (
                    <p className="whitespace-pre-line text-muted-foreground">
                      {user.bio || "You haven't written a bio yet."}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Showcase your technical expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        aria-label="New skill"
                        value={newSkill}
                        maxLength={50}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button onClick={addSkill} size="icon" aria-label="Add skill">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? skills : (user.skills ?? [])).map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {!isEditing && !user.skills?.length && (
                      <p className="text-sm text-muted-foreground">No skills added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Client Reviews</h3>
                {stats?.averageRating != null && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="font-medium">{stats.averageRating.toFixed(1)} average</span>
                  </div>
                )}
              </div>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No reviews yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div
                            className="flex items-center gap-1"
                            aria-label={`${review.rating} out of 5 stars`}
                          >
                            {Array.from({ length: review.rating }, (_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm">{review.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 border-t pt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
