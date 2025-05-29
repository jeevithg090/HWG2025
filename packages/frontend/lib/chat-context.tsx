"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// Mock WebSocket implementation for demo purposes
// In production, you'd use actual WebSocket or Socket.io
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {}
  private isConnected = false

  constructor(url: string) {
    // Simulate connection
    setTimeout(() => {
      this.isConnected = true
      this.emit("connect", {})
    }, 1000)
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }

  send(data: any) {
    // Simulate sending message
    setTimeout(() => {
      this.emit("message", data)
    }, 100)
  }

  disconnect() {
    this.isConnected = false
  }
}

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  type: "text" | "image" | "file" | "announcement"
  edited?: boolean
  reactions?: { [emoji: string]: string[] }
  replyTo?: string
  channelId?: string
  groupId?: string
}

interface ChatGroup {
  id: string
  name: string
  description?: string
  type: "public" | "private"
  avatar?: string
  members: string[]
  admins: string[]
  createdAt: Date
  lastMessage?: Message
  unreadCount: number
  category?: string
}

interface DirectMessage {
  id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
}

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  lastSeen?: Date
}

interface ChatContextType {
  // Connection
  isConnected: boolean

  // Messages
  messages: { [channelId: string]: Message[] }
  sendMessage: (content: string, channelId: string, type?: string) => void
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  addReaction: (messageId: string, emoji: string) => void

  // Groups
  groups: ChatGroup[]
  joinGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  createGroup: (name: string, description: string, type: "public" | "private") => void

  // Direct Messages
  directMessages: DirectMessage[]
  startDirectMessage: (userId: string) => string

  // Users
  users: { [id: string]: User }
  currentUser: User | null

  // Active channel
  activeChannel: string | null
  setActiveChannel: (channelId: string) => void

  // Typing indicators
  typingUsers: { [channelId: string]: string[] }
  setTyping: (channelId: string, isTyping: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<MockWebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<{ [channelId: string]: Message[] }>({})
  const [groups, setGroups] = useState<ChatGroup[]>([])
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [users, setUsers] = useState<{ [id: string]: User }>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: string[] }>({})

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new MockWebSocket("ws://localhost:3001")
    setSocket(ws)

    ws.on("connect", () => {
      setIsConnected(true)
    })

    ws.on("message", (data: any) => {
      if (data.type === "new_message") {
        setMessages((prev) => ({
          ...prev,
          [data.channelId]: [...(prev[data.channelId] || []), data.message],
        }))
      }
    })

