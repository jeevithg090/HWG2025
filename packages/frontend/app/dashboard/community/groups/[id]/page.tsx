"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Users,
  Settings,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Search,
  MoreVertical,
  BellOff,
  VolumeX,
  Pin,
  Lock,
  Globe,
  Edit,
  Trash,
  Copy,
  Share,
  Download,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function GroupManagementPage({ params }: { params: { id: string } }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [groupSettings, setGroupSettings] = useState({
    name: "Frontend Developers",
    description: "Discussion about frontend technologies and best practices",
    type: "public" as "public" | "private",
    allowMemberInvites: true,
    requireApproval: false,
    allowFileUploads: true,
    allowLinks: true,
    slowMode: false,
    slowModeDelay: 5,
    notifications: true,
    mentionEveryone: false,
  })

  // Mock group data
  const group = {
    id: params.id,
    name: "Frontend Developers",
    description: "Discussion about frontend technologies and best practices",
    type: "public" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    memberCount: 1247,
    onlineCount: 89,
    createdAt: new Date("2023-01-15"),
    category: "Development",
    tags: ["React", "Vue", "Angular", "JavaScript", "CSS"],
  }

  const members = [
    {
      id: "1",
      name: "Alice Johnson",
      avatar: "AJ",
      role: "admin",
      status: "online",
      joinedAt: new Date("2023-01-15"),
      lastActive: new Date(),
      messageCount: 1247,
    },
    {
      id: "2",
      name: "Bob Smith",
      avatar: "BS",
      role: "moderator",
      status: "away",
      joinedAt: new Date("2023-02-01"),
      lastActive: new Date(Date.now() - 3600000),
      messageCount: 856,
    },
    {
      id: "3",
      name: "Carol Davis",
      avatar: "CD",
      role: "member",
      status: "online",
      joinedAt: new Date("2023-02-15"),
      lastActive: new Date(),
      messageCount: 423,
    },
    {
      id: "4",
      name: "David Wilson",
      avatar: "DW",
      role: "member",
      status: "offline",
      joinedAt: new Date("2023-03-01"),
      lastActive: new Date(Date.now() - 86400000),
      messageCount: 234,
    },
    {
      id: "5",
      name: "Emily Brown",
      avatar: "EB",
      role: "member",
      status: "online",
      joinedAt: new Date("2023-03-10"),
      lastActive: new Date(),
      messageCount: 156,
    },
  ]

  const pinnedMessages = [
    {
      id: "1",
      content: "Welcome to the Frontend Developers group! Please read our guidelines before posting.",
      author: "Alice Johnson",
      timestamp: new Date("2023-01-15"),
      type: "announcement",
    },
    {
      id: "2",
      content: "Weekly Frontend News: React 18.3 released with new features!",
      author: "Bob Smith",
      timestamp: new Date("2023-11-01"),
      type: "news",
    },
    {
      id: "3",
      content: "Don't forget about our virtual meetup this Friday at 3 PM PST",
      author: "Alice Johnson",
      timestamp: new Date("2023-11-15"),
      type: "event",
    },
  ]

  const recentActivity = [
    {
      id: "1",
      type: "member_joined",
      user: "Emily Brown",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      type: "message_pinned",
      user: "Alice Johnson",
      content: "Weekly Frontend News",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "3",
      type: "member_promoted",
      user: "Bob Smith",
      role: "moderator",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "4",
      type: "settings_changed",
      user: "Alice Johnson",
      change: "Enabled slow mode",
      timestamp: new Date(Date.now() - 172800000),
    },
  ]

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </Badge>
        )
      default:
        return <Badge variant="secondary">Member</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setGroupSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/community">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">Group Management & Settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Share className="h-4 w-4" />
            Share Group
          </Button>
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Group Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.onlineCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((group.onlineCount / group.memberCount) * 100)}% of members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-600">+15%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - group.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))}mo
            </div>
            <p className="text-xs text-muted-foreground">Created {group.createdAt.toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Member Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Member Management</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export List
                  </Button>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Members
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg?height=48&width=48" />
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                        ></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {getRoleBadge(member.role)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Joined {member.joinedAt.toLocaleDateString()}</span>
                          <span>{member.messageCount} messages</span>
                          <span>Last active {member.lastActive.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Crown className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BellOff className="h-4 w-4 mr-2" />
                          Mute Member
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Group Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Group Information</CardTitle>
              <CardDescription>Update your group's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupSettings.name}
                  onChange={(e) => handleSettingChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={groupSettings.description}
                  onChange={(e) => handleSettingChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Privacy Setting</Label>
                <div className="flex gap-2">
                  <Button
                    variant={groupSettings.type === "public" ? "default" : "outline"}
                    onClick={() => handleSettingChange("type", "public")}
                    className="flex-1 gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Public
                  </Button>
                  <Button
                    variant={groupSettings.type === "private" ? "default" : "outline"}
                    onClick={() => handleSettingChange("type", "private")}
                    className="flex-1 gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Private
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Permissions</CardTitle>
              <CardDescription>Control what members can do in this group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow member invites</p>
                  <p className="text-sm text-muted-foreground">Let members invite others to the group</p>
                </div>
                <Switch
                  checked={groupSettings.allowMemberInvites}
                  onCheckedChange={(checked) => handleSettingChange("allowMemberInvites", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require approval for new members</p>
                  <p className="text-sm text-muted-foreground">Admins must approve new member requests</p>
                </div>
                <Switch
                  checked={groupSettings.requireApproval}
                  onCheckedChange={(checked) => handleSettingChange("requireApproval", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow file uploads</p>
                  <p className="text-sm text-muted-foreground">Members can upload files and images</p>
                </div>
                <Switch
                  checked={groupSettings.allowFileUploads}
                  onCheckedChange={(checked) => handleSettingChange("allowFileUploads", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow external links</p>
                  <p className="text-sm text-muted-foreground">Members can share external links</p>
                </div>
                <Switch
                  checked={groupSettings.allowLinks}
                  onCheckedChange={(checked) => handleSettingChange("allowLinks", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure automatic moderation features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slow mode</p>
                  <p className="text-sm text-muted-foreground">Limit how often members can send messages</p>
                </div>
                <Switch
                  checked={groupSettings.slowMode}
                  onCheckedChange={(checked) => handleSettingChange("slowMode", checked)}
                />
              </div>
              {groupSettings.slowMode && (
                <div className="space-y-2">
                  <Label htmlFor="slowModeDelay">Slow mode delay (seconds)</Label>
                  <Input
                    id="slowModeDelay"
                    type="number"
                    value={groupSettings.slowModeDelay}
                    onChange={(e) => handleSettingChange("slowModeDelay", Number.parseInt(e.target.value))}
                    min="1"
                    max="300"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow @everyone mentions</p>
                  <p className="text-sm text-muted-foreground">Members can mention all group members</p>
                </div>
                <Switch
                  checked={groupSettings.mentionEveryone}
                  onCheckedChange={(checked) => handleSettingChange("mentionEveryone", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          {/* Pinned Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pinned Messages</CardTitle>
                <Button size="sm" className="gap-2">
                  <Pin className="h-4 w-4" />
                  Pin Message
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pinnedMessages.map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={message.type === "announcement" ? "default" : "secondary"}>
                          {message.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by {message.author} • {message.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Unpin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Moderation Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Tools</CardTitle>
              <CardDescription>Quick actions for group moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2">
                  <BellOff className="h-4 w-4" />
                  Mute All
                </Button>
                <Button variant="outline" className="gap-2">
                  <VolumeX className="h-4 w-4" />
                  Disable Voice
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Message History
                </Button>
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Group Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>New members over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Member growth chart would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Activity</CardTitle>
                <CardDescription>Messages sent per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Message activity chart would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
                <CardDescription>Most active members this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-4">#{index + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{member.messageCount} messages</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Stats</CardTitle>
                <CardDescription>Group engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="text-sm font-medium">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Messages/Day</span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Member Retention</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Peak Activity Time</span>
                    <span className="text-sm font-medium">2-4 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events in the group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity.type === "member_joined" && (
                          <>
                            <span className="font-medium">{activity.user}</span> joined the group
                          </>
                        )}
                        {activity.type === "message_pinned" && (
                          <>
                            <span className="font-medium">{activity.user}</span> pinned a message: "{activity.content}"
                          </>
                        )}
                        {activity.type === "member_promoted" && (
                          <>
                            <span className="font-medium">{activity.user}</span> was promoted to {activity.role}
                          </>
                        )}
                        {activity.type === "settings_changed" && (
                          <>
                            <span className="font-medium">{activity.user}</span> {activity.change}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
