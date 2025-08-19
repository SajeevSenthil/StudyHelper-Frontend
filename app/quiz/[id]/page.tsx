"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
  timeLimit: number
}

export default function QuizTakingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Get quiz data from sessionStorage (passed from quiz generation)
    const quizData = sessionStorage.getItem(`quiz_${params.id}`)
    if (quizData) {
      const parsedQuiz = JSON.parse(quizData)
      setQuiz(parsedQuiz)
      setTimeLeft(parsedQuiz.timeLimit * 60)
      setSelectedAnswers(new Array(parsedQuiz.questions.length).fill(-1))
    } else {
      router.push("/quizzes")
    }
    setLoading(false)
  }, [params.id, router])

  useEffect(() => {
    if (quiz && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz && !showResults) {
      handleSubmitQuiz()
    }
  }, [timeLeft, quiz, showResults])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)

    // Save quiz result
    try {
      await fetch("/api/save-quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          title: quiz.title,
          score,
          totalQuestions: quiz.questions.length,
          answers: selectedAnswers,
          completedAt: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Failed to save quiz result:", error)
    }

    setShowResults(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading || isLoading) {
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-8">
              <p className="text-gray-600 mb-4">Quiz not found</p>
              <Button onClick={() => router.push("/quizzes")}>Back to Quizzes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showResults ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{quiz.title}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{formatTime(timeLeft)}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{quiz.questions[currentQuestionIndex].question}</h3>
                  <div className="space-y-2">
                    {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitQuiz}
                      variant="destructive"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>

                    {currentQuestionIndex < quiz.questions.length - 1 && (
                      <Button onClick={handleNextQuestion}>Next</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {selectedAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length} /{" "}
                    {quiz.questions.length}
                  </div>
                  <p className="text-gray-600">
                    Score:{" "}
                    {Math.round(
                      (selectedAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer)
                        .length /
                        quiz.questions.length) *
                        100,
                    )}
                    %
                  </p>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{question.question}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Your answer:{" "}
                            {selectedAnswers[index] !== -1 ? question.options[selectedAnswers[index]] : "Not answered"}
                          </p>
                          {selectedAnswers[index] !== question.correctAnswer && (
                            <p className="text-sm text-green-600 mt-1">
                              Correct answer: {question.options[question.correctAnswer]}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => router.push("/quizzes")} variant="outline">
                    Take Another Quiz
                  </Button>
                  <Button onClick={() => router.push("/past-quizzes")}>View Past Quizzes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
