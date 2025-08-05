"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageCircle,
  Share,
  Code,
  MoreHorizontal,
  Send,
  Copy,
  Flag,
  Bookmark,
  Trash2,
  Edit,
  Check,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { usePosts } from "@/hooks/use-posts"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    name: string
    username: string
    avatar_url?: string
    title?: string
  }
  likes_count: number
  is_liked: boolean
}

interface Post {
  id: string
  content: string
  type: "text" | "code" | "media"
  created_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  user: {
    id: string
    name: string
    username: string
    avatar_url?: string
    title?: string
  }
  media_url?: string
  is_liked?: boolean
  comments?: Comment[]
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const { likePost, sharePost, addComment, likeComment, deletePost } = usePosts()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const handleLike = async () => {
    try {
      await likePost(post.id)
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    try {
      await addComment(post.id, commentText)
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = async () => {
    try {
      const result = await sharePost(post.id)

      if (result.success) {
        if (result.method === "native") {
          setShareStatus("Shared successfully!")
        } else if (result.method === "clipboard") {
          setShareStatus("Link copied to clipboard!")
        }
      } else {
        setShareStatus(`Copy this link: ${result.url}`)
      }

      setTimeout(() => setShareStatus(null), 3000)
    } catch (error) {
      console.error("Error sharing post:", error)
      setShareStatus("Share failed. Try again.")
      setTimeout(() => setShareStatus(null), 3000)
    }
  }

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`
      await navigator.clipboard.writeText(postUrl)
      setShareStatus("Link copied to clipboard!")
      setTimeout(() => setShareStatus(null), 3000)
    } catch (error) {
      console.error("Error copying link:", error)
      setShareStatus("Copy failed. Try again.")
      setTimeout(() => setShareStatus(null), 3000)
    }
  }

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post.id)
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      await likeComment(post.id, commentId)
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleComment()
    }
  }

  const isOwnPost = user?.id === post.user.id
  const displayedComments = showAllComments ? post.comments || [] : (post.comments || []).slice(0, 3)

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} alt={post.user.name} />
              <AvatarFallback className="bg-blue-600 text-white">
                {post.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white hover:text-blue-400 cursor-pointer">{post.user.name}</h3>
                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                  @{post.user.username}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                {post.user.title} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={handleCopyLink} className="text-gray-300 hover:text-white">
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white">
                <Bookmark className="h-4 w-4 mr-2" />
                Save post
              </DropdownMenuItem>
              {!isOwnPost && (
                <DropdownMenuItem className="text-gray-300 hover:text-white">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
              {isOwnPost && (
                <>
                  <DropdownMenuItem className="text-gray-300 hover:text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeletePost} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-white">
          {post.type === "code" ? (
            <div className="bg-gray-950 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Code className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Code Snippet</span>
              </div>
              <pre className="text-sm text-green-400 overflow-x-auto whitespace-pre-wrap font-mono">
                <code>{post.content}</code>
              </pre>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
          )}
        </div>

        {post.media_url && (
          <div className="rounded-lg overflow-hidden border border-gray-700">
            {post.media_url.includes("video") || post.media_url.includes(".mp4") || post.media_url.includes(".webm") ? (
              <video src={post.media_url} controls className="w-full h-auto max-h-96 object-cover" />
            ) : (
              <img
                src={post.media_url || "/placeholder.svg"}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            )}
          </div>
        )}

        {shareStatus && (
          <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700 rounded-lg">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">{shareStatus}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 transition-colors ${
                post.is_liked ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`} />
              <span className="font-medium">{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{post.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 text-gray-400 hover:text-green-500 transition-colors"
            >
              <Share className="h-4 w-4" />
              <span className="font-medium">{post.shares_count}</span>
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t border-gray-800">
            {user && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a thoughtful comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-gray-800 border-gray-700 text-white text-sm min-h-[60px] resize-none focus:border-blue-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {displayedComments.length > 0 && (
              <div className="space-y-3">
                {displayedComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} alt={comment.user.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm hover:text-blue-400 cursor-pointer">
                            {comment.user.name}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-400">
                            @{comment.user.username}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-2 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentLike(comment.id)}
                          className={`gap-1 text-xs ${
                            comment.is_liked ? "text-red-500 hover:text-red-400" : "text-gray-500 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-3 w-3 ${comment.is_liked ? "fill-current" : ""}`} />
                          {comment.likes_count > 0 && comment.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-gray-500 hover:text-blue-500">
                          <MessageCircle className="h-3 w-3" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {(post.comments?.length || 0) > 3 && !showAllComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllComments(true)}
                    className="text-blue-400 hover:text-blue-300 ml-11"
                  >
                    Show {(post.comments?.length || 0) - 3} more comments
                  </Button>
                )}
              </div>
            )}

            {displayedComments.length === 0 && (
              <div className="text-center py-4">
                <MessageCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
