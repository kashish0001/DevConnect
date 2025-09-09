// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useAuth } from "@/hooks/use-auth"
// import {
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   PhoneOff,
//   Monitor,
//   Users,
//   Calendar,
//   Clock,
//   Plus,
//   Copy,
//   Play,
//   MessageSquare,
//   Send,
//   AlertCircle,
//   CheckCircle,
// } from "lucide-react"

// interface Meeting {
//   id: string
//   title: string
//   description: string
//   date: string
//   time: string
//   duration: number
//   participants: string[]
//   status: "upcoming" | "live" | "completed"
//   meetingLink: string
//   createdBy: string
//   createdAt: string
//   startedAt?: string
//   endedAt?: string
//   recordingUrl?: string
//   notes?: string
// }

// interface ChatMessage {
//   id: string
//   sender: string
//   message: string
//   timestamp: string
//   avatar?: string
// }

// export function Meetings() {
//   const { user } = useAuth()
//   const [meetings, setMeetings] = useState<Meeting[]>([])
//   const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
//   const [isInMeeting, setIsInMeeting] = useState(false)
//   const [showCreateDialog, setShowCreateDialog] = useState(false)
//   const [permissionStatus, setPermissionStatus] = useState<"checking" | "granted" | "denied" | "error">("checking")
//   const [permissionError, setPermissionError] = useState("")

//   // Meeting controls
//   const [isVideoOn, setIsVideoOn] = useState(true)
//   const [isAudioOn, setIsAudioOn] = useState(true)
//   const [isScreenSharing, setIsScreenSharing] = useState(false)
//   const [showChat, setShowChat] = useState(false)
//   const [meetingDuration, setMeetingDuration] = useState(0)

//   // Chat
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
//   const [newMessage, setNewMessage] = useState("")

//   // Form data
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     duration: 60,
//     participants: "",
//   })

//   const videoRef = useRef<HTMLVideoElement>(null)
//   const streamRef = useRef<MediaStream | null>(null)
//   const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
//   const startingMeetingsRef = useRef<Set<string>>(new Set())

//   // --- Permissions check ---
//   useEffect(() => {
//     if (typeof window !== "undefined") checkPermissions()
//   }, [])

//   const checkPermissions = async (): Promise<"granted" | "denied"> => {
//     if (typeof navigator === "undefined" || !navigator.mediaDevices) {
//       setPermissionStatus("denied")
//       setPermissionError("Media devices API not available in this browser.")
//       return "denied"
//     }

//     try {
//       setPermissionStatus("checking")
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       stream.getTracks().forEach((track) => track.stop())
//       setPermissionStatus("granted")
//       setPermissionError("")
//       return "granted"
//     } catch (error: any) {
//       setPermissionStatus("denied")
//       if (error.name === "NotAllowedError") {
//         setPermissionError("Camera and microphone access denied. Enable permissions in browser settings.")
//       } else if (error.name === "NotFoundError") {
//         setPermissionError("No camera or microphone found. Connect devices.")
//       } else if (error.name === "NotReadableError") {
//         setPermissionError("Camera or microphone being used by another application.")
//       } else {
//         setPermissionError(`Permission error: ${error.message}`)
//       }
//       return "denied"
//     }
//   }

//   // --- Load meetings ---
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("devconnect_meetings")
//       if (saved) setMeetings(JSON.parse(saved))
//     }
//   }, [])

//   const saveMeetings = (updated: Meeting[]) => {
//     setMeetings(updated)
//     localStorage.setItem("devconnect_meetings", JSON.stringify(updated))
//   }

//   const createMeeting = () => {
//     if (!user) return

//     const newMeeting: Meeting = {
//       id: `meeting-${Date.now()}`,
//       title: formData.title,
//       description: formData.description,
//       date: formData.date,
//       time: formData.time,
//       duration: formData.duration,
//       participants: formData.participants
//         .split(",")
//         .map((e) => e.trim())
//         .filter(Boolean),
//       status: "upcoming",
//       meetingLink: `https://devconnect.meet/${Date.now()}`,
//       createdBy: user.email,
//       createdAt: new Date().toISOString(),
//     }

//     saveMeetings([...meetings, newMeeting])
//     setFormData({ title: "", description: "", date: "", time: "", duration: 60, participants: "" })
//     setShowCreateDialog(false)
//   }

//   // --- Start Meeting ---
//   const startMeeting = async (meeting: Meeting) => {
//     if (typeof window === "undefined" || !navigator.mediaDevices) return
//     if (startingMeetingsRef.current.has(meeting.id)) return
//     startingMeetingsRef.current.add(meeting.id)

