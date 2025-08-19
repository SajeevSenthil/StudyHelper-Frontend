"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Calendar, FileText, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"

type SavedSummary = {
  id: string
  originalText: string
  summary: string
  links: string[]
  createdAt: string
}

export default function SavedSummariesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [recentlyUploaded, setRecentlyUploaded] = useState<SavedSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [allSummaries, setAllSummaries] = useState<SavedSummary[]>([])
  const [filteredSummaries, setFilteredSummaries] = useState<SavedSummary[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchSummaries()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSummaries([])
    } else {
      const filtered = allSummaries.filter(
        (summary) =>
          summary.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summary.originalText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredSummaries(filtered)
    }
  }, [searchQuery, allSummaries])

  const fetchSummaries = async () => {
    try {
      const response = await fetch("/api/summaries")
      if (response.ok) {
        const data = await response.json()
        const summariesData = data.summaries || []

        setAllSummaries(summariesData)

        const recent = summariesData
          .sort((a: SavedSummary, b: SavedSummary) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        setRecentlyUploaded(recent)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch saved summaries",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fetch summaries error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch saved summaries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteSummary = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/summaries/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRecentlyUploaded(recentlyUploaded.filter((summary) => summary.id !== id))
        setAllSummaries(allSummaries.filter((summary) => summary.id !== id))
        toast({
          title: "Success",
          description: "Summary deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete summary",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete summary error:", error)
      toast({
        title: "Error",
        description: "Failed to delete summary",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Summaries</h1>
            <p className="text-gray-600">Search your summaries or view recent uploads</p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search summaries by topic or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {searchQuery.trim() !== "" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results ({filteredSummaries.length})</h2>
              {filteredSummaries.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No summaries found matching your search</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredSummaries.map((summary) => (
                    <Card
                      key={`search-${summary.id}`}
                      className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 mb-2">{truncateText(summary.summary, 150)}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(summary.createdAt)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSummary(summary.id)
                            }}
                            disabled={deleting === summary.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === summary.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {recentlyUploaded.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved summaries yet</h3>
                <p className="text-gray-600 mb-4">Start by creating summaries in the Summarization tool</p>
                <Button onClick={() => router.push("/summarization")}>Create Summary</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Uploaded</h2>
              <div className="grid gap-4">
                {recentlyUploaded.map((summary) => (
                  <Card
                    key={`recent-${summary.id}`}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 mb-2">{truncateText(summary.summary, 150)}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(summary.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSummary(summary.id)}
                          disabled={deleting === summary.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === summary.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
