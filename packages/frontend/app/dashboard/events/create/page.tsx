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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, X, Calendar, MapPin, Users, DollarSign, Video, Upload, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { eventApi } from "@/lib/api-client"

export default function CreateEventPage() {
  const router = useRouter()
  const [speakers, setSpeakers] = useState<string[]>([])
  const [newSpeaker, setNewSpeaker] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "UTC-8",
    isOnline: true,
    venue: "",
    address: "",
    onlineLink: "",
    maxAttendees: "",
    registrationRequired: true,
    registrationDeadline: "",
    isPaid: false,
    ticketPrice: "",
    currency: "USD",
    agenda: "",
    requirements: "",
    isPublic: true,
    allowWaitlist: true,
    sendReminders: true,
    recordSession: false,
  })

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpeaker = () => {
    if (newSpeaker.trim() && !speakers.includes(newSpeaker.trim())) {
      setSpeakers([...speakers, newSpeaker.trim()])
      setNewSpeaker("")
    }
  }

  const removeSpeaker = (speakerToRemove: string) => {
    setSpeakers(speakers.filter((speaker) => speaker !== speakerToRemove))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get auth token - for now using mock
      const token = "mock-token" // This should come from auth context
      
      // Prepare event data for the backend API
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDateTime: new Date(`${formData.startDate}T${formData.startTime}`),
        endDateTime: new Date(`${formData.endDate}T${formData.endTime}`),
        eventType: formData.eventType,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        organizerId: "mock-organizer-id", // This should come from auth context
        venue: formData.isOnline ? undefined : formData.venue,
        onlineLink: formData.isOnline ? formData.onlineLink : undefined,
        tags: tags,
        isActive: true,
        isPublished: formData.isPublic,
      }

      console.log("Creating event:", eventData)
      
      // Call the actual API
      const response = await eventApi.createEvent(eventData, token)
      
      if (response.success) {
        router.push("/dashboard/events?tab=hosting")
      } else {
        throw new Error("Failed to create event")
      }
    } catch (error) {
      console.error("Failed to create event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">Organize your next tech event and build community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Provide basic information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI Innovation Hackathon 2024"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hackathon">🏆 Hackathon</SelectItem>
                        <SelectItem value="meetup">🤝 Meetup</SelectItem>
                        <SelectItem value="webinar">💻 Webinar</SelectItem>
                        <SelectItem value="conference">🎤 Conference</SelectItem>
                        <SelectItem value="workshop">🛠️ Workshop</SelectItem>
                        <SelectItem value="networking">🌐 Networking</SelectItem>
                        <SelectItem value="bootcamp">📚 Bootcamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="mobile-development">Mobile Development</SelectItem>
                        <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="devops">DevOps & Cloud</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                        <SelectItem value="startup">Startup & Entrepreneurship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event, what attendees will learn, and what to expect..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (e.g., React, AI, Startup)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
                <CardDescription>Set when your event will take place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">UTC (GMT)</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                      <SelectItem value="UTC+8">China Standard Time (UTC+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Venue</CardTitle>
                <CardDescription>Specify where your event will take place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isOnline"
                    checked={formData.isOnline}
                    onCheckedChange={(checked) => handleInputChange("isOnline", checked)}
                  />
                  <Label htmlFor="isOnline">This is an online event</Label>
                </div>

                {formData.isOnline ? (
                  <div className="space-y-2">
                    <Label htmlFor="onlineLink">Meeting Link *</Label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="onlineLink"
                        placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-def-ghi"
                        value={formData.onlineLink}
                        onChange={(e) => handleInputChange("onlineLink", e.target.value)}
                        className="pl-10"
                        required={formData.isOnline}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue Name *</Label>
                      <Input
                        id="venue"
                        placeholder="e.g., TechHub Conference Center"
                        value={formData.venue}
                        onChange={(e) => handleInputChange("venue", e.target.value)}
                        required={!formData.isOnline}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="123 Tech Street, San Francisco, CA 94105"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="pl-10"
                          required={!formData.isOnline}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Registration & Pricing</CardTitle>
                <CardDescription>Configure registration settings and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="registrationRequired"
                    checked={formData.registrationRequired}
                    onCheckedChange={(checked) => handleInputChange("registrationRequired", checked)}
                  />
                  <Label htmlFor="registrationRequired">Registration required</Label>
                </div>

                {formData.registrationRequired && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="maxAttendees"
                            type="number"
                            placeholder="100"
                            value={formData.maxAttendees}
                            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          type="date"
                          value={formData.registrationDeadline}
                          onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPaid"
                          checked={formData.isPaid}
                          onCheckedChange={(checked) => handleInputChange("isPaid", checked)}
                        />
                        <Label htmlFor="isPaid">This is a paid event</Label>
                      </div>

                      {formData.isPaid && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ticketPrice">Ticket Price *</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="ticketPrice"
                                type="number"
                                placeholder="50"
                                value={formData.ticketPrice}
                                onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                                className="pl-10"
                                required={formData.isPaid}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                              value={formData.currency}
                              onValueChange={(value) => handleInputChange("currency", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="CAD">CAD (C$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowWaitlist"
                        checked={formData.allowWaitlist}
                        onCheckedChange={(checked) => handleInputChange("allowWaitlist", checked as boolean)}
                      />
                      <Label htmlFor="allowWaitlist">Allow waitlist when event is full</Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Provide more information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Speakers & Presenters</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add speaker name"
                      value={newSpeaker}
                      onChange={(e) => setNewSpeaker(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpeaker())}
                    />
                    <Button type="button" onClick={addSpeaker} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {speakers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {speakers.map((speaker) => (
                        <Badge key={speaker} variant="outline" className="gap-1">
                          {speaker}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSpeaker(speaker)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda">Agenda / Schedule</Label>
                  <Textarea
                    id="agenda"
                    placeholder="Outline the event schedule, sessions, and activities..."
                    value={formData.agenda}
                    onChange={(e) => handleInputChange("agenda", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements / Prerequisites</Label>
                  <Textarea
                    id="requirements"
                    placeholder="What should attendees bring or know beforehand..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange("isPublic", checked as boolean)}
                    />
                    <Label htmlFor="isPublic">Make this event public (visible to everyone)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendReminders"
                      checked={formData.sendReminders}
                      onCheckedChange={(checked) => handleInputChange("sendReminders", checked as boolean)}
                    />
                    <Label htmlFor="sendReminders">Send email reminders to attendees</Label>
                  </div>

                  {formData.isOnline && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recordSession"
                        checked={formData.recordSession}
                        onCheckedChange={(checked) => handleInputChange("recordSession", checked as boolean)}
                      />
                      <Label htmlFor="recordSession">Record session for later viewing</Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Event Preview
                </CardTitle>
                <CardDescription>How your event will appear to attendees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{formData.title || "Event Title"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {formData.eventType && (
                      <Badge variant="secondary">
                        {formData.eventType === "hackathon" && "🏆 Hackathon"}
                        {formData.eventType === "meetup" && "🤝 Meetup"}
                        {formData.eventType === "webinar" && "💻 Webinar"}
                        {formData.eventType === "conference" && "🎤 Conference"}
                        {formData.eventType === "workshop" && "🛠️ Workshop"}
                        {formData.eventType === "networking" && "🌐 Networking"}
                        {formData.eventType === "bootcamp" && "📚 Bootcamp"}
                      </Badge>
                    )}
                    {formData.isPaid && (
                      <Badge variant="outline">{formData.ticketPrice ? `$${formData.ticketPrice}` : "Paid"}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.description
                      ? formData.description.substring(0, 150) + "..."
                      : "Event description will appear here..."}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formData.startDate && formData.startTime
                        ? `${formData.startDate} at ${formData.startTime}`
                        : "Date & time not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.isOnline ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{formData.isOnline ? "Online Event" : formData.venue || "Venue not set"}</span>
                  </div>
                  {formData.maxAttendees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Max {formData.maxAttendees} attendees</span>
                    </div>
                  )}
                </div>

                {tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {speakers.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Speakers:</p>
                      <div className="space-y-1">
                        {speakers.map((speaker) => (
                          <p key={speaker} className="text-sm text-muted-foreground">
                            • {speaker}
                          </p>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Image</CardTitle>
                <CardDescription>Upload a cover image for your event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload event cover image</p>
                  <Button variant="outline" size="sm">
                    Choose Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Recommended: 1200x630px, JPG or PNG</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Write a compelling description</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Set clear expectations and agenda</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <p>Include relevant tags for discovery</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p>Test your online links beforehand</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/events">Cancel</Link>
          </Button>
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Publishing..." : "Publish Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