//     try {
//       let status = permissionStatus
//       if (status !== "granted") status = await checkPermissions()
//       if (status !== "granted") {
//         startingMeetingsRef.current.delete(meeting.id)
//         return
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       streamRef.current = stream

//       setActiveMeeting(meeting)
//       setIsInMeeting(true)
//       setMeetingDuration(0)

//       // Attach video after DOM mounts
//       setTimeout(() => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream
//           videoRef.current.play().catch((err) => console.warn("Autoplay blocked", err))
//         }
//       }, 100)

//       const updatedMeetings = meetings.map((m) =>
//         m.id === meeting.id ? { ...m, status: "live" as const, startedAt: new Date().toISOString() } : m,
//       )
//       saveMeetings(updatedMeetings)

//       if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
//       durationIntervalRef.current = setInterval(() => setMeetingDuration((prev) => prev + 1), 1000)

//       setChatMessages([
//         {
//           id: `msg-${Date.now()}`,
//           sender: "System",
//           message: `Welcome to ${meeting.title}! The meeting has started.`,
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ])
//     } catch (error: any) {
//       console.error("Start meeting failed:", error)
//       setPermissionStatus("error")
//       setPermissionError(
//         error?.message.includes("Only secure origins")
//           ? "getUserMedia requires HTTPS or localhost."
//           : `Failed to start meeting: ${error?.message || error}`,
//       )
//     } finally {
//       startingMeetingsRef.current.delete(meeting.id)
//     }
//   }

//   const endMeeting = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop())
//       streamRef.current = null
//     }
//     if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
//     durationIntervalRef.current = null

//     if (activeMeeting) {
//       const updated = meetings.map((m) =>
//         m.id === activeMeeting.id
//           ? {
//             ...m,
//             status: "completed" as const,
//             endedAt: new Date().toISOString(),
//             recordingUrl: `https://devconnect.recordings/${m.id}`,
//             notes: `Meeting completed. Duration: ${Math.floor(meetingDuration / 60)}m ${meetingDuration % 60
//               }s`,
//           }
//           : m,
//       )
//       saveMeetings(updated)
//     }

//     setIsInMeeting(false)
//     setActiveMeeting(null)
//     setMeetingDuration(0)
//     setChatMessages([])
//     setShowChat(false)
//   }

//   const toggleVideo = () => {
//     if (!streamRef.current) return
//     const videoTrack = streamRef.current.getVideoTracks()[0]
//     if (videoTrack) {
//       videoTrack.enabled = !isVideoOn
//       setIsVideoOn(!isVideoOn)
//     }
//   }

//   const toggleAudio = () => {
//     if (!streamRef.current) return
//     const audioTrack = streamRef.current.getAudioTracks()[0]
//     if (audioTrack) {
//       audioTrack.enabled = !isAudioOn
//       setIsAudioOn(!isAudioOn)
//     }
//   }

//   const toggleScreenShare = async () => {
//     try {
//       if (!isScreenSharing) {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
//         if (videoRef.current) videoRef.current.srcObject = screenStream
//         setIsScreenSharing(true)

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             id: `msg-${Date.now()}`,
//             sender: "System",
//             message: `${user?.name || "You"} started screen sharing`,
//             timestamp: new Date().toLocaleTimeString(),
//           },
//         ])

//         screenStream.getVideoTracks()[0].onended = () => {
//           setIsScreenSharing(false)
//           if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
//         }
//       } else {
//         if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
//         setIsScreenSharing(false)
//       }
//     } catch (err) {
//       console.warn("Screen share failed:", err)
//     }
//   }

//   const sendMessage = () => {
//     if (!newMessage.trim() || !activeMeeting) return
//     const msg: ChatMessage = {
//       id: `msg-${Date.now()}`,
//       sender: user?.name || "You",
//       message: newMessage,
//       timestamp: new Date().toLocaleTimeString(),
//     }
//     setChatMessages((prev) => [...prev, msg])
//     setNewMessage("")
//   }

//   // --- UI Rendering ---
//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-bold">Meetings</h2>
//         <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
//           <Plus className="h-4 w-4" />
//           <span>Create Meeting</span>
//         </Button>
//       </div>

