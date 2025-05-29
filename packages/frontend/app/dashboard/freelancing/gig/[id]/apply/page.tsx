"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, DollarSign, Calendar, Clock, Star, Paperclip, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ApplyToGigPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [proposal, setProposal] = useState({
    coverLetter: "",
    proposedRate: "",
    estimatedDuration: "",
    deliveryDate: "",
    questions: "",
  })

  // Mock gig data
  const gig = {
    id: params.id,
    title: "Build a React Native E-commerce App",
    description:
      "Looking for an experienced React Native developer to build a full-featured e-commerce mobile application with payment integration and admin panel.",
    budget: "$2,500 - $4,000",
    duration: "2-3 months",
    skills: ["React Native", "Node.js", "MongoDB", "Stripe"],
    client: {
      name: "TechCorp Inc.",
      avatar: "TC",
      rating: 4.8,
      reviews: 127,
      jobsPosted: 45,
      hireRate: 85,
    },
    postedDate: "3 days ago",
    proposals: 12,
  }

  const handleInputChange = (field: string, value: string) => {
    setProposal((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/freelancing?tab=proposals")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/freelancing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Submit Proposal</h1>
          <p className="text-muted-foreground">Apply for this gig with your best proposal</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Proposal Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Proposal</CardTitle>
                <CardDescription>Write a compelling proposal to win this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Introduce yourself and explain why you're the perfect fit for this project..."
                    value={proposal.coverLetter}
                    onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{proposal.coverLetter.length}/1000 characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposedRate">Your Rate *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="proposedRate"
                        type="number"
                        placeholder="3200"
                        value={proposal.proposedRate}
                        onChange={(e) => handleInputChange("proposedRate", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
                    <Select
                      value={proposal.estimatedDuration}
                      onValueChange={(value) => handleInputChange("estimatedDuration", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">1 week</SelectItem>
                        <SelectItem value="2-weeks">2 weeks</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                        <SelectItem value="2-months">2 months</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                        <SelectItem value="6-months">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={proposal.deliveryDate}
                    onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questions">Questions for Client</Label>
                  <Textarea
                    id="questions"
                    placeholder="Any questions about the project requirements or clarifications needed..."
                    value={proposal.questions}
                    onChange={(e) => handleInputChange("questions", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>Add relevant portfolio items or documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Supported formats: PDF, DOC, PNG, JPG (Max 10MB)</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/freelancing">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Gig Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{gig.title}</CardTitle>
              <CardDescription>Posted {gig.postedDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{gig.description}</p>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{gig.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{gig.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{gig.proposals} proposals submitted</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {gig.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>{gig.client.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{gig.client.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">
                      {gig.client.rating} ({gig.client.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jobs Posted:</span>
                  <span className="font-medium">{gig.client.jobsPosted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hire Rate:</span>
                  <span className="font-medium">{gig.client.hireRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Personalize your proposal to the specific project</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Highlight relevant experience and skills</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Ask thoughtful questions about the project</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p>Include portfolio samples if relevant</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
