"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  EyeOff,
  MoreVertical,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/page-state";
import { EventTypeBadge } from "@/components/event-type-badge";
import { eventApi } from "@/lib/api-client";
import { useUser } from "@/lib/user-context";
import { getCapacityPercent, getEventLocation } from "@/lib/event-helpers";
import { formatDate, formatDateTime, getInitials, humanize } from "@/lib/format";
import type { EventAttendee, TechEvent } from "@/lib/types";

type StatusFilter = "all" | "REGISTERED" | "WAITLISTED" | "CANCELLED" | "ATTENDED";

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportAttendees(event: TechEvent, attendees: EventAttendee[]) {
  const rows = [
    ["Name", "Email", "Status", "Attended", "Registered at"],
    ...attendees.map((a) => [
      a.userName ?? "",
      a.userEmail,
      a.status,
      a.hasAttended ? "yes" : "no",
      a.createdAt ?? "",
    ]),
  ];
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "event"}-attendees.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ attendee }: { attendee: EventAttendee }) {
  if (attendee.hasAttended) {
    return <Badge className="bg-blue-100 text-blue-800">Attended</Badge>;
  }
  switch (attendee.status) {
    case "REGISTERED":
      return <Badge className="bg-green-100 text-green-800">Registered</Badge>;
    case "WAITLISTED":
      return <Badge className="bg-yellow-100 text-yellow-800">Waitlist</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{humanize(attendee.status)}</Badge>;
  }
}

export default function ManageEventPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  const [event, setEvent] = useState<TechEvent | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAttendeesError(null);
    const [eventResponse, attendeesResponse] = await Promise.all([
      eventApi.getEventById(eventId),
      eventApi.getEventAttendees(eventId),
    ]);
    if (eventResponse.success) {
      setEvent(eventResponse.event);
    } else {
      setError(
        eventResponse.status === 404
          ? "This event does not exist or has been removed."
          : eventResponse.message || "Failed to load event",
      );
    }
    if (attendeesResponse.success) {
      setAttendees(attendeesResponse.attendees ?? []);
    } else {
      setAttendeesError(
        attendeesResponse.status === 403
          ? "Only the organizer can view the attendee list."
          : attendeesResponse.message || "Failed to load attendees",
      );
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (!isUserLoading) void load();
  }, [isUserLoading, load]);

  const filteredAttendees = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return attendees.filter((attendee) => {
      const matchesSearch =
        !needle ||
        (attendee.userName ?? "").toLowerCase().includes(needle) ||
        attendee.userEmail.toLowerCase().includes(needle);
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "ATTENDED" ? attendee.hasAttended : attendee.status === filterStatus);
      return matchesSearch && matchesFilter;
    });
  }, [attendees, searchTerm, filterStatus]);

  const counts = useMemo(
    () => ({
      registered: attendees.filter((a) => a.status === "REGISTERED").length,
      waitlisted: attendees.filter((a) => a.status === "WAITLISTED").length,
      attended: attendees.filter((a) => a.hasAttended).length,
    }),
    [attendees],
  );

  const handleMarkAttendance = async (attendee: EventAttendee) => {
    const response = await eventApi.markAttendance(attendee.id);
    if (!response.success) {
      toast.error(response.message || "Failed to mark attendance");
      return;
    }
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendee.id ? { ...a, ...response.attendee, hasAttended: true } : a,
      ),
    );
    toast.success(`${attendee.userName || attendee.userEmail} checked in`);
  };

  const togglePublished = async () => {
    if (!event) return;
    setBusy(true);
    const response = await eventApi.updateEvent(event.id, { isPublished: !event.isPublished });
    setBusy(false);
    if (!response.success) {
      toast.error(response.message || "Failed to update event");
      return;
    }
    setEvent(response.event ?? { ...event, isPublished: !event.isPublished });
    toast.success(event.isPublished ? "Event unpublished" : "Event published");
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setBusy(true);
    const response = await eventApi.deleteEvent(event.id);
    setBusy(false);
    if (!response.success) {
      toast.error(response.message || "Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    router.push("/dashboard/events");
  };

  if (isUserLoading || loading) return <LoadingState label="Loading event..." />;

  if (error || !event) {
    return (
      <ErrorState
        message={error ?? "Event not found"}
        onRetry={() => void load()}
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/events">Back to events</Link>
          </Button>
        }
      />
    );
  }

  const isOrganizer = !!user && (event.organizerId === user.id || user.role === "admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/events" aria-label="Back to events">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">Event Management Dashboard</p>
          </div>
        </div>
        {isOrganizer && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void togglePublished()} disabled={busy}>
              {event.isPublished ? (
                <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {event.isPublished ? "Unpublish" : "Publish"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => exportAttendees(event, attendees)}
                  disabled={attendees.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Export Attendees
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push(`/events/${event.id}`)}>
                  <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                  View Public Page
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => void handleDelete()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 p-6 text-sm text-muted-foreground md:flex-row md:items-center md:gap-6">
          <EventTypeBadge type={event.eventType} />
          <span>{formatDateTime(event.startDateTime)}</span>
          <span>{getEventLocation(event)}</span>
          {event.isPublished === false && <Badge variant="outline">Draft</Badge>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.currentAttendees ?? counts.registered}</div>
            <p className="text-xs text-muted-foreground">
              {event.maxAttendees ? `of ${event.maxAttendees} max capacity` : "No capacity limit"}
            </p>
            {event.maxAttendees ? (
              <Progress
                value={getCapacityPercent(event)}
                className="mt-2"
                aria-label="Capacity used"
              />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.waitlisted}</div>
            <p className="text-xs text-muted-foreground">people waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.attended}</div>
            <p className="text-xs text-muted-foreground">attendees checked in</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendee Management</CardTitle>
          <CardDescription>Search attendees and check them in at the event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendeesError ? (
            <p className="text-sm text-destructive" role="alert">
              {attendeesError}
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Search by name or email..."
                    aria-label="Search attendees"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value as StatusFilter)}
                >
                  <SelectTrigger className="w-full md:w-48" aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="REGISTERED">Registered</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlist</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="ATTENDED">Attended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredAttendees.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {attendees.length === 0 ? "No one has registered yet." : "No attendees match."}
                </p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {filteredAttendees.map((attendee) => (
                    <li
                      key={attendee.id}
                      className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(attendee.userName || attendee.userEmail)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {attendee.userName || attendee.userEmail}
                          </p>
                          <p className="break-words text-sm text-muted-foreground">
                            {attendee.userEmail} • Registered {formatDate(attendee.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge attendee={attendee} />
                        {isOrganizer &&
                          attendee.status === "REGISTERED" &&
                          !attendee.hasAttended && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleMarkAttendance(attendee)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                              Check in
                            </Button>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
