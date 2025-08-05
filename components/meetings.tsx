"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Users,
  Calendar,
  Clock,
  Plus,
  Copy,
  Play,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  participants: string[]
  status: "upcoming" | "live" | "completed"
  meetingLink: string
  createdBy: string
  createdAt: string
  startedAt?: string
  endedAt?: string
  recordingUrl?: string
  notes?: string
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  avatar?: string
}

export function Meetings() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<"checking" | "granted" | "denied" | "error">("checking")
  const [permissionError, setPermissionError] = useState("")

  // Meeting controls
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [meetingDuration, setMeetingDuration] = useState(0)

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    participants: "",
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check permissions on mount
  useEffect(() => {
    checkPermissions()
  }, [])

  // Load meetings from localStorage
  useEffect(() => {
    const savedMeetings = localStorage.getItem("devconnect_meetings")
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings))
    }
  }, [])

  // Save meetings to localStorage
  const saveMeetings = (updatedMeetings: Meeting[]) => {
    setMeetings(updatedMeetings)
    localStorage.setItem("devconnect_meetings", JSON.stringify(updatedMeetings))
  }

  const checkPermissions = async () => {
    try {
      setPermissionStatus("checking")

      // Test access to media devices
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Stop the test stream immediately
      stream.getTracks().forEach((track) => track.stop())

      setPermissionStatus("granted")
      setPermissionError("")
    } catch (error: any) {
      setPermissionStatus("denied")

      if (error.name === "NotAllowedError") {
        setPermissionError("Camera and microphone access denied. Please enable permissions in your browser settings.")
      } else if (error.name === "NotFoundError") {
        setPermissionError("No camera or microphone found. Please connect your devices.")
      } else if (error.name === "NotReadableError") {
        setPermissionError("Camera or microphone is being used by another application.")
      } else {
        setPermissionError(`Permission error: ${error.message}`)
      }
    }
  }

  const createMeeting = () => {
    if (!user) return

    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      participants: formData.participants
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      status: "upcoming",
      meetingLink: `https://devconnect.meet/${Date.now()}`,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    }

    const updatedMeetings = [...meetings, newMeeting]
    saveMeetings(updatedMeetings)

    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      participants: "",
    })
    setShowCreateDialog(false)
  }

  const startMeeting = async (meeting: Meeting) => {
    if (permissionStatus !== "granted") {
      await checkPermissions()
      if (permissionStatus !== "granted") {
        return
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setActiveMeeting(meeting)
      setIsInMeeting(true)
      setMeetingDuration(0)

      // Update meeting status
      const updatedMeetings = meetings.map((m) =>
        m.id === meeting.id ? { ...m, status: "live" as const, startedAt: new Date().toISOString() } : m,
      )
      saveMeetings(updatedMeetings)

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setMeetingDuration((prev) => prev + 1)
      }, 1000)

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "System",
        message: `Welcome to ${meeting.title}! The meeting has started.`,
        timestamp: new Date().toLocaleTimeString(),
      }
      setChatMessages([welcomeMessage])
    } catch (error: any) {
      console.error("Error starting meeting:", error)
      setPermissionError(`Failed to start meeting: ${error.message}`)
      setPermissionStatus("error")
    }
  }

  const endMeeting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }

    if (activeMeeting) {
      const updatedMeetings = meetings.map((m) =>
        m.id === activeMeeting.id
          ? {
              ...m,
              status: "completed" as const,
              endedAt: new Date().toISOString(),
              recordingUrl: `https://devconnect.recordings/${m.id}`,
              notes: `Meeting completed. Duration: ${Math.floor(meetingDuration / 60)}m ${meetingDuration % 60}s`,
            }
          : m,
      )
      saveMeetings(updatedMeetings)
    }

    setIsInMeeting(false)
    setActiveMeeting(null)
    setMeetingDuration(0)
    setChatMessages([])
    setShowChat(false)
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn
        setIsAudioOn(!isAudioOn)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

        if (videoRef.current) {
          videoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)

        const message: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: "System",
          message: `${user?.name || "You"} started screen sharing`,
          timestamp: new Date().toLocaleTimeString(),
        }
        setChatMessages((prev) => [...prev, message])

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current
          }
        }
      } else {
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error("Error sharing screen:", error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: user.name,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      avatar: user.avatar_url,
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link)
    // You could add a toast notification here
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const upcomingMeetings = meetings.filter((m) => m.status === "upcoming")
  const completedMeetings = meetings.filter((m) => m.status === "completed")

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-white mb-2">Please sign in</h3>
            <p className="text-gray-400">You need to be signed in to access meetings</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isInMeeting && activeMeeting) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="h-full flex">
          {/* Main video area */}
          <div className="flex-1 relative">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />

            {/* Meeting info overlay */}
            <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3">
              <h3 className="text-white font-semibold">{activeMeeting.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(meetingDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{activeMeeting.participants.length + 1}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-4 bg-black/70 rounded-full px-6 py-3">
                <Button
                  size="sm"
                  variant={isAudioOn ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  className="rounded-full w-12 h-12"
                >
                  {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  size="sm"
                  variant={isVideoOn ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="rounded-full w-12 h-12"
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button
                  size="sm"
                  variant={isScreenSharing ? "default" : "secondary"}
                  onClick={toggleScreenShare}
                  className="rounded-full w-12 h-12"
                >
                  <Monitor className="h-5 w-5" />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowChat(!showChat)}
                  className="rounded-full w-12 h-12"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>

                <Button size="sm" variant="destructive" onClick={endMeeting} className="rounded-full w-12 h-12">
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Meeting Chat</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {message.sender.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{message.sender}</span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meetings</h1>
          <p className="text-gray-400">Schedule and manage your professional meetings</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Meeting Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter meeting title"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting description (optional)"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                  min="15"
                  max="480"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Participants (emails, comma-separated)
                </label>
                <Textarea
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={createMeeting}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!formData.title || !formData.date || !formData.time}
              >
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permission Status */}
      {permissionStatus === "denied" && (
        <Alert className="mb-6 bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {permissionError}
            <Button
              onClick={checkPermissions}
              variant="outline"
              size="sm"
              className="ml-3 border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {permissionStatus === "granted" && (
        <Alert className="mb-6 bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Camera and microphone permissions granted. You can start meetings.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600">
            <Clock className="h-4 w-4 mr-2" />
            Completed ({completedMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-blue-600">
            <Video className="h-4 w-4 mr-2" />
            Records ({completedMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No upcoming meetings</h3>
                <p className="text-gray-400">Schedule your first meeting to get started</p>
              </CardContent>
            </Card>
          ) : (
            upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{meeting.title}</h3>
                      {meeting.description && <p className="text-gray-400 mb-3">{meeting.description}</p>}

                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{meeting.participants.length + 1} participants</span>
                        </div>
                      </div>

                      {meeting.participants.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-2">Participants:</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((email, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-400">
                                {email}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMeetingLink(meeting.meetingLink)}
                        className="border-gray-700 bg-transparent hover:bg-gray-800"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => startMeeting(meeting)}
                        disabled={permissionStatus !== "granted"}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedMeetings.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No completed meetings</h3>
                <p className="text-gray-400">Your completed meetings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            completedMeetings.map((meeting) => (
              <Card key={meeting.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{meeting.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.time}</span>
                        </div>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Completed</Badge>
                      </div>
                      {meeting.notes && <p className="text-gray-400 text-sm">{meeting.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {completedMeetings.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No meeting records</h3>
                <p className="text-gray-400">Meeting recordings will appear here after completion</p>
              </CardContent>
            </Card>
          ) : (
            completedMeetings.map((meeting) => (
              <Card key={meeting.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{meeting.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{meeting.participants.length + 1} participants</span>
                        </div>
                      </div>
                      {meeting.recordingUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Video className="h-4 w-4" />
                          <span>Recording available</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {meeting.recordingUrl && (
                        <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                          <Play className="h-4 w-4 mr-2" />
                          View Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
