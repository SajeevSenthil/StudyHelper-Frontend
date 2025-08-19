"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Award, RotateCcw, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface QuizResult {
  id: string
  title: string
  score: number
  totalQuestions: number
  completedAt: string
  percentage: number
}

export default function PastQuizzesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchQuizResults()
    }
  }, [user])

  useEffect(() => {
    const filtered = quizResults.filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredResults(filtered)
  }, [searchTerm, quizResults])

  const fetchQuizResults = async () => {
    try {
      const response = await fetch("/api/quiz-results")
      if (response.ok) {
        const results = await response.json()
        setQuizResults(results)
        setFilteredResults(results)
      }
    } catch (error) {
      console.error("Failed to fetch quiz results:", error)
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const retakeQuiz = async (quizTitle: string) => {
    // Navigate to quiz page with the topic pre-filled
    router.push(`/quizzes?topic=${encodeURIComponent(quizTitle)}`)
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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const recentQuizzes = filteredResults.slice(0, 5)
  const averageScore =
    quizResults.length > 0
      ? Math.round(quizResults.reduce((acc, quiz) => acc + quiz.percentage, 0) / quizResults.length)
      : 0

  if (isLoading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Past Quizzes</h1>
            <p className="text-xl text-gray-600">Review your quiz history and performance</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{quizResults.length}</p>
                    <p className="text-gray-600">Quizzes Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Award className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{averageScore}%</p>
                    <p className="text-gray-600">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{quizResults.filter((q) => q.percentage >= 80).length}</p>
                    <p className="text-gray-600">High Scores (80%+)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quizzes by topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Quizzes */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingQuizzes ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : recentQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {recentQuizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{quiz.title}</p>
                            <p className="text-sm text-gray-500">{formatDate(quiz.completedAt)}</p>
                          </div>
                          <Badge className={getScoreColor(quiz.percentage)}>{quiz.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No quizzes taken yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Quizzes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>All Quiz Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingQuizzes ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="space-y-4">
                      {filteredResults.map((quiz) => (
                        <div key={quiz.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{quiz.title}</h3>
                            <Badge className={getScoreColor(quiz.percentage)}>
                              {quiz.score}/{quiz.totalQuestions} ({quiz.percentage}%)
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(quiz.completedAt)}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => retakeQuiz(quiz.title)}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Retake
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? "No quizzes found matching your search" : "No quizzes taken yet"}
                      </p>
                      <Button onClick={() => router.push("/quizzes")}>Take Your First Quiz</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