//       {permissionStatus !== "granted" && permissionError && (
//         <Alert>
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{permissionError}</AlertDescription>
//         </Alert>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {meetings.map((m) => (
//           <Card key={m.id}>
//             <CardContent>
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">{m.title}</h3>
//                 <Badge variant={m.status === "live" ? "destructive" : "default"}>{m.status}</Badge>
//               </div>
//               <p className="text-sm text-muted-foreground">{m.description}</p>
//               <div className="mt-2 flex justify-between items-center">
//                 <span>
//                   {m.date} {m.time} | {m.duration}m
//                 </span>
//                 {m.status === "upcoming" && (
//                   <Button
//                     onClick={async () => {
//                       await startMeeting(meeting)
//                       if (videoRef.current) {
//                         videoRef.current.muted = true // autoplay safety
//                         videoRef.current.play().catch(() => {
//                           console.warn("Autoplay blocked. User gesture required to play video.")
//                         })
//                       }
//                     }}
//                     disabled={permissionStatus !== "granted"}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     <Play className="h-4 w-4 mr-2" /> Start Meeting
//                   </Button>

//                 )}
//                 {m.status === "live" && <Button onClick={endMeeting} size="sm" variant="destructive"><PhoneOff className="h-4 w-4 mr-1" /> End</Button>}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Meeting Modal */}
//       {isInMeeting && activeMeeting && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white w-full max-w-4xl p-4 rounded-lg space-y-4 relative">
//             <h3 className="font-bold text-lg">{activeMeeting.title}</h3>
//             <div className="flex space-x-4">
//               <video ref={videoRef} className="w-80 h-60 bg-black rounded" autoPlay muted />
//               <div className="flex-1 flex flex-col space-y-2">
//                 <div className="flex space-x-2">
//                   <Button onClick={toggleVideo} size="sm">{isVideoOn ? <Video /> : <VideoOff />}</Button>
//                   <Button onClick={toggleAudio} size="sm">{isAudioOn ? <Mic /> : <MicOff />}</Button>
//                   <Button onClick={toggleScreenShare} size="sm"><Monitor /></Button>
//                   <Button onClick={() => setShowChat(!showChat)} size="sm"><MessageSquare /></Button>
//                   <Button onClick={endMeeting} size="sm" variant="destructive"><PhoneOff /></Button>
//                 </div>
//                 {showChat && (
//                   <div className="flex-1 flex flex-col border rounded p-2 space-y-2 overflow-y-auto">
//                     {chatMessages.map((c) => (
//                       <div key={c.id} className="flex items-center space-x-2">
//                         <Avatar>
//                           {c.avatar ? <AvatarImage src={c.avatar} /> : <AvatarFallback>{c.sender[0]}</AvatarFallback>}
//                         </Avatar>
//                         <div>
//                           <p className="text-sm font-semibold">{c.sender}</p>
//                           <p className="text-sm">{c.message}</p>
//                         </div>
//                         <span className="text-xs text-muted-foreground ml-auto">{c.timestamp}</span>
//                       </div>
//                     ))}
//                     <div className="flex space-x-2">
//                       <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
//                       <Button onClick={sendMessage}><Send /></Button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <span className="absolute top-2 right-2 text-sm font-mono">{Math.floor(meetingDuration / 60)}:{String(meetingDuration % 60).padStart(2, "0")}</span>
//           </div>
//         </div>
//       )}

