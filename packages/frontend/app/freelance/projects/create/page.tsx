'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useAuth } from '@/lib/auth-context';
import { freelanceApi } from '@/lib/api-client';
import { toast } from 'sonner';

// Define form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  projectType: z.string({
    required_error: "Please select a project type.",
  }),
  budget: z.string().optional().transform(val => 
    val === '' ? undefined : parseFloat(val)
  ),
  deadline: z.date().optional(),
  estimatedDuration: z.string().optional(),
  skills: z.string().transform(val => 
    val.split(',').map(skill => skill.trim()).filter(Boolean)
  ),
  experienceLevel: z.string({
    required_error: "Please select the required experience level.",
  }),
  attachments: z.any().optional(),
});

export default function CreateProjectPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
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

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAuthenticated) {
      toast.error('Please login to create projects');
      router.push('/auth');
      return;
    }

    setSubmitting(true);
    try {
      // Format the project data
      const projectData = {
        ...values,
        clientId: user?.id,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      
      const response = await freelanceApi.createProject(projectData, token);
      
      if (response.success) {
        toast.success('Project created successfully!');
        router.push(`/freelance/projects/${response.data.id}`);
      } else {
        toast.error('Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/freelance/projects')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Post a New Project</h1>
          
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
                    <FormDescription>
                      A clear title that describes your project.
                    </FormDescription>
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
                        <Input 
                          type="number" 
                          placeholder="E.g., 500"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your estimated budget for this project.
                      </FormDescription>
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
                                !field.value && "text-muted-foreground"
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
                      <Input 
                        placeholder="E.g., React, Node.js, UI/UX, Python" 
                        {...field}
                      />
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
                <Button type="button" variant="outline" onClick={() => router.push('/freelance/projects')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Project'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
