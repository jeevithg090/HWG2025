import { Calendar, Code, Coffee, Trophy, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS, normalizeEventType } from "@/lib/event-helpers";
import type { EventType } from "@/lib/types";

const BADGE_VARIANTS: Record<EventType, "default" | "secondary" | "outline"> = {
  HACKATHON: "default",
  WORKSHOP: "secondary",
  WEBINAR: "outline",
  CONFERENCE: "default",
  MEETUP: "secondary",
  OTHER: "outline",
};

export function EventTypeIcon({
  type,
  className = "h-4 w-4",
}: {
  type: string;
  className?: string;
}) {
  const props = { className, "aria-hidden": true } as const;
  switch (normalizeEventType(type)) {
    case "HACKATHON":
      return <Trophy {...props} />;
    case "WORKSHOP":
      return <Code {...props} />;
    case "WEBINAR":
      return <Video {...props} />;
    case "CONFERENCE":
      return <Users {...props} />;
    case "MEETUP":
      return <Coffee {...props} />;
    default:
      return <Calendar {...props} />;
  }
}

export function EventTypeBadge({ type }: { type: string }) {
  const normalized = normalizeEventType(type);
  return <Badge variant={BADGE_VARIANTS[normalized]}>{EVENT_TYPE_LABELS[normalized]}</Badge>;
}