//       {/* Create Meeting Dialog */}
//       <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//         <DialogTrigger />
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Create Meeting</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-2">
//             <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
//             <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
//             <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
//             <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
//             <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} />
//             <Input placeholder="Participants (comma separated emails)" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} />
//             <Button onClick={createMeeting}>Create</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
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
  const startingMeetingsRef = useRef<Set<string>>(new Set())

  // Load meetings
  useEffect(() => {
    const saved = localStorage.getItem("devconnect_meetings")
    if (saved) setMeetings(JSON.parse(saved))
  }, [])

  const saveMeetings = (updatedMeetings: Meeting[]) => {
    setMeetings(updatedMeetings)
    localStorage.setItem("devconnect_meetings", JSON.stringify(updatedMeetings))
  }

  // Check camera/mic permissions
  const checkPermissions = async (): Promise<"granted" | "denied" | "checking"> => {
    try {
      setPermissionStatus("checking")
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionStatus("granted")
      setPermissionError("")
      return "granted"
    } catch (err: any) {
      setPermissionStatus("denied")
      if (err.name === "NotAllowedError") setPermissionError("Camera and microphone access denied.")
      else if (err.name === "NotFoundError") setPermissionError("No camera or microphone found.")
      else if (err.name === "NotReadableError") setPermissionError("Camera or mic in use by another app.")
      else setPermissionError(`Permission error: ${err.message}`)
      return "denied"
    }
  }

  useEffect(() => {
    checkPermissions()
  }, [])

  const createMeeting = () => {
    if (!user) return
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      participants: formData.participants.split(",").map((e) => e.trim()).filter(Boolean),
      status: "upcoming",
      meetingLink: `https://devconnect.meet/${Date.now()}`,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    }
    saveMeetings([...meetings, newMeeting])
    setFormData({ title: "", description: "", date: "", time: "", duration: 60, participants: "" })
    setShowCreateDialog(false)
  }

  const startMeeting = async (m: Meeting) => {
    if (startingMeetingsRef.current.has(m.id)) return
    startingMeetingsRef.current.add(m.id)

    try {
      const status = permissionStatus === "granted" ? "granted" : await checkPermissions()
      if (status !== "granted") return

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream

      setActiveMeeting(m)
      setIsInMeeting(true)
      setMeetingDuration(0)

      // Mount video after DOM ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current
          videoRef.current.muted = true
          videoRef.current.play().catch(() => console.warn("Autoplay blocked"))
        }
      }, 100)

      const updatedMeetings = meetings.map((mt) =>
        mt.id === m.id ? { ...mt, status: "live", startedAt: new Date().toISOString() } : mt,
      )
      saveMeetings(updatedMeetings)

      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = setInterval(() => setMeetingDuration((p) => p + 1), 1000)

      const welcome: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "System",
        message: `Welcome to ${m.title}! Meeting started.`,
        timestamp: new Date().toLocaleTimeString(),
      }
      setChatMessages([welcome])
    } catch (err: any) {
      console.error("Cannot start meeting:", err)
      setPermissionStatus("error")
      setPermissionError(err.message)
    } finally {
      startingMeetingsRef.current.delete(m.id)
    }
  }

  useEffect(() => {
    if (isInMeeting && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.muted = true
      videoRef.current.play().catch(() => console.warn("Autoplay blocked"))
    }
  }, [isInMeeting])

  const endMeeting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    if (activeMeeting) {
      const updatedMeetings = meetings.map((mt) =>
        mt.id === activeMeeting.id
          ? {
              ...mt,
              status: "completed",
              endedAt: new Date().toISOString(),
              recordingUrl: `https://devconnect.recordings/${mt.id}`,
              notes: `Duration: ${Math.floor(meetingDuration / 60)}m ${meetingDuration % 60}s`,
            }
          : mt,
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
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (track) {
      track.enabled = !isVideoOn
      setIsVideoOn(!isVideoOn)
    }
  }

  const toggleAudio = () => {
    if (!streamRef.current) return
    const track = streamRef.current.getAudioTracks()[0]
    if (track) {
      track.enabled = !isAudioOn
      setIsAudioOn(!isAudioOn)
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = screen
      setIsScreenSharing(true)
      return
    }
    // Stop screen sharing
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      setIsScreenSharing(false)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !activeMeeting) return
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: user?.name || "Me",
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    }
    setChatMessages([...chatMessages, msg])
    setNewMessage("")
  }

  const copyMeetingLink = (link: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => alert("Link copied!"))
    } else {
      alert("Clipboard not supported in this browser.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Create Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new meeting</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
              <Input
                placeholder="Participants (comma-separated emails)"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              />
              <Button onClick={createMeeting}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {permissionStatus === "denied" && (
        <Alert variant="destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">{m.title}</h2>
              <p>{m.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant={m.status === "live" ? "destructive" : "secondary"}>{m.status}</Badge>
                <div className="flex gap-2">
                  {m.status === "upcoming" && (
                    <Button size="sm" onClick={() => startMeeting(m)}>
                      <Play className="mr-1 h-4 w-4" /> Start
                    </Button>
                  )}
                  <Button size="sm" onClick={() => copyMeetingLink(m.meetingLink)}>
                    <Copy className="mr-1 h-4 w-4" /> Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isInMeeting && activeMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white">{activeMeeting.title}</h2>
            <div className="flex gap-2">
              <Button onClick={toggleVideo}>{isVideoOn ? <Video /> : <VideoOff />}</Button>
              <Button onClick={toggleAudio}>{isAudioOn ? <Mic /> : <MicOff />}</Button>
              <Button onClick={toggleScreenShare}>
                {isScreenSharing ? <Monitor /> : <Users />}
              </Button>
              <Button onClick={() => setShowChat((p) => !p)}>Chat</Button>
              <Button variant="destructive" onClick={endMeeting}>
                <PhoneOff /> End
              </Button>
            </div>
          </div>
          <video ref={videoRef} className="flex-1 bg-black w-full rounded-md" autoPlay playsInline />
          {showChat && (
            <div className="bg-white p-2 mt-2 rounded-md max-h-60 overflow-y-auto flex flex-col gap-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-2 items-center">
                  {msg.avatar ? <AvatarImage src={msg.avatar} /> : <AvatarFallback>{msg.sender[0]}</AvatarFallback>}
                  <div>
                    <p className="text-sm font-bold">{msg.sender}</p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <Button onClick={sendMessage}>
                  <Send />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

