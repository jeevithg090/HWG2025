"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Calendar, Clock, DollarSign, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { ErrorState, LoadingState } from "@/components/page-state";
import { freelanceApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { matchesBudgetRange } from "@/lib/dashboard-helpers";
import type { BudgetRange } from "@/lib/dashboard-helpers";
import { formatCurrency, formatDate, humanize, parseList } from "@/lib/format";
import type { Gig } from "@/lib/types";

function statusVariant(status: Gig["status"]) {
  switch (status) {
    case "open":
      return "default" as const;
    case "in_progress":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function FreelancePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [search, setSearch] = useState<{ query: string; skills: string[] } | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange>("all");

  const canPostGigs = user?.type === "client" || user?.type === "startup" || user?.type === "admin";

  // Pick up ?query=&skills= from the URL (e.g. from the dashboard search box).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query")?.trim() ?? "";
    const skills = parseList(params.get("skills"));
    setSearchInput(query);
    setSkillsInput(skills.join(", "));
    setSearch({ query, skills });
  }, []);

  const loadProjects = useCallback(async () => {
    if (!search) return;
    setLoading(true);
    setError(null);
    const hasSearch = !!search.query || search.skills.length > 0;
    const response = hasSearch
      ? await freelanceApi.searchProjects(search)
      : await freelanceApi.getProjects({ limit: 50 });
    if (response.success) {
      setProjects(response.data ?? []);
    } else {
      setError(response.message || "Failed to load projects");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch({ query: searchInput.trim(), skills: parseList(skillsInput) });
  };

  const handleCreateProject = () => {
    router.push(isAuthenticated ? "/freelance/projects/create" : "/auth/signin");
  };

  const filteredProjects = useMemo(
    () => projects.filter((project) => matchesBudgetRange(project.budget, budgetFilter)),
    [projects, budgetFilter],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
          <div>
            <h1 className="mb-4 text-4xl font-bold">Freelance Marketplace</h1>
            <p className="mb-6 text-lg text-muted-foreground">
              Find projects or post your own to collaborate with talented professionals
            </p>
          </div>
          {(!isAuthenticated || canPostGigs) && (
            <Button size="lg" onClick={handleCreateProject}>
              Create Project
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900"
          role="search"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              placeholder="Search projects..."
              aria-label="Search projects"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Input
              placeholder="Skills, e.g. React, Node.js"
              aria-label="Filter by skills (comma separated)"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
            <Select
              value={budgetFilter}
              onValueChange={(value) => setBudgetFilter(value as BudgetRange)}
            >
              <SelectTrigger aria-label="Filter by budget">
                <SelectValue placeholder="Filter by budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Budget</SelectItem>
                <SelectItem value="under-1k">Under $1,000</SelectItem>
                <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="over-10k">Over $10,000</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </Button>
          </div>
        </form>

        {loading ? (
          <LoadingState label="Loading projects..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void loadProjects()} />
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-2xl font-semibold">No projects found</h3>
            <p className="mb-6 text-muted-foreground">Try changing your search or filters</p>
            {(!isAuthenticated || canPostGigs) && (
              <Button onClick={handleCreateProject} variant="outline">
                Create Your Own Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(project.requiredSkills ?? []).slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={statusVariant(project.status)}>
                      {humanize(project.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="mr-2 h-4 w-4" aria-hidden="true" />
                      Budget: {formatCurrency(project.budget, "Negotiable")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                      Deadline: {formatDate(project.deadline, "Flexible")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                      Posted: {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <BriefcaseBusiness className="mr-2 h-4 w-4" aria-hidden="true" />
                      {project.proposalCount ?? 0} proposals
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/freelance/projects/${project.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
