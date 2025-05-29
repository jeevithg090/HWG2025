'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Briefcase, Calendar, Clock, DollarSign, Tag, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { freelanceApi } from "@/lib/api-client";
import { toast } from "sonner";

export default function FreelanceProjectsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await freelanceApi.getProjects();
      if (response.success) {
        setProjects(response.data);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    router.push(`/freelance/projects/${projectId}`);
  };

  const handleCreateProjectClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to create projects');
      router.push('/auth');
      return;
    }
    router.push('/freelance/projects/create');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Negotiable';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const filteredProjects = projects.filter(project => 
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Freelance Projects</h1>
          <Button onClick={handleCreateProjectClick}>
            <Plus className="mr-2 h-4 w-4" /> Post a Project
          </Button>
        </div>
        
        <p className="text-lg text-muted-foreground mb-6">
          Browse available freelance projects or post your own.
        </p>
        
        {/* Search bar */}
        <div className="mb-6">
          <Input
            placeholder="Search projects by title, description or skills..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try changing your search or be the first to post a project</p>
            <Button onClick={handleCreateProjectClick} className="mt-4">
              Post a Project
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="mr-2 h-4 w-4" />
                      {project.projectType || 'General Project'}
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="mr-2 h-4 w-4" />
                      {project.budget ? formatBudget(project.budget) : 'Budget: Negotiable'}
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Deadline: {formatDate(project.deadline)}
                    </div>
                    
                    {project.estimatedDuration && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Duration: {project.estimatedDuration}
                      </div>
                    )}
                    
                    {project.skills && project.skills.length > 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4" />
                        <div className="flex flex-wrap gap-1">
                          {project.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {project.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleProjectClick(project.id)}
                    variant={project.status === 'open' ? 'default' : 'outline'}
                  >
                    {project.status === 'open' ? 'View & Apply' : 'View Details'}
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
