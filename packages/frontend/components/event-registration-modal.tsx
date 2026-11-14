"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { getEventLocation, getSpotsLeft } from "@/lib/event-helpers";
import { formatDateTime } from "@/lib/format";
import type { TechEvent } from "@/lib/types";

export interface EventRegistrationData {
  userName: string;
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Should resolve on success and throw (or reject) with an Error on failure. */
  onSubmit: (data: EventRegistrationData) => Promise<void>;
  event: TechEvent;
}

/**
 * Confirms a registration for an event. The event service takes the user's id
 * and email from the auth token; only the display name is sent.
 */
export function EventRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  event,
}: EventRegistrationModalProps) {
  const { user } = useAuth();
  const [userName, setUserName] = useState(user?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserName(user?.name ?? "");
      setError(null);
    }
  }, [isOpen, user?.name]);

  const spotsLeft = getSpotsLeft(event);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ userName: userName.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>Confirm your registration details below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{formatDateTime(event.startDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{getEventLocation(event)}</span>
            </div>
            {spotsLeft !== null && <p>{spotsLeft} spots left</p>}
          </div>

          {user ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="registration-name">Name</Label>
                <Input
                  id="registration-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration-email">Email</Label>
                <Input id="registration-email" value={user.email} disabled readOnly />
              </div>
            </>
          ) : (
            <p className="text-sm">You need to sign in before registering for events.</p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user || spotsLeft === 0}>
              {isSubmitting ? "Registering..." : spotsLeft === 0 ? "Event full" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
