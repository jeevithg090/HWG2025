'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Tag, ChevronLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { useAuth } from '@/lib/auth-context';
import { eventApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { EventRegistrationModal } from '@/components/event-registration-modal';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id);
    }
  }, [params.id]);

  const loadEvent = async (eventId) => {
    setLoading(true);
    try {
      const response = await eventApi.getEventById(eventId);
      if (response.success) {
        setEvent(response.event);
      } else {
        toast.error('Failed to load event details');
        router.push('/events');
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      toast.error('Failed to load event details');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      router.push('/auth');
      return;
    }
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await eventApi.registerForEvent(event.id, formData, token);
      if (response.success) {
        toast.success('Successfully registered for the event!');
        loadEvent(event.id); // Reload to update attendance count
      } else {
        toast.error('Registration failed');
      }
      setIsRegistrationModalOpen(false);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button onClick={() => router.push('/events')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/events')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{event.eventType}</Badge>
                {!event.isActive && <Badge variant="outline">Inactive</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h1>
              <p className="text-muted-foreground">
                Organized by {event.organizerId || 'HWG Tech Community'}
              </p>
            </div>
            
            {event.coverImage && (
              <div className="mb-6 rounded-lg overflow-hidden h-80">
                <img 
                  src={event.coverImage} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-blue max-w-none mb-8">
              <h2>About this event</h2>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Event details sidebar */}
          <div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{formatDate(event.startDateTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startDateTime)} - {event.endDateTime ? formatTime(event.endDateTime) : 'TBD'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    {event.venue ? (
                      <>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">In-person event</p>
                      </>
                    ) : event.onlineLink ? (
                      <>
                        <p className="font-medium">Online Event</p>
                        <a 
                          href={event.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          Join link <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </>
                    ) : (
                      <p className="font-medium">Location TBD</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {event.currentAttendees} / {event.maxAttendees || '∞'} attendees
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.maxAttendees && event.currentAttendees >= event.maxAttendees 
                        ? 'Event is full'
                        : 'Spots available'}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <Button 
                className="w-full" 
                size="lg"
                disabled={event.maxAttendees && event.currentAttendees >= event.maxAttendees}
                onClick={handleRegisterClick}
              >
                {event.maxAttendees && event.currentAttendees >= event.maxAttendees 
                  ? 'Event Full' 
                  : 'Register Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {event && (
        <EventRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSubmit={handleRegistrationSubmit}
          event={event}
        />
      )}
    </div>
  );
}
