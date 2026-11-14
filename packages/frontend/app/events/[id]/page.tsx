"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ExternalLink, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { ErrorState, LoadingState } from "@/components/page-state";
import { EventTypeBadge } from "@/components/event-type-badge";
import {
  EventRegistrationModal,
  type EventRegistrationData,
} from "@/components/event-registration-modal";
import { useAuth } from "@/lib/auth-context";
import { eventApi } from "@/lib/api-client";
import { getSpotsLeft, isEventFull, isUpcoming } from "@/lib/event-helpers";
import { formatTime } from "@/lib/format";
import type { TechEvent } from "@/lib/types";

function formatLongDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<TechEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    const response = await eventApi.getEventById(eventId);
    if (response.success) {
      setEvent(response.event);
    } else if (response.status === 404) {
      setNotFound(true);
    } else {
      setError(response.message || "Failed to load event details");
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to register for events");
      router.push("/auth/signin");
      return;
    }
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSubmit = async (data: EventRegistrationData) => {
    const response = await eventApi.registerForEvent(eventId, {
      userName: data.userName || undefined,
    });
    if (!response.success) {
      throw new Error(response.message || "Registration failed");
    }
    toast.success("Successfully registered for the event!");
    setIsRegistrationModalOpen(false);
    void loadEvent();
  };

  if (loading) {
    return (
      <Shell>
        <LoadingState label="Loading event details..." />
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <ErrorState message={error} onRetry={() => void loadEvent()} />
      </Shell>
    );
  }

  if (notFound || !event) {
    return (
      <Shell>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Event not found</h1>
          <Button asChild>
            <Link href="/events">
              <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Events
            </Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const full = isEventFull(event);
  const past = !isUpcoming(event);
  const spotsLeft = getSpotsLeft(event);
  const isOrganizer = !!user && event.organizerId === user.id;

  return (
    <Shell>
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/events">
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Events
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <EventTypeBadge type={event.eventType} />
              {event.isActive === false && <Badge variant="outline">Inactive</Badge>}
              {past && <Badge variant="outline">Past event</Badge>}
            </div>
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">{event.title}</h1>
          </div>

          {event.coverImage && (
            <div className="mb-6 h-80 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <section className="mb-8">
            <h2 className="mb-2 text-xl font-semibold">About this event</h2>
            <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
          </section>

          {event.tags && event.tags.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Event Details</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Calendar
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">{formatLongDate(event.startDateTime)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(event.startDateTime)} -{" "}
                    {event.endDateTime ? formatTime(event.endDateTime) : "TBD"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  {event.venue && (
                    <>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm text-muted-foreground">In-person event</p>
                    </>
                  )}
                  {event.onlineLink && (
                    <>
                      {!event.venue && <p className="font-medium">Online Event</p>}
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        Join link <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
                      </a>
                    </>
                  )}
                  {!event.venue && !event.onlineLink && <p className="font-medium">Location TBD</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">
                    {event.currentAttendees ?? 0} / {event.maxAttendees || "∞"} attendees
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {full
                      ? "Event is full"
                      : spotsLeft !== null
                        ? `${spotsLeft} spots available`
                        : "Spots available"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {isOrganizer ? (
              <Button className="w-full" size="lg" asChild>
                <Link href={`/dashboard/events/manage/${event.id}`}>Manage Event</Link>
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                disabled={full || past}
                onClick={handleRegisterClick}
              >
                {past ? "Event has ended" : full ? "Event Full" : "Register Now"}
              </Button>
            )}
          </div>
        </aside>
      </div>

      <EventRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmit={handleRegistrationSubmit}
        event={event}
      />
    </Shell>
  );
}
