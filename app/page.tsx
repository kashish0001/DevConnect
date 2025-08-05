"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Feed } from "@/components/feed"
import { Profile } from "@/components/profile"
import { Messages } from "@/components/messages"
import { CodeSection } from "@/components/code-section"
import { ResumeBuilder } from "@/components/resume-builder"
import { Network } from "@/components/network"
import { Meetings } from "@/components/meetings"
import { AuthModal } from "@/components/auth-modal"
import { AuthProvider, useAuth } from "@/hooks/use-auth"

function AppContent() {
  const { user, showAuthModal, setShowAuthModal } = useAuth()
  const [activeSection, setActiveSection] = useState("feed")

  const renderSection = () => {
    switch (activeSection) {
      case "feed":
        return <Feed />
      case "profile":
        return <Profile />
      case "messages":
        return <Messages />
      case "code":
        return <CodeSection />
      case "resume":
        return <ResumeBuilder />
      case "network":
        return <Network />
      case "meetings":
        return <Meetings />
      default:
        return <Feed />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {user && (
        <>
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="ml-64">
            <Header />
            <main className="min-h-screen">{renderSection()}</main>
          </div>
        </>
      )}

      {!user && !showAuthModal && (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
