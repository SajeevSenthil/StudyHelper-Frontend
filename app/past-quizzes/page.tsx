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
  user_quiz_id: number
  quiz_id: number
  topic: string
  taken_date: string
  total_marks: number
  score: number
  percentage: number
  performance_report: string
}

interface QuizAttemptDetails {
  user_quiz_id: number
  quiz_id: number
  topic: string
  taken_date: string
  total_marks: number
  score: number
  percentage: number
  detailed_results: Array<{
    question_number: number
    question_id: number
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
    user_selected: string | null
    is_correct: boolean
    status: string
  }>
}

export default function PastQuizzesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<QuizAttemptDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

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
    const filtered = quizResults.filter((quiz) => quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredResults(filtered)
  }, [searchTerm, quizResults])

  const fetchQuizResults = async () => {
    try {
      const response = await fetch("/api/quiz-results?user_id=1") // Default user ID
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.attempts) {
          setQuizResults(data.attempts)
          setFilteredResults(data.attempts)
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz results:", error)
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const fetchQuizDetails = async (userQuizId: number) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/quiz-attempt/${userQuizId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedQuizDetails(data)
      } else {
        console.error("Failed to fetch quiz details")
      }
    } catch (error) {
      console.error("Failed to fetch quiz details:", error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const retakeQuiz = async (quizTopic: string) => {
    // Navigate to quiz page with the topic pre-filled
    router.push(`/quizzes?topic=${encodeURIComponent(quizTopic)}`)
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
                        <div key={quiz.user_quiz_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{quiz.topic}</p>
                            <p className="text-sm text-gray-500">{formatDate(quiz.taken_date)}</p>
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
                        <div key={quiz.user_quiz_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{quiz.topic}</h3>
                            <Badge className={getScoreColor(quiz.percentage)}>
                              {quiz.score}/{quiz.total_marks} ({quiz.percentage}%)
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(quiz.taken_date)}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchQuizDetails(quiz.user_quiz_id)}
                                className="flex items-center gap-2"
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => retakeQuiz(quiz.topic)}
                                className="flex items-center gap-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Retake
                              </Button>
                            </div>
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

      {/* Detailed Results Modal */}
      {selectedQuizDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedQuizDetails.topic}</h2>
                  <p className="text-gray-600">
                    Score: {selectedQuizDetails.score}/{selectedQuizDetails.total_marks} ({selectedQuizDetails.percentage}%)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuizDetails(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
              
              {isLoadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedQuizDetails.detailed_results.map((result) => (
                    <div key={result.question_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex-1">
                          {result.question_number}. {result.question_text}
                        </h4>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          result.is_correct 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Your answer: </span>
                          <span className={result.is_correct ? 'text-green-700' : 'text-red-700'}>
                            {result.user_selected || 'No answer selected'}
                          </span>
                        </div>

                        {!result.is_correct && (
                          <div className="text-sm">
                            <span className="font-medium">Correct answer: </span>
                            <span className="text-green-700">{result.correct_option}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
