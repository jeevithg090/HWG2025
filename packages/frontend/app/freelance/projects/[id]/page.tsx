'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  DollarSign, 
  Briefcase, 
  User, 
  Tag, 
  SendHorizontal,
  Star
} from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import { freelanceApi } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposalContent, setProposalContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProject(params.id);
    }
  }, [params.id]);

  const loadProject = async (projectId) => {
    setLoading(true);
    try {
      const response = await freelanceApi.getGigById(projectId);
      if (response.success) {
        setProject(response.data);
        
        if (isAuthenticated) {
          // If user is logged in, also load the proposals if needed
          if (response.data.clientId === user.id) {
            const proposalsResponse = await freelanceApi.getProposalsByGigId(projectId);
            if (proposalsResponse.success) {
              setProposals(proposalsResponse.data);
            }
          }
        }
      } else {
        toast.error('Failed to load project details');
        router.push('/freelance/projects');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
      router.push('/freelance/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a proposal');
      router.push('/auth');
      return;
    }
    
    if (!proposalContent.trim()) {
      toast.error('Please write a proposal before submitting');
      return;
    }
    
    setSubmitting(true);
    try {
      const proposalData = {
        gigId: project.id,
        freelancerId: user.id,
        coverLetter: proposalContent,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      const response = await freelanceApi.createProposal(proposalData, token);
      
      if (response.success) {
        toast.success('Proposal submitted successfully!');
        setProposalContent('');
        
        // Refresh project to show the user has applied
        loadProject(params.id);
      } else {
        toast.error('Failed to submit proposal');
      }
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      toast.error('Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
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

  // Check if the current user has already submitted a proposal
  const hasSubmittedProposal = user && proposals.some(proposal => proposal.freelancerId === user.id);
  
  // Check if the current user is the project owner
  const isProjectOwner = user && project?.clientId === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => router.push('/freelance/projects')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/freelance/projects')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{project.projectType?.replace('_', ' ')}</Badge>
                <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{project.title}</h1>
              <p className="text-muted-foreground">
                Posted on {formatDate(project.createdAt)}
              </p>
            </div>
            
            <div className="prose prose-blue max-w-none mb-8">
              <h2>Project Description</h2>
              <p className="whitespace-pre-line">{project.description}</p>
            </div>

            {project.skills && project.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Submit proposal section - only show if user is logged in, not the project owner, and hasn't submitted a proposal yet */}
            {isAuthenticated && !isProjectOwner && !hasSubmittedProposal && project.status === 'open' && (
              <div className="bg-card rounded-lg border p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">Submit a Proposal</h2>
                <form onSubmit={handleSubmitProposal}>
                  <Textarea
                    placeholder="Describe why you're a good fit for this project..."
                    className="min-h-32 mb-4"
                    value={proposalContent}
                    onChange={(e) => setProposalContent(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                    <SendHorizontal className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
            
            {/* Show message if user already submitted a proposal */}
            {isAuthenticated && !isProjectOwner && hasSubmittedProposal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-center">
                <p className="text-blue-700">You have already submitted a proposal for this project.</p>
              </div>
            )}
            
            {/* Proposals section - only visible to the project owner */}
            {isAuthenticated && isProjectOwner && proposals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Proposals ({proposals.length})</h2>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{proposal.freelancerName || 'Freelancer'}</CardTitle>
                          </div>
                          <Badge variant={proposal.status === 'accepted' ? 'default' : 'outline'}>
                            {proposal.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Submitted on {formatDate(proposal.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{proposal.coverLetter}</p>
                      </CardContent>
                      {proposal.status === 'pending' && (
                        <CardFooter className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProposalAction(proposal.id, 'rejected')}
                          >
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleProposalAction(proposal.id, 'accepted')}
                          >
                            Accept
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Project details sidebar */}
          <div>
            <div className="bg-card rounded-lg border p-6 shadow-sm mb-6">
              <h3 className="text-xl font-semibold mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{formatBudget(project.budget)}</p>
                    <p className="text-sm text-muted-foreground">Budget</p>
                  </div>
                </div>
                
                {project.deadline && (
                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{formatDate(project.deadline)}</p>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                    </div>
                  </div>
                )}
                
                {project.estimatedDuration && (
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{project.estimatedDuration}</p>
                      <p className="text-sm text-muted-foreground">Estimated duration</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{project.experienceLevel?.replace('_', ' ') || 'Any level'}</p>
                    <p className="text-sm text-muted-foreground">Experience level</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{project.clientName || 'Client'}</p>
                    <p className="text-sm text-muted-foreground">Posted by</p>
                  </div>
                </div>
                
                {project.clientRating && (
                  <div className="flex gap-3">
                    <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{project.clientRating} / 5</p>
                      <p className="text-sm text-muted-foreground">Client rating</p>
                    </div>
                  </div>
                )}
              </div>
              
              {isAuthenticated && !isProjectOwner && project.status === 'open' && !hasSubmittedProposal && (
                <>
                  <Separator className="my-6" />
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => document.getElementById('proposal-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Apply Now
                  </Button>
                </>
              )}
            </div>
            
            {/* Project actions for owners */}
            {isAuthenticated && isProjectOwner && (
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Project Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/freelance/projects/edit/${project.id}`)}
                  >
                    Edit Project
                  </Button>
                  
                  {project.status === 'open' && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleCloseProject()}
                    >
                      Close Project
                    </Button>
                  )}
                  
                  {project.status === 'closed' && (
                    <Button 
                      variant="outline" 
                      className="w-full text-green-500 border-green-200 hover:bg-green-50"
                      onClick={() => handleReopenProject()}
                    >
                      Reopen Project
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
