"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";
import { freelanceApi } from "@/lib/api-client";
import { parseList } from "@/lib/format";
import type { CreateGigPayload } from "@/lib/types";
import { toast } from "sonner";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  WEB_DEVELOPMENT: "Web Development",
  MOBILE_APP: "Mobile App Development",
  UI_UX_DESIGN: "UI/UX Design",
  DATA_SCIENCE: "Data Science & Analytics",
  CONTENT_WRITING: "Content Writing",
  BLOCKCHAIN: "Blockchain & Web3",
  AI_ML: "AI & Machine Learning",
  OTHER: "Other",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
};

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  description: z
    .string()
    .trim()
    .min(20, { message: "Description must be at least 20 characters." }),
  projectType: z.string().min(1, { message: "Please select a project type." }),
  budget: z.string().refine((value) => value === "" || Number(value) > 0, {
    message: "Budget must be a positive number.",
  }),
  deadline: z.date().optional(),
  estimatedDuration: z.string(),
  skills: z.string(),
  experienceLevel: z.string().min(1, { message: "Please select the required experience level." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateProjectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const canPostGigs = user?.type === "client" || user?.type === "startup" || user?.type === "admin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectType: "WEB_DEVELOPMENT",
      budget: "",
      estimatedDuration: "",
      skills: "",
      experienceLevel: "INTERMEDIATE",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to create projects");
      router.replace("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (values: FormValues) => {
    const details = [
      `Project type: ${PROJECT_TYPE_LABELS[values.projectType] ?? values.projectType}`,
      `Experience level: ${EXPERIENCE_LABELS[values.experienceLevel] ?? values.experienceLevel}`,
      values.estimatedDuration.trim() && `Estimated duration: ${values.estimatedDuration.trim()}`,
    ].filter(Boolean);

    const payload: CreateGigPayload = {
      title: values.title,
      description: `${values.description}\n\n${details.join("\n")}`,
      budget: values.budget ? Number(values.budget) : undefined,
      requiredSkills: parseList(values.skills),
      deadline: values.deadline?.toISOString(),
    };

    setSubmitting(true);
    const response = await freelanceApi.createProject(payload);
    setSubmitting(false);

    if (response.success) {
      toast.success("Project created successfully!");
      router.push(response.data?.id ? `/freelance/projects/${response.data.id}` : "/freelance");
    } else if (response.status === 403) {
      toast.error("Only client and startup accounts can post projects.");
    } else if (response.status === 401) {
      toast.error("Your session has expired. Please sign in again.");
      router.push("/auth/signin");
    } else {
      toast.error(response.message || "Failed to create project");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/freelance")} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Projects
        </Button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Post a New Project</h1>
          {user && !canPostGigs && (
            <p
              role="alert"
              className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
            >
              Only client and startup accounts can post projects. Browse the marketplace to find
              work instead.
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Web Developer for E-commerce Site" {...field} />
                    </FormControl>
                    <FormDescription>A clear title that describes your project.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project in detail..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description including requirements, goals, and expectations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
                          <SelectItem value="MOBILE_APP">Mobile App Development</SelectItem>
                          <SelectItem value="UI_UX_DESIGN">UI/UX Design</SelectItem>
                          <SelectItem value="DATA_SCIENCE">Data Science & Analytics</SelectItem>
                          <SelectItem value="CONTENT_WRITING">Content Writing</SelectItem>
                          <SelectItem value="BLOCKCHAIN">Blockchain & Web3</SelectItem>
                          <SelectItem value="AI_ML">AI & Machine Learning</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (USD, Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 500" min="0" {...field} />
                      </FormControl>
                      <FormDescription>Your estimated budget for this project.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Project Deadline (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select deadline</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date by which you need the project completed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., 2 weeks, 1 month" {...field} />
                      </FormControl>
                      <FormDescription>
                        The estimated time required to complete the project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., React, Node.js, UI/UX, Python" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of skills required for this project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ENTRY">Entry Level</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The level of experience required for this project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/freelance")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || (!!user && !canPostGigs)}>
                  {submitting ? "Posting..." : "Post Project"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
