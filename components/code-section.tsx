"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import {
  Code,
  Share,
  Heart,
  MessageCircle,
  Copy,
  Download,
  Plus,
  Search,
  Filter,
  GitFork,
  Eye,
  Linkedin,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  author: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  created_at: string
  likes_count: number
  views_count: number
  forks_count: number
  is_liked: boolean
  is_public: boolean
}

export function CodeSection() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([
    {
      id: "1",
      title: "React Custom Hook for API Calls",
      description: "A reusable custom hook for handling API requests with loading states and error handling",
      code: `import { useState, useEffect } from 'react';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}`,
      language: "typescript",
      tags: ["react", "hooks", "api", "typescript"],
      author: {
        id: "2",
        name: "Sarah Chen",
        username: "sarahchen",
        avatar_url: "/placeholder.svg?height=40&width=40",
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes_count: 24,
      views_count: 156,
      forks_count: 8,
      is_liked: false,
      is_public: true,
    },
    {
      id: "2",
      title: "Python Data Validation Decorator",
      description: "A decorator for validating function parameters with type checking",
      code: `from functools import wraps
from typing import get_type_hints

def validate_types(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        hints = get_type_hints(func)
        
        # Get function parameter names
        param_names = func.__code__.co_varnames[:func.__code__.co_argcount]
        
        # Validate positional arguments
        for i, (param_name, arg) in enumerate(zip(param_names, args)):
            if param_name in hints:
                expected_type = hints[param_name]
                if not isinstance(arg, expected_type):
                    raise TypeError(
                        f"Parameter '{param_name}' must be of type {expected_type.__name__}, "
                        f"got {type(arg).__name__}"
                    )
        
        # Validate keyword arguments
        for param_name, arg in kwargs.items():
            if param_name in hints:
                expected_type = hints[param_name]
                if not isinstance(arg, expected_type):
                    raise TypeError(
                        f"Parameter '{param_name}' must be of type {expected_type.__name__}, "
                        f"got {type(arg).__name__}"
                    )
        
        return func(*args, **kwargs)
    return wrapper

# Usage example
@validate_types
def calculate_area(length: float, width: float) -> float:
    return length * width`,
      language: "python",
      tags: ["python", "decorator", "validation", "types"],
      author: {
        id: "3",
        name: "Alex Rodriguez",
        username: "alexdev",
        avatar_url: "/placeholder.svg?height=40&width=40",
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      likes_count: 18,
      views_count: 89,
      forks_count: 5,
      is_liked: true,
      is_public: true,
    },
  ])

  const [newSnippet, setNewSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: [] as string[],
    is_public: true,
  })

  const languages = ["all", "javascript", "typescript", "python", "java", "go", "rust", "cpp", "csharp"]

  const handleLike = (snippetId: string) => {
    setCodeSnippets((snippets) =>
      snippets.map((snippet) =>
        snippet.id === snippetId
          ? {
              ...snippet,
              is_liked: !snippet.is_liked,
              likes_count: snippet.is_liked ? snippet.likes_count - 1 : snippet.likes_count + 1,
            }
          : snippet,
      ),
    )
  }

  const handleShare = (snippet: CodeSnippet) => {
    // Share to LinkedIn
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      `https://devconnect.dev/code/${snippet.id}`,
    )}&title=${encodeURIComponent(snippet.title)}&summary=${encodeURIComponent(snippet.description)}`

    window.open(linkedinUrl, "_blank", "width=600,height=400")
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    // TODO: Show toast notification
  }

  const createSnippet = () => {
    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      ...newSnippet,
      author: {
        id: user?.id || "",
        name: user?.name || "",
        username: user?.username || "",
        avatar_url: user?.avatar_url,
      },
      created_at: new Date().toISOString(),
      likes_count: 0,
      views_count: 0,
      forks_count: 0,
      is_liked: false,
    }

    setCodeSnippets([snippet, ...codeSnippets])
    setNewSnippet({
      title: "",
      description: "",
      code: "",
      language: "javascript",
      tags: [],
      is_public: true,
    })
    setActiveTab("browse")
  }

  const filteredSnippets = codeSnippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage

    return matchesSearch && matchesLanguage
  })

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Code Share</h1>
          <p className="text-gray-400">Share and discover code snippets with the developer community</p>
        </div>
        <Button onClick={() => setActiveTab("create")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Share Code
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my-code">My Code</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search code snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-white">
                        {lang === "all" ? "All Languages" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-gray-700 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Snippets */}
          <div className="space-y-6">
            {filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={snippet.author.avatar_url || "/placeholder.svg"} alt={snippet.author.name} />
                        <AvatarFallback className="bg-blue-600">
                          {snippet.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{snippet.title}</h3>
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                            {snippet.language}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          by {snippet.author.name} •{" "}
                          {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {snippet.views_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-4 w-4" />
                          {snippet.forks_count}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2">{snippet.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {snippet.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="relative">
                    <div className="bg-gray-950 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">{snippet.language}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(snippet.code)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(snippet.id)}
                        className={`gap-2 ${snippet.is_liked ? "text-red-500" : "text-gray-400"} hover:text-red-500`}
                      >
                        <Heart className={`h-4 w-4 ${snippet.is_liked ? "fill-current" : ""}`} />
                        {snippet.likes_count}
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4" />
                        Comment
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-green-500">
                        <GitFork className="h-4 w-4" />
                        Fork
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(snippet)}
                      className="gap-2 text-gray-400 hover:text-blue-500"
                    >
                      <Linkedin className="h-4 w-4" />
                      Share on LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-code" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Code className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No code snippets yet</h3>
              <p className="text-gray-400 mb-4">Start sharing your code with the community!</p>
              <Button onClick={() => setActiveTab("create")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Snippet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Share Code Snippet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <Input
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                  placeholder="Give your code snippet a descriptive title"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <Textarea
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                  placeholder="Describe what your code does and how it works"
                  className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <Select
                  value={newSnippet.language}
                  onValueChange={(value) => setNewSnippet({ ...newSnippet, language: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {languages.slice(1).map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-white">
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                <Textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                  placeholder="Paste your code here..."
                  className="bg-gray-800 border-gray-700 text-white font-mono text-sm min-h-[300px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <Input
                  placeholder="Add tags separated by commas (e.g., react, hooks, api)"
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const input = e.target as HTMLInputElement
                      const tags = input.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                      setNewSnippet({ ...newSnippet, tags })
                      input.value = ""
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSnippet.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-400">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newSnippet.is_public}
                    onChange={(e) => setNewSnippet({ ...newSnippet, is_public: e.target.checked })}
                    className="rounded border-gray-700"
                  />
                  <label htmlFor="public" className="text-sm text-gray-300">
                    Make this snippet public
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("browse")} className="border-gray-700">
                    Cancel
                  </Button>
                  <Button
                    onClick={createSnippet}
                    disabled={!newSnippet.title || !newSnippet.code}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
