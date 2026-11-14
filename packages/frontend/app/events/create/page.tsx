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
import { useAuth } from "@/lib/auth-context";
import { eventApi } from "@/lib/api-client";
import { parseList } from "@/lib/format";
import { EVENT_TYPES } from "@/lib/types";
import type { CreateEventPayload, EventType } from "@/lib/types";
import { toast } from "sonner";

/** Returns a copy of `date` with the "HH:mm" time applied (unchanged if invalid). */
function withTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  const next = new Date(date);
  if (Number.isFinite(hours) && Number.isFinite(minutes)) next.setHours(hours, minutes, 0, 0);
  return next;
}

/** Picking a new day in the calendar keeps the time already chosen. */
function mergeDayKeepTime(day: Date | undefined, previous: Date | undefined): Date | undefined {
  if (!day || !previous) return day;
  const next = new Date(day);
  next.setHours(previous.getHours(), previous.getMinutes(), 0, 0);
  return next;
}

const EVENT_TYPE_VALUES = EVENT_TYPES as [EventType, ...EventType[]];

const formSchema = z
  .object({
    title: z.string().trim().min(5, { message: "Title must be at least 5 characters." }),
    description: z
      .string()
      .trim()
      .min(20, { message: "Description must be at least 20 characters." }),
    startDateTime: z.date({ error: "Start date and time is required." }),
    endDateTime: z.date().optional(),
    venue: z.string(),
    onlineLink: z.union([z.literal(""), z.url({ message: "Enter a valid URL." })]),
    eventType: z.enum(EVENT_TYPE_VALUES, { error: "Please select an event type." }),
    isPublished: z.boolean(),
    maxAttendees: z.string().regex(/^\d*$/, { message: "Enter a whole number." }),
    tags: z.string(),
  })
  .refine((values) => !values.endDateTime || values.endDateTime > values.startDateTime, {
    message: "End must be after the start.",
    path: ["endDateTime"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      onlineLink: "",
      eventType: "MEETUP",
      isPublished: true,
      maxAttendees: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to create events");
      router.replace("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (values: FormValues) => {
    const maxAttendees = values.maxAttendees ? Number.parseInt(values.maxAttendees, 10) : undefined;
    const payload: CreateEventPayload = {
      title: values.title,
      description: values.description,
      startDateTime: values.startDateTime.toISOString(),
      endDateTime: values.endDateTime?.toISOString(),
      venue: values.venue.trim() || undefined,
      onlineLink: values.onlineLink || undefined,
      eventType: values.eventType,
      isPublished: values.isPublished,
      maxAttendees: maxAttendees && maxAttendees > 0 ? maxAttendees : undefined,
      tags: parseList(values.tags),
    };

    setSubmitting(true);
    const response = await eventApi.createEvent(payload);
    setSubmitting(false);

    if (response.success) {
      toast.success("Event created successfully!");
      router.push(response.event?.id ? `/events/${response.event.id}` : "/events");
    } else if (response.status === 401) {
      toast.error("Your session has expired. Please sign in again.");
      router.push("/auth/signin");
    } else {
      toast.error(response.message || "Failed to create event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/events")} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Events
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
                    <FormDescription>A catchy title for your event.</FormDescription>
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
                                !field.value && "text-muted-foreground",
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
                            onSelect={(day) => field.onChange(mergeDayKeepTime(day, field.value))}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              aria-label="Start time"
                              onChange={(e) =>
                                field.onChange(withTime(field.value ?? new Date(), e.target.value))
                              }
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
                                !field.value && "text-muted-foreground",
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
                            onSelect={(day) => field.onChange(mergeDayKeepTime(day, field.value))}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              aria-label="End time"
                              onChange={(e) => {
                                if (field.value)
                                  field.onChange(withTime(field.value, e.target.value));
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
                      <FormDescription>Limit the number of attendees.</FormDescription>
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
                      <Input placeholder="E.g., technology, coding, web3" {...field} />
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
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publish</FormLabel>
                        <FormDescription>Make this event visible to the public.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/events")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
