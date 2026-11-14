"use client";

import type React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, DollarSign, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/lib/user-context";
import { freelanceApi } from "@/lib/api-client";
import type { CreateGigPayload } from "@/lib/types";
import {
  DURATION_LABELS,
  EXPERIENCE_LABELS,
  buildGigDescription,
  type GigFormData,
} from "@/lib/gig-form";
import { LoadingState } from "@/components/page-state";

export default function CreateGigPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, isStartup, canPostGigs } = useUser();

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<GigFormData>({
    title: "",
    description: "",
    category: "",
    budget: "",
    budgetType: "fixed",
    duration: "",
    deadline: "",
    experienceLevel: "",
    projectLocation: "",
    isRemote: true,
    requirements: "",
    deliverables: "",
  });

  // Only clients, startups and admins may post gigs. Redirect in an effect:
  // navigating during render breaks prerendering ("location is not defined").
  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.replace("/auth/signin");
    } else if (!canPostGigs) {
      toast.error("Only clients and startups can post projects.");
      router.replace("/dashboard/freelancing");
    }
  }, [isUserLoading, user, canPostGigs, router]);

  if (isUserLoading || !user || !canPostGigs) {
    return <LoadingState />;
  }

  const handleInputChange = <K extends keyof GigFormData>(field: K, value: GigFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = formData.title.trim();
    const budget = Number(formData.budget);
    if (title.length < 5 || title.length > 100) {
      toast.error("Title must be between 5 and 100 characters.");
      return;
    }
    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters.");
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      toast.error("Please enter a budget greater than zero.");
      return;
    }

    const payload: CreateGigPayload = {
      title,
      description: buildGigDescription(formData),
      budget,
      requiredSkills: skills,
    };
    if (formData.deadline) {
      payload.deadline = new Date(`${formData.deadline}T23:59:59`).toISOString();
    }

    setIsLoading(true);
    const response = await freelanceApi.createProject(payload);
    setIsLoading(false);

    if (response.success) {
      toast.success("Project created successfully!");
      router.push("/dashboard/freelancing");
    } else if (response.status === 401) {
      toast.error("Your session has expired. Please sign in again.");
      router.push("/auth/signin");
    } else {
      toast.error(response.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/freelancing" aria-label="Back to freelancing">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isStartup ? "Post Startup Project" : "Create New Project"}
          </h1>
          <p className="text-muted-foreground">
            {isStartup
              ? "Find talented developers for your startup"
              : "Post a project and find the perfect freelancer"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Provide basic information about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a React Native E-commerce App"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                      <SelectItem value="data-science">Data Science & Analytics</SelectItem>
                      <SelectItem value="devops">DevOps & Cloud</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                      <SelectItem value="qa-testing">QA & Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail. Include goals, features, and any specific requirements..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-skill">Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-skill"
                      placeholder="Add a skill (e.g., React, Node.js)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill} size="icon" aria-label="Add skill">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>Set your project budget and expected timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-type">Budget Type</Label>
                    <Select
                      value={formData.budgetType}
                      onValueChange={(value) =>
                        handleInputChange("budgetType", value as GigFormData["budgetType"])
                      }
                    >
                      <SelectTrigger id="budget-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">
                      Budget ({formData.budgetType === "hourly" ? "per hour" : "total"}) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        min="1"
                        step="any"
                        placeholder={formData.budgetType === "hourly" ? "50" : "5000"}
                        value={formData.budget}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => handleInputChange("duration", value)}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">Less than 1 week</SelectItem>
                        <SelectItem value="1-month">1-4 weeks</SelectItem>
                        <SelectItem value="1-3-months">1-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="6-months-plus">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleInputChange("experienceLevel", value)}
                    >
                      <SelectTrigger id="experienceLevel">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Specify location preferences and project requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.isRemote}
                    onCheckedChange={(checked) => handleInputChange("isRemote", checked === true)}
                  />
                  <Label htmlFor="remote">This is a remote project</Label>
                </div>

                {!formData.isRemote && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, CA"
                        value={formData.projectLocation}
                        onChange={(e) => handleInputChange("projectLocation", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any specific requirements, tools, or preferences..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliverables">Expected Deliverables</Label>
                  <Textarea
                    id="deliverables"
                    placeholder="What should be delivered at the end of the project..."
                    value={formData.deliverables}
                    onChange={(e) => handleInputChange("deliverables", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>How your gig will appear to freelancers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{formData.title || "Project Title"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description
                      ? formData.description.substring(0, 100) + "..."
                      : "Project description will appear here..."}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formData.budget ? `$${formData.budget}` : "$0"}{" "}
                      {formData.budgetType === "hourly" ? "/hour" : "fixed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{DURATION_LABELS[formData.duration] ?? "Duration not set"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formData.isRemote
                        ? "Remote"
                        : formData.projectLocation || "Location not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {EXPERIENCE_LABELS[formData.experienceLevel] ?? "Experience level not set"}
                    </span>
                  </div>
                </div>

                {skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill) => (
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
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Write a clear, detailed description</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Set a realistic budget and timeline</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <p>Include specific skill requirements</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Respond quickly to proposals</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/freelancing">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Publishing..." : "Publish Gig"}
          </Button>
        </div>
      </form>
    </div>
  );
}
