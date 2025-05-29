'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Clock, Users, Tag } from "lucide-react";
import { Header } from "@/components/header";
import { eventApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { EventRegistrationModal } from '@/components/event-registration-modal';

export default function EventsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  useEffect(() => {
    loadEvents();
  }, [activeFilter, eventTypeFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(activeFilter !== 'all' && { isActive: activeFilter === 'active' }),
        ...(eventTypeFilter && { eventType: eventTypeFilter })
      };
      
      const response = await eventApi.getAllEvents(filters);
      if (response.success) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      if (!token) {
        router.push('/auth');
        return;
      }

      await eventApi.registerForEvent(selectedEvent.id, formData, token);
      setIsRegistrationModalOpen(false);
      loadEvents(); // Reload events to update attendance count
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
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

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover tech meetups, workshops, hackathons, and conferences.
          </p>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search events..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button 
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={activeFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('active')}
              >
                Active
              </Button>
              <Button 
                variant={eventTypeFilter === 'MEETUP' ? 'default' : 'outline'} 
                onClick={() => setEventTypeFilter(eventTypeFilter === 'MEETUP' ? '' : 'MEETUP')}
              >
                Meetups
              </Button>
              <Button 
                variant={eventTypeFilter === 'HACKATHON' ? 'default' : 'outline'}
                onClick={() => setEventTypeFilter(eventTypeFilter === 'HACKATHON' ? '' : 'HACKATHON')}
              >
                Hackathons
              </Button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.coverImage && (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge variant={event.eventType === 'MEETUP' ? 'default' : event.eventType === 'HACKATHON' ? 'destructive' : 'secondary'}>
                      {event.eventType}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(event.startDateTime)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatTime(event.startDateTime)}
                    </div>
                    {event.venue && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.venue}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {event.currentAttendees}/{event.maxAttendees || '∞'} attendees
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4" />
                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
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
                    disabled={event.maxAttendees && event.currentAttendees >= event.maxAttendees}
                  >
                    {event.maxAttendees && event.currentAttendees >= event.maxAttendees ? 
                      'Event Full' : 'Register Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {selectedEvent && (
        <EventRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSubmit={handleRegistrationSubmit}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
