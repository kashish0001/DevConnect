"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { useAuth } from "@/hooks/use-auth"
import { usePosts } from "@/hooks/use-posts"
import { ImageIcon, Video, Code, FileText, Send, X, Smile, Play } from "lucide-react"

const COMMON_EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "🚀",
  "💻",
  "⚡",
  "🔥",
  "💡",
  "🎯",
  "✨",
  "🎉",
  "👍",
  "👎",
  "👏",
  "🙌",
  "💪",
  "🤝",
  "❤️",
  "💙",
  "💚",
  "💛",
  "🧡",
  "💜",
]

export function Feed() {
  const { user } = useAuth()
  const { posts, createPost, loading } = usePosts()
  const [postContent, setPostContent] = useState("")
  const [postType, setPostType] = useState<"text" | "code" | "media">("text")
  const [isPosting, setIsPosting] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedMedia) return

    setIsPosting(true)
    try {
      let mediaUrl = null
      if (selectedMedia) {
        mediaUrl = URL.createObjectURL(selectedMedia)
      }

      await createPost({
        content: postContent,
        type: postType,
        media_url: mediaUrl,
      })

      setPostContent("")
      setPostType("text")
      setSelectedMedia(null)
      setMediaPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (videoInputRef.current) videoInputRef.current.value = ""
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedMedia(file)
      setPostType("media")

      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedMedia(file)
      setPostType("media")

      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = () => {
    setSelectedMedia(null)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const insertEmoji = (emoji: string) => {
    setPostContent((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const getPlaceholderText = () => {
    switch (postType) {
      case "code":
        return "Share your code snippet, algorithm, or technical solution..."
      case "media":
        return "Share your thoughts about this image/video..."
      default:
        return "What's on your mind? Share your dev journey, insights, ask questions, or start a discussion..."
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 pt-24">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <Code className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Join DevConnect</h3>
            <p className="text-gray-400 mb-4">Sign in to share posts and connect with developers</p>
            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-24">
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-blue-600 text-white">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{user?.name}</h3>
              <p className="text-sm text-gray-400">Share with the dev community</p>
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              @{user?.username}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-3">
            <Button
              variant={postType === "text" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPostType("text")}
              className={`transition-colors ${
                postType === "text"
                  ? "bg-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <FileText className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button
              variant={postType === "code" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPostType("code")}
              className={`transition-colors ${
                postType === "code"
                  ? "bg-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <Code className="h-4 w-4 mr-1" />
              Code
            </Button>
            <Button
              variant={postType === "media" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPostType("media")}
              className={`transition-colors ${
                postType === "media"
                  ? "bg-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Media
            </Button>
          </div>

          <Textarea
            placeholder={getPlaceholderText()}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className={`bg-gray-800 border-gray-700 text-white min-h-[120px] resize-none focus:border-blue-500 transition-colors ${
              postType === "code" ? "font-mono text-sm" : ""
            }`}
          />

          {mediaPreview && (
            <div className="relative">
              {selectedMedia?.type.startsWith("video/") ? (
                <div className="relative">
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  />
                  <div className="absolute top-2 left-2 bg-gray-900/80 rounded px-2 py-1">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={mediaPreview || "/placeholder.svg"}
                  alt="Media preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-700"
                />
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showEmojiPicker && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                {COMMON_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="text-lg hover:bg-gray-700 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Photo
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
              >
                <Smile className="h-4 w-4 mr-1" />
                Emoji
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs ${postContent.length > 2000 ? "text-red-400" : "text-gray-500"}`}>
                {postContent.length}/2000
              </span>
              <Button
                onClick={handleCreatePost}
                disabled={(!postContent.trim() && !selectedMedia) || isPosting || postContent.length > 2000}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-1" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Code className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-4">Be the first to share something with the community!</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPostType("text")} className="border-gray-700">
                  <FileText className="h-4 w-4 mr-1" />
                  Share Update
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPostType("code")} className="border-gray-700">
                  <Code className="h-4 w-4 mr-1" />
                  Share Code
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {posts.length > 0 && !loading && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 bg-transparent"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  )
}
