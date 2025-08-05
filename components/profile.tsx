"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import {
  Camera,
  MapPin,
  Link,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  Save,
  Edit3,
  Plus,
  X,
  Upload,
  Check,
} from "lucide-react"
import { usePosts } from "@/hooks/use-posts"

export function Profile() {
  const { user, updateProfile, updateAvatar } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { posts } = usePosts()
  const [connectionsCount, setConnectionsCount] = useState(0)

  // Calculate user's posts count
  const userPostsCount = posts.filter((post) => post.user.id === user?.id).length

  // Load connections count
  useEffect(() => {
    if (user) {
      const connections = JSON.parse(localStorage.getItem("devconnect_connections") || "[]")
      setConnectionsCount(connections.length)
    }
  }, [user])

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    title: user?.title || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    twitter: user?.twitter || "",
    skills: user?.skills || [],
  })

  const [newSkill, setNewSkill] = useState("")

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(profileData)
      setIsEditing(false)
      setAvatarUploadStatus("Profile updated successfully!")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setAvatarUploadStatus("Failed to update profile")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setAvatarUploadStatus("Please select an image file")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadStatus("Image must be less than 5MB")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
      return
    }

    setUploadingAvatar(true)
    setAvatarUploadStatus("Uploading...")

    try {
      await updateAvatar(file)
      setAvatarUploadStatus("Profile picture updated!")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setAvatarUploadStatus("Upload failed. Please try again.")
      setTimeout(() => setAvatarUploadStatus(null), 3000)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-white mb-2">Please sign in</h3>
            <p className="text-gray-400">You need to be signed in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-blue-600 text-2xl text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="absolute -bottom-2 -right-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {avatarUploadStatus && (
                  <div
                    className={`mb-4 p-2 rounded-lg text-sm ${
                      avatarUploadStatus.includes("updated") || avatarUploadStatus.includes("Uploading")
                        ? "bg-green-900/20 border border-green-700 text-green-400"
                        : "bg-red-900/20 border border-red-700 text-red-400"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {avatarUploadStatus.includes("updated") && <Check className="h-4 w-4" />}
                      {avatarUploadStatus.includes("Uploading") && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      )}
                      <span>{avatarUploadStatus}</span>
                    </div>
                  </div>
                )}

                <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-gray-400 mb-2">@{user?.username}</p>
                <p className="text-blue-400 mb-4">{user?.title || "Developer"}</p>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.location || "Location not set"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined December 2023</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 bg-transparent">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Upload className="h-3 w-3" />
                    <span>Click camera icon to upload profile picture</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB • JPG, PNG, GIF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-white font-semibold">{userPostsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections</span>
                  <span className="text-white font-semibold">{connectionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile Views</span>
                  <span className="text-white font-semibold">1.2k</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Profile Information</CardTitle>
              <Button
                variant={isEditing ? "secondary" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-blue-600 hover:bg-blue-700" : "border-gray-700"}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-gray-300">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title" className="text-gray-300">
                      Professional Title
                    </Label>
                    <Input
                      id="title"
                      value={profileData.title}
                      onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="e.g., Full Stack Developer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-gray-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="text-gray-300">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-gray-300">
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="github" className="text-gray-300">
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        value={profileData.github}
                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin" className="text-gray-300">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter" className="text-gray-300">
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">About</h3>
                    <p className="text-gray-300">
                      {user?.bio || "No bio added yet. Click edit to add your professional summary."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Contact</h3>
                    <div className="space-y-2">
                      {user?.website && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Link className="h-4 w-4" />
                          <a href={user.website} className="text-blue-400 hover:underline">
                            {user.website}
                          </a>
                        </div>
                      )}
                      {user?.location && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-400">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
