"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Clock, Users, Star, Share, ArrowLeft, CreditCard, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EventRegistrationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    experience: "",
    dietaryRestrictions: "",
    emergencyContact: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
    ticketType: "regular",
  })

  // Mock event data
  const event = {
    id: params.id,
    title: "AI Innovation Hackathon 2024",
    type: "Hackathon",
    description:
      "48-hour hackathon focused on building AI-powered solutions for social good. Join developers, designers, and entrepreneurs to create innovative solutions that can make a positive impact on society.",
    longDescription: `This intensive 48-hour hackathon brings together the brightest minds in technology to tackle some of society's most pressing challenges using artificial intelligence. 

    What you'll experience:
    • Collaborative team formation
    • Mentorship from industry experts
    • Access to cutting-edge AI tools and APIs
    • Workshops on AI ethics and responsible development
    • Networking opportunities with like-minded innovators
    • Prizes worth over $50,000

    Whether you're a seasoned developer or just starting your AI journey, this event offers something for everyone. Come ready to learn, build, and make a difference!`,
    startDate: "March 15, 2024",
    endDate: "March 17, 2024",
    startTime: "9:00 AM",
    endTime: "6:00 PM",
    timezone: "PST",
    venue: "TechHub Conference Center",
    address: "123 Tech Street, San Francisco, CA 94105",
    isOnline: false,
    maxAttendees: 500,
    registeredCount: 245,
    waitlistCount: 23,
    organizer: {
      name: "TechForGood",
      avatar: "TG",
      rating: 4.9,
      eventsHosted: 25,
    },
    ticketTypes: [
      {
        id: "regular",
        name: "Regular Ticket",
        price: 0,
        description: "Full access to all hackathon activities",
        available: 255,
      },
      {
        id: "student",
        name: "Student Ticket",
        price: 0,
        description: "For students with valid ID",
        available: 100,
      },
      {
        id: "sponsor",
        name: "Sponsor Ticket",
        price: 299,
        description: "Includes sponsor booth and networking session",
        available: 20,
      },
    ],
    tags: ["AI", "Machine Learning", "Social Good", "Innovation"],
    agenda: [
      { time: "9:00 AM", activity: "Registration & Welcome Coffee" },
      { time: "10:00 AM", activity: "Opening Ceremony & Keynote" },
      { time: "11:00 AM", activity: "Team Formation & Ideation" },
      { time: "12:00 PM", activity: "Hacking Begins!" },
      { time: "1:00 PM", activity: "Lunch & Networking" },
      { time: "6:00 PM", activity: "Day 1 Wrap-up" },
    ],
    speakers: [
      { name: "Dr. Sarah Chen", title: "AI Research Director at Google" },
      { name: "Marcus Johnson", title: "Founder of AI for Good Initiative" },
      { name: "Lisa Rodriguez", title: "VP of Engineering at OpenAI" },
    ],
    sponsors: ["Google", "Microsoft", "OpenAI", "TechCrunch"],
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push(`/events/${event.id}/confirmation`)
    }, 2000)
  }

  const selectedTicket = event.ticketTypes.find((t) => t.id === formData.ticketType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Event Registration</h1>
              <p className="text-muted-foreground">Secure your spot at this amazing event</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Please provide your details for registration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ticket Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Selection</CardTitle>
                    <CardDescription>Choose your ticket type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {event.ticketTypes.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.ticketType === ticket.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleInputChange("ticketType", ticket.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="ticketType"
                                value={ticket.id}
                                checked={formData.ticketType === ticket.id}
                                onChange={() => handleInputChange("ticketType", ticket.id)}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-medium">{ticket.name}</p>
                                <p className="text-sm text-muted-foreground">{ticket.description}</p>
                                <p className="text-xs text-muted-foreground">{ticket.available} tickets available</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{ticket.price === 0 ? "Free" : `$${ticket.price}`}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Help us make your experience better</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => handleInputChange("experience", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                      <Textarea
                        id="dietaryRestrictions"
                        placeholder="Please let us know about any dietary restrictions or allergies..."
                        value={formData.dietaryRestrictions}
                        onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Name and phone number"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="subscribeNewsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked as boolean)}
                        />
                        <Label htmlFor="subscribeNewsletter" className="text-sm">
                          Subscribe to event updates and newsletters
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={isLoading} className="px-8">
                    {isLoading
                      ? "Processing..."
                      : selectedTicket?.price === 0
                        ? "Register for Free"
                        : `Pay $${selectedTicket?.price} & Register`}
                  </Button>
                </div>
              </form>
            </div>

            {/* Event Details Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">🏆 {event.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.startDate} - {event.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.startTime} - {event.endTime} {event.timezone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{event.venue}</p>
                        <p className="text-muted-foreground">{event.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.registeredCount} registered • {event.maxAttendees - event.registeredCount} spots left
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">Event Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>{event.organizer.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.organizer.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          {event.organizer.rating} • {event.organizer.eventsHosted} events hosted
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security & Trust</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Verified event organizer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span>Full refund if event is cancelled</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    <Share className="h-4 w-4" />
                    Share with Friends
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