    ws.on("user_typing", (data: any) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.channelId]: data.users,
      }))
    })

    // Initialize mock data
    initializeMockData()

    return () => {
      ws.disconnect()
    }
  }, [])

  const initializeMockData = () => {
    // Mock current user
    const mockCurrentUser: User = {
      id: "current-user",
      name: "John Doe",
      avatar: "JD",
      status: "online",
    }
    setCurrentUser(mockCurrentUser)

    // Mock users
    const mockUsers: { [id: string]: User } = {
      "current-user": mockCurrentUser,
      alice: {
        id: "alice",
        name: "Alice Johnson",
        avatar: "AJ",
        status: "online",
      },
      bob: {
        id: "bob",
        name: "Bob Smith",
        avatar: "BS",
        status: "away",
      },
      carol: {
        id: "carol",
        name: "Carol Davis",
        avatar: "CD",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000),
      },
    }
    setUsers(mockUsers)

    // Mock groups
    const mockGroups: ChatGroup[] = [
      {
        id: "general",
        name: "General Discussion",
        description: "General chat for all members",
        type: "public",
        members: ["current-user", "alice", "bob", "carol"],
        admins: ["current-user"],
        createdAt: new Date(),
        unreadCount: 5,
        category: "general",
      },
      {
        id: "frontend",
        name: "Frontend Developers",
        description: "Discussion about frontend technologies",
        type: "public",
        members: ["current-user", "alice", "bob"],
        admins: ["alice"],
        createdAt: new Date(),
        unreadCount: 2,
        category: "development",
      },
      {
        id: "private-team",
        name: "Project Alpha Team",
        description: "Private team discussion",
        type: "private",
        members: ["current-user", "alice"],
        admins: ["current-user"],
        createdAt: new Date(),
        unreadCount: 0,
        category: "projects",
      },
    ]
    setGroups(mockGroups)

    // Mock direct messages
    const mockDMs: DirectMessage[] = [
      {
        id: "dm-alice",
        participants: ["current-user", "alice"],
        unreadCount: 3,
        createdAt: new Date(),
      },
      {
        id: "dm-bob",
        participants: ["current-user", "bob"],
        unreadCount: 0,
        createdAt: new Date(),
      },
    ]
    setDirectMessages(mockDMs)

    // Mock messages
    const mockMessages: { [channelId: string]: Message[] } = {
      general: [
        {
          id: "1",
          content: "Hey everyone! Just deployed our new React app to production 🚀",
          senderId: "alice",
          senderName: "Alice Johnson",
          senderAvatar: "AJ",
          timestamp: new Date(Date.now() - 3600000),
          type: "text",
          reactions: { "🚀": ["bob", "carol"], "👏": ["current-user"] },
        },
        {
          id: "2",
          content: "Congrats Alice! How was the deployment process?",
          senderId: "bob",
          senderName: "Bob Smith",
          senderAvatar: "BS",
          timestamp: new Date(Date.now() - 3500000),
          type: "text",
        },
        {
          id: "3",
          content: "That's awesome! Would love to hear about any challenges you faced",
          senderId: "carol",
          senderName: "Carol Davis",
          senderAvatar: "CD",
          timestamp: new Date(Date.now() - 3400000),
          type: "text",
        },
      ],
      "dm-alice": [
        {
          id: "4",
          content: "Hey John, can we schedule a call to discuss the new project?",
          senderId: "alice",
          senderName: "Alice Johnson",
          senderAvatar: "AJ",
          timestamp: new Date(Date.now() - 1800000),
          type: "text",
        },
        {
          id: "5",
          content: "How about tomorrow at 2 PM?",
          senderId: "current-user",
          senderName: "John Doe",
          senderAvatar: "JD",
          timestamp: new Date(Date.now() - 1700000),
          type: "text",
        },
      ],
    }
    setMessages(mockMessages)
  }

  const sendMessage = useCallback(
    (content: string, channelId: string, type = "text") => {
      if (!currentUser || !socket) return

      const message: Message = {
        id: Date.now().toString(),
        content,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        timestamp: new Date(),
        type: type as any,
      }

      setMessages((prev) => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), message],
      }))

      // Simulate sending to server
      socket.send({
        type: "send_message",
        channelId,
        message,
      })
    },
    [currentUser, socket],
  )

  const editMessage = useCallback((messageId: string, content: string) => {
    setMessages((prev) => {
      const newMessages = { ...prev }
      Object.keys(newMessages).forEach((channelId) => {
        newMessages[channelId] = newMessages[channelId].map((msg) =>
          msg.id === messageId ? { ...msg, content, edited: true } : msg,
        )
      })
      return newMessages
    })
  }, [])

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => {
      const newMessages = { ...prev }
      Object.keys(newMessages).forEach((channelId) => {
        newMessages[channelId] = newMessages[channelId].filter((msg) => msg.id !== messageId)
      })
      return newMessages
    })
  }, [])

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!currentUser) return

      setMessages((prev) => {
        const newMessages = { ...prev }
        Object.keys(newMessages).forEach((channelId) => {
          newMessages[channelId] = newMessages[channelId].map((msg) => {
            if (msg.id === messageId) {
              const reactions = { ...msg.reactions }
              if (!reactions[emoji]) {
                reactions[emoji] = []
              }
              if (reactions[emoji].includes(currentUser.id)) {
                reactions[emoji] = reactions[emoji].filter((id) => id !== currentUser.id)
                if (reactions[emoji].length === 0) {
                  delete reactions[emoji]
                }
              } else {
                reactions[emoji].push(currentUser.id)
              }
              return { ...msg, reactions }
            }
            return msg
          })
        })
        return newMessages
      })
    },
    [currentUser],
  )

  const joinGroup = useCallback(
    (groupId: string) => {
      if (!currentUser) return

      setGroups((prev) =>
        prev.map((group) => (group.id === groupId ? { ...group, members: [...group.members, currentUser.id] } : group)),
      )
    },
    [currentUser],
  )

  const leaveGroup = useCallback(
    (groupId: string) => {
      if (!currentUser) return

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, members: group.members.filter((id) => id !== currentUser.id) } : group,
        ),
      )
    },
    [currentUser],
  )

  const createGroup = useCallback(
    (name: string, description: string, type: "public" | "private") => {
      if (!currentUser) return

      const newGroup: ChatGroup = {
        id: Date.now().toString(),
        name,
        description,
        type,
        members: [currentUser.id],
        admins: [currentUser.id],
        createdAt: new Date(),
        unreadCount: 0,
      }

      setGroups((prev) => [...prev, newGroup])
    },
    [currentUser],
  )

  const startDirectMessage = useCallback(
    (userId: string): string => {
      if (!currentUser) return ""

      const existingDM = directMessages.find(
        (dm) => dm.participants.includes(currentUser.id) && dm.participants.includes(userId),
      )

      if (existingDM) {
        return existingDM.id
      }

      const newDM: DirectMessage = {
        id: `dm-${Date.now()}`,
        participants: [currentUser.id, userId],
        unreadCount: 0,
        createdAt: new Date(),
      }

      setDirectMessages((prev) => [...prev, newDM])
      return newDM.id
    },
    [currentUser, directMessages],
  )

  const setTyping = useCallback(
    (channelId: string, isTyping: boolean) => {
      if (!currentUser || !socket) return

      socket.send({
        type: "typing",
        channelId,
        userId: currentUser.id,
        isTyping,
      })
    },
    [currentUser, socket],
  )

  const value: ChatContextType = {
    isConnected,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    groups,
    joinGroup,
    leaveGroup,
    createGroup,
    directMessages,
    startDirectMessage,
    users,
    currentUser,
    activeChannel,
    setActiveChannel,
    typingUsers,
    setTyping,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
