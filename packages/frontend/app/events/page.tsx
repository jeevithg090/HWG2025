"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Tag, Users } from "lucide-react";
import { toast } from "sonner";
import {
  EventRegistrationModal,
  type EventRegistrationData,
} from "@/components/event-registration-modal";
import { EventTypeBadge } from "@/components/event-type-badge";
import { Header } from "@/components/header";
import { ErrorState, LoadingState } from "@/components/page-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { eventApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { filterEvents, getEventLocation, isEventFull } from "@/lib/event-helpers";
import { formatDate, formatTime } from "@/lib/format";
import type { EventFilters, EventType, TechEvent } from "@/lib/types";

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<TechEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active">("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | "">("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const filters: EventFilters = { isPublished: true, limit: 100 };
    if (activeFilter === "active") filters.isActive = true;
    if (eventTypeFilter) filters.eventType = eventTypeFilter;

    const response = await eventApi.getAllEvents(filters);
    if (response.success) {
      setEvents(response.events ?? []);
    } else {
      setError(response.message || "Failed to load events");
    }
    setLoading(false);
  }, [activeFilter, eventTypeFilter]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleRegisterClick = (event: TechEvent) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to register for events.");
      router.push("/auth/signin");
      return;
    }
    setSelectedEvent(event);
  };

  const handleRegistrationSubmit = async (data: EventRegistrationData) => {
    if (!selectedEvent) return;
    const response = await eventApi.registerForEvent(selectedEvent.id, {
      userName: data.userName || undefined,
    });
    if (!response.success) {
      throw new Error(response.message || "Registration failed");
    }
    toast.success(`You're registered for ${selectedEvent.title}`);
    setSelectedEvent(null);
    void loadEvents();
  };

  const filteredEvents = useMemo(
    () => filterEvents(events, { search: searchQuery }),
    [events, searchQuery],
  );

  const toggleType = (type: EventType) =>
    setEventTypeFilter((current) => (current === type ? "" : type));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Upcoming Events</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            Discover tech meetups, workshops, hackathons, and conferences.
          </p>

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search events..."
              aria-label="Search events"
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                aria-pressed={activeFilter === "all"}
              >
                All
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                onClick={() => setActiveFilter("active")}
                aria-pressed={activeFilter === "active"}
              >
                Active
              </Button>
              <Button
                variant={eventTypeFilter === "MEETUP" ? "default" : "outline"}
                onClick={() => toggleType("MEETUP")}
                aria-pressed={eventTypeFilter === "MEETUP"}
              >
                Meetups
              </Button>
              <Button
                variant={eventTypeFilter === "HACKATHON" ? "default" : "outline"}
                onClick={() => toggleType("HACKATHON")}
                aria-pressed={eventTypeFilter === "HACKATHON"}
              >
                Hackathons
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading events..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void loadEvents()} />
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-2xl font-semibold">No events found</h3>
            <p className="text-muted-foreground">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const full = isEventFull(event);
              return (
                <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  {event.coverImage && (
                    <div className="h-48 w-full overflow-hidden">
                      {/* External, user-provided URLs: next/image would need every host allow-listed. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">
                        <Link href={`/events/${event.id}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </CardTitle>
                      <EventTypeBadge type={event.eventType} />
                    </div>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                        {formatDate(event.startDateTime)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                        {formatTime(event.startDateTime)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                        {getEventLocation(event)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                        {event.currentAttendees ?? 0}/{event.maxAttendees || "∞"} attendees
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <Tag className="mr-2 h-4 w-4" aria-hidden="true" />
                          <div className="flex flex-wrap gap-1">
                            {event.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleRegisterClick(event)}
                      disabled={full}
                    >
                      {full ? "Event Full" : "Register Now"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {selectedEvent && (
        <EventRegistrationModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSubmit={handleRegistrationSubmit}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
