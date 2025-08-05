"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Search, MapPin, Building, Plus, Check, Users, Filter } from "lucide-react"

interface Developer {
  id: string
  name: string
  title: string
  company: string
  location: string
  avatar: string
  skills: string[]
  bio: string
  experience: string
  isConnected: boolean
}

export function Network() {
  const { user } = useAuth()
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")
  const [connections, setConnections] = useState<string[]>([])

  // Sample developers data
  const sampleDevelopers: Developer[] = [
    {
      id: "1",
      name: "Sarah Chen",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      bio: "Passionate about creating beautiful and functional user interfaces",
      experience: "5+ years",
      isConnected: false,
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York",
      avatar: "/placeholder.svg?height=40&width=40&text=AR",
      skills: ["Node.js", "React", "PostgreSQL", "AWS"],
      bio: "Building scalable web applications with modern technologies",
      experience: "4+ years",
      isConnected: false,
    },
    {
      id: "3",
      name: "Priya Patel",
      title: "Backend Developer",
      company: "DataFlow Inc",
      location: "Mumbai",
      avatar: "/placeholder.svg?height=40&width=40&text=PP",
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      bio: "Specialized in building robust backend systems and APIs",
      experience: "3+ years",
      isConnected: false,
    },
    {
      id: "4",
      name: "Marcus Johnson",
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "London",
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform"],
      bio: "Automating infrastructure and improving deployment processes",
      experience: "6+ years",
      isConnected: false,
    },
    {
      id: "5",
      name: "Lisa Wang",
      title: "Mobile Developer",
      company: "AppStudio",
      location: "Toronto",
      avatar: "/placeholder.svg?height=40&width=40&text=LW",
      skills: ["React Native", "Swift", "Kotlin", "Firebase"],
      bio: "Creating amazing mobile experiences for iOS and Android",
      experience: "4+ years",
      isConnected: false,
    },
    {
      id: "6",
      name: "Rohan Agarwal",
      title: "Data Scientist",
      company: "AI Solutions",
      location: "Mumbai",
      avatar: "/placeholder.svg?height=40&width=40&text=RA",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      bio: "Turning data into actionable insights using ML and AI",
      experience: "5+ years",
      isConnected: false,
    },
    {
      id: "7",
      name: "Emma Thompson",
      title: "UI/UX Designer",
      company: "DesignHub",
      location: "Berlin",
      avatar: "/placeholder.svg?height=40&width=40&text=ET",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      bio: "Designing user-centered experiences that delight and engage",
      experience: "4+ years",
      isConnected: false,
    },
    {
      id: "8",
      name: "David Kim",
      title: "Software Architect",
      company: "Enterprise Solutions",
      location: "Seoul",
      avatar: "/placeholder.svg?height=40&width=40&text=DK",
      skills: ["Java", "Spring Boot", "Microservices", "Redis"],
      bio: "Designing scalable software architectures for enterprise applications",
      experience: "8+ years",
      isConnected: false,
    },
    {
      id: "9",
      name: "Ana Silva",
      title: "Frontend Developer",
      company: "WebCraft",
      location: "São Paulo",
      avatar: "/placeholder.svg?height=40&width=40&text=AS",
      skills: ["Vue.js", "JavaScript", "CSS", "Webpack"],
      bio: "Crafting responsive and interactive web applications",
      experience: "3+ years",
      isConnected: false,
    },
    {
      id: "10",
      name: "James Wilson",
      title: "Security Engineer",
      company: "SecureNet",
      location: "Austin",
      avatar: "/placeholder.svg?height=40&width=40&text=JW",
      skills: ["Cybersecurity", "Penetration Testing", "Python", "Linux"],
      bio: "Protecting digital assets through comprehensive security solutions",
      experience: "6+ years",
      isConnected: false,
    },
  ]

  // Load connections and developers on component mount
  useEffect(() => {
    if (user) {
      // Load user-specific connections
      const userConnections = JSON.parse(localStorage.getItem(`devconnect_connections_${user.id}`) || "[]")
      setConnections(userConnections)

      // Set developers with connection status
      const developersWithConnectionStatus = sampleDevelopers.map((dev) => ({
        ...dev,
        isConnected: userConnections.includes(dev.id),
      }))

      setDevelopers(developersWithConnectionStatus)
      setFilteredDevelopers(developersWithConnectionStatus)
    }
  }, [user])

  // Filter developers based on search, location, and skills
  useEffect(() => {
    let filtered = developers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dev) =>
          dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dev.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dev.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((dev) => dev.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    // Skills filter
    if (skillFilter !== "all") {
      filtered = filtered.filter((dev) =>
        dev.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
      )
    }

    setFilteredDevelopers(filtered)
  }, [searchTerm, locationFilter, skillFilter, developers])

  const handleConnect = (developerId: string) => {
    if (!user) return

    const updatedDevelopers = developers.map((dev) => {
      if (dev.id === developerId) {
        return { ...dev, isConnected: !dev.isConnected }
      }
      return dev
    })

    setDevelopers(updatedDevelopers)

    // Update connections list
    const newConnections = updatedDevelopers.filter((dev) => dev.isConnected).map((dev) => dev.id)

    setConnections(newConnections)

    // Save user-specific connections
    localStorage.setItem(`devconnect_connections_${user.id}`, JSON.stringify(newConnections))

    // Dispatch event to update sidebar
    window.dispatchEvent(
      new CustomEvent("connectionsUpdated", {
        detail: { count: newConnections.length },
      }),
    )
  }

  // Get unique locations and skills for filters
  const uniqueLocations = [...new Set(sampleDevelopers.map((dev) => dev.location))].sort()
  const uniqueSkills = [...new Set(sampleDevelopers.flatMap((dev) => dev.skills))].sort()

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-white mb-2">Please sign in</h3>
            <p className="text-gray-400">You need to be signed in to view the network</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Developer Network</h1>
        <p className="text-gray-400">Connect with talented developers from around the world</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search developers, skills, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Locations
                  </SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()} className="text-white">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Skills" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Skills
                  </SelectItem>
                  {uniqueSkills.map((skill) => (
                    <SelectItem key={skill} value={skill.toLowerCase()} className="text-white">
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="h-4 w-4" />
          <span>
            Showing {filteredDevelopers.length} of {developers.length} developers
            {connections.length > 0 && ` • ${connections.length} connections`}
          </span>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevelopers.map((developer) => (
          <Card key={developer.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={developer.avatar || "/placeholder.svg"} alt={developer.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {developer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{developer.name}</h3>
                    <p className="text-sm text-blue-400">{developer.title}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleConnect(developer.id)}
                  className={
                    developer.isConnected
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                >
                  {developer.isConnected ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building className="h-4 w-4" />
                  <span>{developer.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{developer.location}</span>
                </div>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2">{developer.bio}</p>

              <div className="flex flex-wrap gap-1">
                {developer.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
                    {skill}
                  </Badge>
                ))}
                {developer.skills.length > 3 && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                    +{developer.skills.length - 3}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-gray-500">{developer.experience} experience</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevelopers.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No developers found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
