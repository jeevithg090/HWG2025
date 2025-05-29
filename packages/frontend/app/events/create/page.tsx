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
import { Checkbox } from "@/components/ui/checkbox";
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
import { eventApi } from '@/lib/api-client';
import { toast } from 'sonner';

// Define form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  startDateTime: z.date({
    required_error: "Start date and time is required.",
  }),
  endDateTime: z.date().optional(),
  venue: z.string().optional(),
  onlineLink: z.string().url().optional().or(z.literal('')),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  maxAttendees: z.string().optional().transform(val => 
    val === '' ? undefined : parseInt(val, 10)
  ),
  tags: z.string().optional().transform(val => 
    val === '' ? [] : val.split(',').map(tag => tag.trim())
  ),
});

export default function CreateEventPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      onlineLink: "",
      eventType: "MEETUP",
      isActive: true,
      isPublished: false,
      tags: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAuthenticated) {
      toast.error('Please login to create events');
      router.push('/auth');
      return;
    }

    setSubmitting(true);
    try {
      // Format the event data
      const eventData = {
        ...values,
        organizerId: user?.id,
        currentAttendees: 0,
      };
      
      const response = await eventApi.createEvent(eventData, token);
      
      if (response.success) {
        toast.success('Event created successfully!');
        router.push(`/events/${response.event.id}`);
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/events')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Tech Meetup 2025" {...field} />
                    </FormControl>
                    <FormDescription>
                      A catchy title for your event.
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
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event in detail..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the event including agenda, speakers, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time</FormLabel>
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
                                format(field.value, "PPP p")
                              ) : (
                                <span>Select date and time</span>
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
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const date = new Date(field.value || new Date());
                                const [hours, minutes] = e.target.value.split(':');
                                date.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time (Optional)</FormLabel>
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
                                format(field.value, "PPP p")
                              ) : (
                                <span>Select end date and time</span>
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
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                if (!field.value) return;
                                const date = new Date(field.value);
                                const [hours, minutes] = e.target.value.split(':');
                                date.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Tech Hub Convention Center" {...field} />
                      </FormControl>
                      <FormDescription>
                        For in-person events. Leave blank if online only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="onlineLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Online Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., https://zoom.us/j/123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        For virtual events. Leave blank if in-person only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MEETUP">Meetup</SelectItem>
                          <SelectItem value="WORKSHOP">Workshop</SelectItem>
                          <SelectItem value="HACKATHON">Hackathon</SelectItem>
                          <SelectItem value="CONFERENCE">Conference</SelectItem>
                          <SelectItem value="WEBINAR">Webinar</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave blank for unlimited"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Limit the number of attendees.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., technology, coding, web3" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of tags to help categorize your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Is this event currently active?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publish</FormLabel>
                        <FormDescription>
                          Make this event visible to the public.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/events')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
