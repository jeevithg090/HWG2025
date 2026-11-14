"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Settings,
  Share,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ErrorState, LoadingState } from "@/components/page-state";
import { EventTypeBadge, EventTypeIcon } from "@/components/event-type-badge";
import {
  EventRegistrationModal,
  type EventRegistrationData,
} from "@/components/event-registration-modal";
import { useUser } from "@/lib/user-context";
import { eventApi } from "@/lib/api-client";
import {
  EVENT_TYPE_LABELS,
  activeRegistrations,
  filterEvents,
  getCapacityPercent,
  getEventLocation,
  isEventFull,
  isOnlineEvent,
  isUpcoming,
  sortByStart,
} from "@/lib/event-helpers";
import type { EventFilterOptions } from "@/lib/event-helpers";
import { formatDate, formatTime, truncate } from "@/lib/format";
import { EVENT_TYPES } from "@/lib/types";
import type { EventAttendee, TechEvent } from "@/lib/types";

function EventMeta({ event }: { event: TechEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" aria-hidden="true" />
        <span>{formatDate(event.startDateTime)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>{formatTime(event.startDateTime)}</span>
      </div>
      <div className="flex items-center gap-1">
        {isOnlineEvent(event) ? (
          <Video className="h-4 w-4" aria-hidden="true" />
        ) : (
          <MapPin className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{getEventLocation(event)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4" aria-hidden="true" />
        <span>
          {event.currentAttendees ?? 0} registered
          {event.maxAttendees ? ` • ${event.maxAttendees} max` : ""}
        </span>
      </div>
    </div>
  );
}

function TagList({ tags }: { tags?: string[] | null }) {
  if (!tags?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const { user, isLoading: isUserLoading, isClient, isFreelancer, isStartup } = useUser();
  const canHost = isClient || isStartup || user?.role === "admin";

  const [events, setEvents] = useState<TechEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null);
  const [filters, setFilters] = useState<Required<EventFilterOptions>>({
    search: "",
    type: "all",
    location: "all",
  });

  const userId = user?.id;

  const loadEventsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [eventsResponse, registrationsResponse] = await Promise.all([
      eventApi.getAllEvents({ isActive: true, limit: 100 }),
      userId ? eventApi.getUserEvents(userId) : Promise.resolve(null),
    ]);

    if (eventsResponse.success) {
      setEvents(eventsResponse.events ?? []);
    } else {
      setError(eventsResponse.message || "Failed to load events");
    }
    if (registrationsResponse?.success) {
      setRegistrations(registrationsResponse.events ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!isUserLoading) void loadEventsData();
  }, [isUserLoading, loadEventsData]);

  const registeredIds = useMemo(
    () => new Set(activeRegistrations(registrations).map((r) => r.eventId)),
    [registrations],
  );
  const publicEvents = useMemo(
    () => sortByStart(events.filter((event) => event.isPublished !== false && isUpcoming(event))),
    [events],
  );
  const visibleEvents = useMemo(() => filterEvents(publicEvents, filters), [publicEvents, filters]);
  const featuredEvents = visibleEvents.slice(0, 3);
  const upcomingEvents = visibleEvents.slice(3);
  const hostedEvents = useMemo(
    () => sortByStart(events.filter((event) => !!userId && event.organizerId === userId)),
    [events, userId],
  );
  const myRegistrations = useMemo(() => {
    const byId = new Map(events.map((event) => [event.id, event]));
    return activeRegistrations(registrations)
      .map((registration) => ({
        registration,
        event: registration.event ?? byId.get(registration.eventId),
      }))
      .filter((item): item is { registration: EventAttendee; event: TechEvent } => !!item.event);
  }, [registrations, events]);

  const hostingStats = useMemo(() => {
    const totalAttendees = hostedEvents.reduce((sum, e) => sum + (e.currentAttendees ?? 0), 0);
    const upcoming = hostedEvents.filter((e) => isUpcoming(e)).length;
    const byType = EVENT_TYPES.map((type) => ({
      type,
      count: hostedEvents.filter((e) => e.eventType === type).length,
    })).filter((entry) => entry.count > 0);
    return { totalAttendees, upcoming, byType };
  }, [hostedEvents]);

  const handleRegisterClick = (event: TechEvent) => {
    if (!user) {
      toast.error("Please sign in to register for events.");
      return;
    }
    setSelectedEvent(event);
  };

  const handleEventRegistration = async (data: EventRegistrationData) => {
    if (!selectedEvent) return;
    const response = await eventApi.registerForEvent(selectedEvent.id, {
      userName: data.userName || undefined,
    });
    if (!response.success) {
      throw new Error(response.message || "Failed to register for event");
    }
    toast.success(`You're registered for ${selectedEvent.title}`);
    setSelectedEvent(null);
    void loadEventsData();
  };

  const handleCancelRegistration = async (eventId: string) => {
    const response = await eventApi.cancelRegistration(eventId);
    if (!response.success) {
      toast.error(response.message || "Failed to cancel registration");
      return;
    }
    toast.success("Registration cancelled");
    void loadEventsData();
  };

  const handleShareEvent = async (event: TechEvent) => {
    const url = `${window.location.origin}/events/${event.id}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: event.title, text: event.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Event link copied!");
      }
    } catch {
      // The user dismissed the share sheet or clipboard access was denied.
    }
  };

  const registerLabel = (event: TechEvent) => {
    if (registeredIds.has(event.id)) return "Registered";
    if (isEventFull(event)) return "Event full";
    return "Register";
  };

  if (isUserLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isFreelancer ? "Discover Events" : "Events Hub"}</h1>
          <p className="text-muted-foreground">
            {isFreelancer
              ? "Find and join amazing tech events to grow your network"
              : "Discover and organize tech events"}
          </p>
        </div>
        {canHost && (
          <Button className="gap-2" asChild>
            <Link href="/dashboard/events/create">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList
          className={`grid h-auto w-full grid-cols-2 ${canHost ? "md:grid-cols-4" : "md:grid-cols-2"}`}
        >
          <TabsTrigger value="discover">
            {isFreelancer ? "Browse Events" : "Discover Events"}
          </TabsTrigger>
          <TabsTrigger value="registered">
            {isFreelancer ? "My Events" : "My Registrations"}
          </TabsTrigger>
          {canHost && <TabsTrigger value="hosting">Hosting</TabsTrigger>}
          {canHost && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Search events..."
                    aria-label="Search events"
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, type: value as typeof prev.type }))
                  }
                >
                  <SelectTrigger className="w-full md:w-48" aria-label="Event type">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EVENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.location}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, location: value as typeof prev.location }))
                  }
                >
                  <SelectTrigger className="w-full md:w-48" aria-label="Location">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <LoadingState label="Loading events..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void loadEventsData()} />
          ) : visibleEvents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {publicEvents.length === 0
                  ? "There are no upcoming events yet."
                  : "No events match your filters."}
              </CardContent>
            </Card>
          ) : (
            <>
              <div>
                <h2 className="mb-4 text-xl font-semibold">Featured Events</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden transition-shadow hover:shadow-lg"
                    >
                      <div
                        className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 bg-cover bg-center"
                        style={
                          event.coverImage
                            ? { backgroundImage: `url(${JSON.stringify(event.coverImage)})` }
                            : undefined
                        }
                      >
                        <div className="absolute left-4 top-4">
                          <Badge className="bg-white text-black">Featured</Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="space-y-2">
                          <EventTypeBadge type={event.eventType} />
                          <CardTitle className="text-lg">
                            <Link href={`/events/${event.id}`} className="hover:underline">
                              {event.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>{truncate(event.description, 160)}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <EventMeta event={event} />
                          <TagList tags={event.tags} />
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1"
                              onClick={() => handleRegisterClick(event)}
                              disabled={registeredIds.has(event.id) || isEventFull(event)}
                            >
                              {registerLabel(event)}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => void handleShareEvent(event)}
                              aria-label={`Share ${event.title}`}
                            >
                              <Share className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {upcomingEvents.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white">
                                <EventTypeIcon type={event.eventType} />
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold">{event.title}</h3>
                                  <EventTypeBadge type={event.eventType} />
                                </div>
                                <EventMeta event={event} />
                                <p className="text-sm text-muted-foreground">
                                  {truncate(event.description, 200)}
                                </p>
                                <TagList tags={event.tags} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/events/${event.id}`}>View Details</Link>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRegisterClick(event)}
                                disabled={registeredIds.has(event.id) || isEventFull(event)}
                              >
                                {registerLabel(event)}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleShareEvent(event)}
                                aria-label={`Share ${event.title}`}
                              >
                                <Share className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="registered" className="space-y-6">
          {loading ? (
            <LoadingState label="Loading your registrations..." />
          ) : !user ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Sign in to see the events you registered for.
              </CardContent>
            </Card>
          ) : myRegistrations.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Calendar
                  className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="mb-2 text-lg font-semibold">No Registrations Yet</h3>
                <p className="text-muted-foreground">Register for events to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {myRegistrations.map(({ registration, event }) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                          <EventTypeIcon type={event.eventType} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <EventTypeBadge type={event.eventType} />
                          </div>
                          <EventMeta event={event} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/events/${event.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                            Event Details
                          </Link>
                        </Button>
                        {isUpcoming(event) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleCancelRegistration(event.id)}
                          >
                            Cancel Registration
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {canHost && (
          <TabsContent value="hosting" className="space-y-6">
            {loading ? (
              <LoadingState label="Loading your events..." />
            ) : hostedEvents.length === 0 ? (
              <Card>
                <CardContent className="space-y-4 py-10 text-center">
                  <p className="text-muted-foreground">You haven&apos;t created any events yet.</p>
                  <Button asChild>
                    <Link href="/dashboard/events/create">Create Event</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {hostedEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>
                            {formatDate(event.startDateTime)} • {event.currentAttendees ?? 0}/
                            {event.maxAttendees || "∞"} registered
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.isPublished === false && <Badge variant="outline">Draft</Badge>}
                          <Badge
                            variant={isUpcoming(event) ? "default" : "secondary"}
                            className={isUpcoming(event) ? "bg-green-100 text-green-800" : ""}
                          >
                            {isUpcoming(event) ? "Upcoming" : "Past"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {event.maxAttendees ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Registration Progress</span>
                              <span className="font-medium">
                                {event.currentAttendees ?? 0}/{event.maxAttendees} spots filled
                              </span>
                            </div>
                            <Progress
                              value={getCapacityPercent(event)}
                              className="h-2"
                              aria-label="Registration progress"
                            />
                          </>
                        ) : null}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/events/manage/${event.id}`}>
                              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                              Manage
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/events/${event.id}`}>View Event</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {canHost && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hostedEvents.length}</div>
                  <p className="text-xs text-muted-foreground">{hostingStats.upcoming} upcoming</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hostingStats.totalAttendees}</div>
                  <p className="text-xs text-muted-foreground">Across all your events</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {hostedEvents.length
                      ? Math.round(hostingStats.totalAttendees / hostedEvents.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Registrations per event</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Event Types Distribution</CardTitle>
                <CardDescription>Breakdown of your events by type</CardDescription>
              </CardHeader>
              <CardContent>
                {hostingStats.byType.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events yet.</p>
                ) : (
                  <div className="space-y-4">
                    {hostingStats.byType.map(({ type, count }) => {
                      const percent = Math.round((count / hostedEvents.length) * 100);
                      return (
                        <div key={type}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>{EVENT_TYPE_LABELS[type]}</span>
                            <span>{percent}%</span>
                          </div>
                          <Progress
                            value={percent}
                            className="h-2"
                            aria-label={`${EVENT_TYPE_LABELS[type]} share`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {selectedEvent && (
        <EventRegistrationModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSubmit={handleEventRegistration}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
