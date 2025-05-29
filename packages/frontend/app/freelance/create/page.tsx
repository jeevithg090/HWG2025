'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Tag, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { freelanceApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function CreateProjectPage() {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    durationType: 'DAYS',
  });
  
  // Redirect to login if not authenticated
  if (!isAuthenticated && typeof window !== 'undefined') {
    router.push('/auth');
    return null;
  }
  
  const handleInputChange = (field, value) => {
    setProjectData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!projectData.title || !projectData.description || !projectData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format the data for the API
      const formattedData = {
        ...projectData,
        budgetMin: parseFloat(projectData.budgetMin),
        budgetMax: parseFloat(projectData.budgetMax),
        duration: parseInt(projectData.duration),
        skills: projectData.skills.split(',').map(skill => skill.trim()),
        clientId: user?.id || '', // Use the authenticated user's ID
      };
      
      const response = await freelanceApi.createProject(formattedData, token);
      if (response.success) {
        toast.success('Project created successfully');
        router.push('/freelance');
      } else {
        toast.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Create a New Project</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Post your project and start receiving proposals from talented freelancers
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear title for your project"
                    value={projectData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project requirements, goals, and deliverables in detail"
                    rows={6}
                    value={projectData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={projectData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="mobile">Mobile Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="data">Data Science</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="skills">Required Skills</Label>
                    <Input
                      id="skills"
                      placeholder="React, Node.js, TypeScript, etc."
                      value={projectData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated list of skills
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin">Budget Range *</Label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                          id="budgetMin"
                          type="number"
                          placeholder="Min"
                          className="pl-8"
                          value={projectData.budgetMin}
                          onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                          min="1"
                          required
                        />
                      </div>
                      <span>-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                          id="budgetMax"
                          type="number"
                          placeholder="Max"
                          className="pl-8"
                          value={projectData.budgetMax}
                          onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                          min={projectData.budgetMin || 1}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Duration"
                        value={projectData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        min="1"
                        required
                      />
                      <Select 
                        value={projectData.durationType} 
                        onValueChange={(value) => handleInputChange('durationType', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOURS">Hours</SelectItem>
                          <SelectItem value="DAYS">Days</SelectItem>
                          <SelectItem value="WEEKS">Weeks</SelectItem>
                          <SelectItem value="MONTHS">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/freelance')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Project'}
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tips for a Great Project</CardTitle>
                <CardDescription>Best practices to attract qualified freelancers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="text-blue-500 mt-0.5">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Be Specific</h4>
                    <p className="text-sm text-muted-foreground">
                      Clearly describe your project scope, requirements, and expected deliverables.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="text-blue-500 mt-0.5">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Set a Realistic Budget</h4>
                    <p className="text-sm text-muted-foreground">
                      Research market rates for similar projects to set appropriate expectations.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="text-blue-500 mt-0.5">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Define Timeline</h4>
                    <p className="text-sm text-muted-foreground">
                      Include realistic deadlines and milestones for your project.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="text-amber-500 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Remember</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll review proposals and can chat with freelancers before making any commitments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
