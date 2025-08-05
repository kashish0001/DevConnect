"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/hooks/use-auth"
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar_url?: string
    is_online: boolean
  }
  last_message: Message
  unread_count: number
}

export function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        user: {
          id: "2",
          name: "Sarah Chen",
          username: "sarahchen",
          avatar_url: "/placeholder.svg?height=40&width=40",
          is_online: true,
        },
        last_message: {
          id: "1",
          content: "Hey! I saw your React component library. Really impressive work!",
          sender_id: "2",
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          is_read: false,
        },
        unread_count: 2,
      },
      {
        id: "2",
        user: {
          id: "3",
          name: "Alex Rodriguez",
          username: "alexdev",
          avatar_url: "/placeholder.svg?height=40&width=40",
          is_online: false,
        },
        last_message: {
          id: "2",
          content: "Thanks for the code review feedback!",
          sender_id: "3",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          is_read: true,
        },
        unread_count: 0,
      },
      {
        id: "3",
        user: {
          id: "4",
          name: "Maya Patel",
          username: "mayacode",
          avatar_url: "/placeholder.svg?height=40&width=40",
          is_online: true,
        },
        last_message: {
          id: "3",
          content: "Would love to collaborate on that open source project!",
          sender_id: "4",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          is_read: false,
        },
        unread_count: 1,
      },
    ]
    setConversations(mockConversations)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hey! I saw your React component library. Really impressive work!",
          sender_id: selectedConversation.user.id,
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          is_read: true,
        },
        {
          id: "2",
          content: "Thank you! I've been working on it for a few months now. Always looking to improve it.",
          sender_id: user?.id || "",
          created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          is_read: true,
        },
        {
          id: "3",
          content: "The TypeScript definitions are really well done. Mind if I contribute?",
          sender_id: selectedConversation.user.id,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          is_read: true,
        },
      ]
      setMessages(mockMessages)
    }
  }, [selectedConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: user?.id || "",
      created_at: new Date().toISOString(),
      is_read: false,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-screen pt-16 flex">
      {/* Conversations List */}
      <div className="w-80 bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-600/20 border border-blue-600/30"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.user.avatar_url || "/placeholder.svg"}
                        alt={conversation.user.name}
                      />
                      <AvatarFallback className="bg-blue-600">
                        {conversation.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.user.is_online && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">{conversation.last_message.content}</p>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-blue-600 text-xs">{conversation.unread_count}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedConversation.user.avatar_url || "/placeholder.svg"}
                        alt={selectedConversation.user.name}
                      />
                      <AvatarFallback className="bg-blue-600">
                        {selectedConversation.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.user.is_online && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.user.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedConversation.user.is_online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${message.sender_id === user?.id ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
