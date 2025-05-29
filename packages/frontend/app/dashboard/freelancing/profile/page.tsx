"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Star, MapPin, DollarSign, Edit, Plus, X, Camera, Briefcase } from "lucide-react"
import { useState } from "react"

export default function FreelancerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [skills, setSkills] = useState(["React", "Node.js", "TypeScript", "MongoDB", "AWS"])
  const [newSkill, setNewSkill] = useState("")
  const [profile, setProfile] = useState({
    name: "John Doe",
    title: "Full-Stack Developer",
    location: "San Francisco, CA",
    hourlyRate: "75",
    bio: "Experienced full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.",
    experience: "5+ years",
    languages: ["English (Native)", "Spanish (Conversational)"],
  })

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const reviews = [
    {
      id: 1,
      client: "Sarah Johnson",
      avatar: "SJ",
      rating: 5,
      project: "E-commerce Website",
      review:
        "Excellent work! John delivered exactly what we needed on time and within budget. Great communication throughout the project.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      client: "Mike Chen",
      avatar: "MC",
      rating: 5,
      project: "Mobile App Development",
      review:
        "Outstanding developer. Very professional and skilled. The app works perfectly and the code quality is top-notch.",
      date: "1 month ago",
    },
    {
      id: 3,
      client: "Emily Davis",
      avatar: "ED",
      rating: 4,
      project: "API Integration",
      review: "Good work on the API integration. Delivered on time and was responsive to feedback.",
      date: "2 months ago",
    },
  ]

  const portfolio = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React and Node.js",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    },
    {
      id: 2,
      title: "Task Management App",
      description: "Real-time collaborative task management application",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "Socket.io", "Express", "PostgreSQL"],
    },
    {
      id: 3,
      title: "Analytics Dashboard",
      description: "Data visualization dashboard for business metrics",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "D3.js", "Python", "FastAPI"],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your freelancer profile and showcase your skills</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={profile.name}
                      onChange={(e) => handleProfileUpdate("name", e.target.value)}
                      placeholder="Full Name"
                    />
                    <Input
                      value={profile.title}
                      onChange={(e) => handleProfileUpdate("title", e.target.value)}
                      placeholder="Professional Title"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.title}</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9</span>
                  <span className="text-muted-foreground">(47 reviews)</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        value={profile.location}
                        onChange={(e) => handleProfileUpdate("location", e.target.value)}
                        placeholder="Location"
                        className="h-8"
                      />
                    ) : (
                      <span>{profile.location}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={profile.hourlyRate}
                          onChange={(e) => handleProfileUpdate("hourlyRate", e.target.value)}
                          placeholder="Rate"
                          className="h-8 w-16"
                        />
                        <span>/hour</span>
                      </div>
                    ) : (
                      <span>${profile.hourlyRate}/hour</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>✅ Basic Info</span>
                  <span className="text-green-600">Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>✅ Skills & Experience</span>
                  <span className="text-green-600">Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>⚠️ Portfolio</span>
                  <span className="text-orange-600">3/5 items</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>❌ Certifications</span>
                  <span className="text-red-600">Missing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">47</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-xs text-muted-foreground">Repeat Clients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                      placeholder="Tell clients about your experience and expertise..."
                      rows={6}
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Showcase your technical expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button onClick={addSkill} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <h4 className="font-medium">Senior Full-Stack Developer</h4>
                        <p className="text-sm text-muted-foreground">TechCorp Inc. • 2021 - Present</p>
                        <p className="text-sm mt-1">
                          Leading development of scalable web applications using React and Node.js
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <h4 className="font-medium">Frontend Developer</h4>
                        <p className="text-sm text-muted-foreground">StartupXYZ • 2019 - 2021</p>
                        <p className="text-sm mt-1">Built responsive web applications and improved user experience</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Portfolio Projects</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Client Reviews</h3>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9 average</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          <AvatarFallback>{review.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.client}</p>
                              <p className="text-sm text-muted-foreground">{review.project}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">{review.date}</span>
                            </div>
                          </div>
                          <p className="text-sm">{review.review}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your profile visibility and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Public - Visible to all clients</option>
                      <option>Private - Only visible to invited clients</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability Status</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Available for new projects</option>
                      <option>Busy - Limited availability</option>
                      <option>Not available</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>New project invitations</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Proposal updates</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Client messages</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
        </div>
      )}
    </div>
  )
}
