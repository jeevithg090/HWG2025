'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Briefcase, Calendar, MessageCircle, DollarSign, Users, Star, ArrowUpRight, Plus } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { freelanceApi, eventApi } from "@/lib/api-client"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define types for our data
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  category: string;
}

interface Event {
  id: string;
  title: string;
  eventType: string;
  startDateTime: string;
  currentAttendees: number;
  maxAttendees?: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    activeGigs: 0,
    upcomingEvents: 0,
    messages: 0,
    earnings: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);
  
  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          // Fetch events
          const eventsResponse = await eventApi.getAllEvents({ isActive: true }, token);
          if (eventsResponse.success) {
            setEvents(eventsResponse.events.slice(0, 3));
            setStats(prev => ({ ...prev, upcomingEvents: eventsResponse.events.length }));
          }
          
          // Fetch projects
          const projectsResponse = await freelanceApi.getProjects({}, token);
          if (projectsResponse.success) {
            setProjects(projectsResponse.data.slice(0, 3));
            setStats(prev => ({ 
              ...prev, 
              activeGigs: projectsResponse.data.filter((p: any) => p.status === 'open').length 
            }));
          }
          
          // Set mock data for other stats
          setStats(prev => ({
            ...prev,
            messages: 5,
            earnings: 1250
          }));
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [token]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/freelance/create">
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.activeGigs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">3</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.messages}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-600">2</span> require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loading ? '-' : stats.earnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your most recent gigs and applications
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/freelance">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
            ) : projects.length > 0 ? (
              <div className="space-y-8">
                {projects.map((project, i) => (
                  <div key={project.id || i} className="flex items-start space-x-4">
                    <div>
                      <div className="rounded w-12 h-12 flex items-center justify-center bg-primary/10 text-primary">
                        <Briefcase className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium leading-none">{project.title}</p>
                        <Badge>{project.status || 'Open'}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>${project.budgetMin} - ${project.budgetMax}</span>
                        <span className="mx-2">•</span>
                        <span>{project.category || 'Development'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active projects found</p>
                <Button asChild>
                  <Link href="/freelance">Find Projects</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you've registered for</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : events.length > 0 ? (
              <div className="space-y-6">
                {events.map((event, i) => (
                  <div key={event.id || i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{event.title}</div>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(event.startDateTime).toLocaleDateString()}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{event.currentAttendees}/{event.maxAttendees || '∞'} registered</span>
                    </div>
                  </div>
                ))}
                <Button size="sm" className="w-full" variant="outline" asChild>
                  <Link href="/events">View All Events</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming events</p>
                <Button size="sm" asChild>
                  <Link href="/events">Find Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
