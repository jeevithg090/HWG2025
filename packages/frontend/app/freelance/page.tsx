'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { freelanceApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Clock, DollarSign, BriefcaseBusiness, Calendar } from "lucide-react";

export default function FreelancePage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  
  useEffect(() => {
    loadProjects();
  }, [categoryFilter, budgetFilter]);
  
  const loadProjects = async () => {
    setLoading(true);
    try {
      // Create filter object with only non-empty values
      const filters = {
        ...(categoryFilter && { category: categoryFilter }),
        ...(budgetFilter && { budget: budgetFilter })
      };
      
      const response = await freelanceApi.getProjects(filters);
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateProject = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    router.push('/freelance/create');
  };
  
  const handleViewProject = (projectId) => {
    router.push(`/freelance/${projectId}`);
  };
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Freelance Marketplace</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find projects or post your own to collaborate with talented professionals
            </p>
          </div>
          <Button size="lg" onClick={handleCreateProject}>
            Create Project
          </Button>
        </div>
        
        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="data">Data Science</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Budget</SelectItem>
                  <SelectItem value="low">Under $500</SelectItem>
                  <SelectItem value="medium">$500 - $2000</SelectItem>
                  <SelectItem value="high">$2000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">Try changing your search or filters</p>
            <Button onClick={handleCreateProject} variant="outline">Create Your Own Project</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{project.category}</Badge>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Budget: ${project.budgetMin} - ${project.budgetMax}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      Duration: {project.duration} {project.durationType}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Posted: {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <BriefcaseBusiness className="mr-2 h-4 w-4" />
                      {project.proposalCount || 0} proposals
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleViewProject(project.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};
