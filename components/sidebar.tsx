"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Home, Users, MessageCircle, Code2, FileText, Video, User, LogOut, Bell, Settings } from "lucide-react"

interface SidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function Sidebar({ activeSection = "feed", onSectionChange }: SidebarProps) {
  const { user, signOut } = useAuth()
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)

  useEffect(() => {
    if (user) {
      // Load user-specific connections count
      const userConnections = JSON.parse(localStorage.getItem(`devconnect_connections_${user.id}`) || "[]")
      setConnectionsCount(userConnections.length)

      // Load user-specific posts count
      const allPosts = JSON.parse(localStorage.getItem(`devconnect_posts_${user.id}`) || "[]")
      setPostsCount(allPosts.length)

      // Listen for connections updates
      const handleConnectionsUpdate = (event: CustomEvent) => {
        setConnectionsCount(event.detail.count)
      }

      // Listen for posts updates
      const handlePostsUpdate = (event: CustomEvent) => {
        setPostsCount(event.detail.count)
      }

      window.addEventListener("connectionsUpdated", handleConnectionsUpdate as EventListener)
      window.addEventListener("postsUpdated", handlePostsUpdate as EventListener)

      return () => {
        window.removeEventListener("connectionsUpdated", handleConnectionsUpdate as EventListener)
        window.removeEventListener("postsUpdated", handlePostsUpdate as EventListener)
      }
    }
  }, [user])

  const menuItems = [
    { id: "feed", label: "Feed", icon: Home, count: postsCount },
    { id: "network", label: "Network", icon: Users, count: connectionsCount },
    { id: "messages", label: "Messages", icon: MessageCircle, count: 0 },
    { id: "code", label: "Code", icon: Code2, count: 0 },
    { id: "resume", label: "Resume", icon: FileText, count: 0 },
    { id: "meetings", label: "Meetings", icon: Video, count: 0 },
    { id: "profile", label: "Profile", icon: User, count: 0 },
  ]

  const handleSectionChange = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId)
    }
    // Also dispatch a custom event for components that need it
    window.dispatchEvent(new CustomEvent("sectionChange", { detail: sectionId }))
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DevConnect</h1>
            <p className="text-xs text-gray-400">Professional Network</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-blue-600 text-white">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start text-left ${
                activeSection === item.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{item.count}</span>
              )}
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
          <Bell className="h-5 w-5 mr-3" />
          Notifications
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
