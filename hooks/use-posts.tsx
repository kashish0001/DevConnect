"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./use-auth"

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
  media_url?: string | null

  is_liked: boolean
  comments: Comment[]
}

interface CreatePostData {
  content: string
  type: "text" | "code" | "media"
  media_url?: string | null
}

interface PostsContextType {
  posts: Post[]
  loading: boolean
  createPost: (data: CreatePostData) => Promise<void>
  likePost: (postId: string) => Promise<void>
  sharePost: (postId: string) => Promise<{ success: boolean; method?: string; url?: string; message?: string }>
  addComment: (postId: string, content: string) => Promise<void>
  likeComment: (postId: string, commentId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  getComments: (postId: string) => Comment[]
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    try {
      const savedPosts = localStorage.getItem("devconnect_posts")
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts)
        setPosts(
          parsedPosts.sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        )
      } else {
        // Create some demo posts
        const demoPosts: Post[] = [
          {
            id: "demo-post-1",
            content:
              "Just shipped a new feature using React 18 and TypeScript! The new concurrent features are amazing for performance. 🚀\n\nWhat's everyone's experience with the new React features?",
            type: "text",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes_count: 12,
            comments_count: 3,
            shares_count: 2,
            user: {
              id: "demo-user-1",
              name: "Sarah Chen",
              username: "sarahdev",
              avatar_url: "/placeholder.svg?height=40&width=40",
              title: "Frontend Engineer",
            },
            media_url: null,
            is_liked: false,
            comments: [
              {
                id: "comment-1",
                content:
                  "React 18 is incredible! The automatic batching alone has improved our app's performance significantly.",
                created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                user: {
                  id: "demo-user-2",
                  name: "Alex Rodriguez",
                  username: "alexdev",
                  avatar_url: "/placeholder.svg?height=32&width=32",
                  title: "Full Stack Developer",
                },
                likes_count: 5,
                is_liked: false,
              },
            ],
          },
          {
            id: "demo-post-2",
            content: `// Here's a clean way to handle async operations in React
const useAsyncData = (fetchFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [fetchFn]);

  return { data, loading, error };
};

// Usage
const { data, loading, error } = useAsyncData(fetchUserData);`,
            type: "code",
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            likes_count: 24,
            comments_count: 8,
            shares_count: 6,
            user: {
              id: "demo-user-3",
              name: "Maya Patel",
              username: "mayacode",
              avatar_url: "/placeholder.svg?height=40&width=40",
              title: "Senior React Developer",
            },
            media_url: null,
            is_liked: true,
            comments: [],
          },
          {
            id: "demo-post-3",
            content:
              "Working on a new design system for our team. Here's a sneak peek at our new component library! 🎨\n\nFeedback welcome!",
            type: "media",
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            likes_count: 18,
            comments_count: 5,
            shares_count: 3,
            user: {
              id: "demo-user-4",
              name: "Jordan Kim",
              username: "jordanux",
              avatar_url: "/placeholder.svg?height=40&width=40",
              title: "UI/UX Designer",
            },
            media_url: "/placeholder.svg?height=300&width=500&text=Design+System+Preview",
            is_liked: false,
            comments: [],
          },
        ]
        setPosts(demoPosts)
        localStorage.setItem("devconnect_posts", JSON.stringify(demoPosts))
      }
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (data: CreatePostData) => {
    if (!user) throw new Error("User not authenticated")

    const newPost: Post = {
      id: "post-" + Date.now(),
      content: data.content,
      type: data.type,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        title: user.title || "Developer",
      },
      media_url: data.media_url || null,
      is_liked: false,
      comments: [],
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))
  }

  const likePost = async (postId: string) => {
    if (!user) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const isLiked = post.is_liked
        return {
          ...post,
          is_liked: !isLiked,
          likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
        }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))
  }

  const sharePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return { success: false, message: "Post not found" }

    // Update share count
    const updatedPosts = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, shares_count: p.shares_count + 1 }
      }
      return p
    })
    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))

    const postUrl = `${window.location.origin}/post/${postId}`
    const shareData = {
      title: `${post.user.name} on DevConnect`,
      text: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
      url: postUrl,
    }

    // Try native sharing first
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return { success: true, method: "native" }
      } catch (error) {
        // User cancelled or error occurred
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(postUrl)
      return { success: true, method: "clipboard", message: "Link copied to clipboard!" }
    } catch (error) {
      return { success: false, url: postUrl, message: "Copy this link to share" }
    }
  }

  const addComment = async (postId: string, content: string) => {
    if (!user) throw new Error("User not authenticated")

    const newComment: Comment = {
      id: "comment-" + Date.now(),
      content,
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        title: user.title,
      },
      likes_count: 0,
      is_liked: false,
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
          comments_count: post.comments_count + 1,
        }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))
  }

  const likeComment = async (postId: string, commentId: string) => {
    if (!user) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            const isLiked = comment.is_liked
            return {
              ...comment,
              is_liked: !isLiked,
              likes_count: isLiked ? comment.likes_count - 1 : comment.likes_count + 1,
            }
          }
          return comment
        })
        return { ...post, comments: updatedComments }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))
  }

  const deletePost = async (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    setPosts(updatedPosts)
    localStorage.setItem("devconnect_posts", JSON.stringify(updatedPosts))
  }

  const getComments = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    return post?.comments || []
  }

  const value = {
    posts,
    loading,
    createPost,
    likePost,
    sharePost,
    addComment,
    likeComment,
    deletePost,
    getComments,
  }

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
}
