"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ErrorState, LoadingState } from "@/components/page-state";
import { EventTypeBadge } from "@/components/event-type-badge";
import { eventApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getEventLocation, getSpotsLeft, isEventFull, isUpcoming } from "@/lib/event-helpers";
import { formatDate, formatTime, truncate } from "@/lib/format";
import type { TechEvent } from "@/lib/types";

export default function EventRegistrationPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [event, setEvent] = useState<TechEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const loadEvent = useCallback(async () => {
    setEventLoading(true);
    setLoadError(null);
    const response = await eventApi.getEventById(eventId);
    if (response.success) {
      setEvent(response.event);
    } else {
      setLoadError(
        response.status === 404
          ? "This event does not exist or has been removed."
          : response.message || "Failed to load event",
      );
    }
    setEventLoading(false);
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (user) setUserName(user.name);
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setIsSubmitting(true);
    const response = await eventApi.registerForEvent(eventId, {
      userName: userName.trim() || undefined,
    });
    setIsSubmitting(false);
    if (response.success) {
      setRegistered(true);
      toast.success("You're registered!");
    } else {
      toast.error(response.message || "Registration failed. Please try again.");
    }
  };

  const shellClass =
    "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900";

  if (eventLoading || isAuthLoading || !user) {
    return (
      <div className={shellClass}>
        <LoadingState label="Loading event details..." />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className={`${shellClass} container mx-auto px-4 py-8`}>
        <ErrorState
          message={loadError ?? "Event not found"}
          onRetry={() => void loadEvent()}
          action={
            <Button variant="outline" asChild>
              <Link href="/events">Back to events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const spotsLeft = getSpotsLeft(event);
  const closed = isEventFull(event) || !isUpcoming(event);

  return (
    <div className={shellClass}>
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/events/${event.id}`} aria-label="Back to event">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Event Registration</h1>
              <p className="text-muted-foreground">Secure your spot at this event</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {registered ? (
                <Card>
                  <CardContent className="space-y-4 py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
                    <h2 className="text-2xl font-semibold">You&apos;re registered!</h2>
                    <p className="text-muted-foreground">
                      We&apos;ve saved your spot at {event.title}.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button asChild>
                        <Link href="/dashboard/events">My events</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/events/${event.id}`}>Event details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : closed ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {isEventFull(event)
                      ? "This event is full."
                      : "Registration for this event is closed."}
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Confirm the details used for your registration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="userName">Name *</Label>
                          <Input
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            autoComplete="name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" value={user.email} readOnly disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                          I agree to the event terms and the organizer&apos;s code of conduct *
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        <span>Your email is shared only with the event organizer.</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <Link href={`/events/${event.id}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Registering..." : "Complete Registration"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <EventTypeBadge type={event.eventType} />
                    {event.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{truncate(event.description, 200)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{formatDate(event.startDateTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {formatTime(event.startDateTime)}
                      {event.endDateTime ? ` - ${formatTime(event.endDateTime)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{getEventLocation(event)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {event.currentAttendees ?? 0} registered
                      {spotsLeft !== null ? ` • ${spotsLeft} spots left` : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
