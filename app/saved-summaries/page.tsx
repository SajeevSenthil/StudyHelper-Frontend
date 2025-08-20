"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Calendar, FileText, Search, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"

type SavedSummary = {
  doc_id: number
  topic: string
  summary: string
  summary_filename?: string
  summary_file_url?: string
  keywords?: string | null
  created_at: string
  download_count: number
  resources_count: number
  original_length: number
  summary_length: number
  resources: string[]
}

export default function SavedSummariesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [recentlyUploaded, setRecentlyUploaded] = useState<SavedSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [allSummaries, setAllSummaries] = useState<SavedSummary[]>([])
  const [filteredSummaries, setFilteredSummaries] = useState<SavedSummary[]>([])
  const [downloading, setDownloading] = useState<number | null>(null)

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
          summary.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summary.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (summary.keywords && summary.keywords.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredSummaries(filtered)
    }
  }, [searchQuery, allSummaries])

  const fetchSummaries = async () => {
    try {
      const response = await fetch("/api/summaries?user_id=1") // Default user ID
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summaries) {
          const summariesData = data.summaries

          setAllSummaries(summariesData)

          const recent = summariesData
            .sort((a: SavedSummary, b: SavedSummary) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10) // Show more recent uploads
          setRecentlyUploaded(recent)
        }
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

  const downloadSummary = async (summary: SavedSummary) => {
    if (!summary.summary_filename) {
      toast({
        title: "Error",
        description: "No downloadable file available for this summary",
        variant: "destructive",
      })
      return
    }

    setDownloading(summary.doc_id)
    try {
      const response = await fetch(`/api/summary-file/${summary.summary_filename}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.content) {
          // Create a downloadable blob
          const blob = new Blob([data.content], { type: 'text/plain' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${summary.topic}.txt`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          toast({
            title: "Success",
            description: "Summary downloaded successfully",
          })
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error("Failed to download file")
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download summary file",
        variant: "destructive",
      })
    } finally {
      setDownloading(null)
    }
  }

  const deleteSummary = async (doc_id: number) => {
    setDeleting(doc_id)
    try {
      const response = await fetch(`/api/summaries/${doc_id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove from both arrays
        setRecentlyUploaded(recentlyUploaded.filter((summary) => summary.doc_id !== doc_id))
        setAllSummaries(allSummaries.filter((summary) => summary.doc_id !== doc_id))
        // Also update filtered summaries if searching
        if (searchQuery.trim() !== "") {
          setFilteredSummaries(filteredSummaries.filter((summary) => summary.doc_id !== doc_id))
        }
        toast({
          title: "Success",
          description: "Summary deleted successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete summary",
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
    if (!dateString) return "Unknown date"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">StudyHelper</h1>
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
                className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                      key={`search-${summary.doc_id}`}
                      className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 cursor-pointer bg-white"
                    >
                      <CardContent className="py-4 px-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">
                              {summary.topic}
                            </h3>
                            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                              {truncateText(summary.summary, 200)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(summary.created_at)}</span>
                              <span className="ml-4">Downloads: {summary.download_count}</span>
                              <span className="ml-2">Resources: {summary.resources?.length || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            {summary.summary_filename && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadSummary(summary)
                                }}
                                disabled={downloading === summary.doc_id}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                {downloading === summary.doc_id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSummary(summary.doc_id)
                              }}
                              disabled={deleting === summary.doc_id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === summary.doc_id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                    key={`recent-${summary.doc_id}`}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-white"
                  >
                    <CardContent className="py-4 px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">
                            {summary.topic}
                          </h3>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {truncateText(summary.summary, 200)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(summary.created_at)}</span>
                            <span className="ml-4">Downloads: {summary.download_count}</span>
                            <span className="ml-2">Resources: {summary.resources?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          {summary.summary_filename && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadSummary(summary)
                              }}
                              disabled={downloading === summary.doc_id}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {downloading === summary.doc_id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSummary(summary.doc_id)}
                            disabled={deleting === summary.doc_id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === summary.doc_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
