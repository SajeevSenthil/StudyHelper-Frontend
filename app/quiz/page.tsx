"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
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

export default function QuizPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Get quiz data from URL params or sessionStorage
    const quizId = searchParams.get("id")
    if (quizId) {
      const storedQuiz = sessionStorage.getItem(`quiz_${quizId}`)
      if (storedQuiz) {
        const quizData = JSON.parse(storedQuiz)
        setQuiz(quizData)
        setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
        setSelectedAnswers(new Array(quizData.questions.length).fill(-1))
      } else {
        router.push("/quizzes")
      }
    } else {
      router.push("/quizzes")
    }
  }, [user, isLoading, router, searchParams])

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmitQuiz()
    }
  }, [timeLeft, isCompleted])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = () => {
    if (!quiz) return

    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)
    setScore(finalScore)
    setIsCompleted(true)

    // Save quiz result
    const result = {
      quizId: quiz.id,
      title: quiz.title,
      score: finalScore,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      completedAt: new Date().toISOString(),
    }

    fetch("/api/save-quiz-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })

    toast({
      title: "Quiz Completed!",
      description: `You scored ${finalScore}% (${correctAnswers}/${quiz.questions.length})`,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading || !quiz) {
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

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-6xl font-bold text-blue-600">{score}%</div>
                <p className="text-lg text-gray-600">
                  You got{" "}
                  {
                    quiz.questions.filter((_, index) => selectedAnswers[index] === quiz.questions[index].correctAnswer)
                      .length
                  }{" "}
                  out of {quiz.questions.length} questions correct
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push("/quizzes")}>Take Another Quiz</Button>
                  <Button variant="outline" onClick={() => router.push("/past-quizzes")}>
                    View Past Quizzes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmitQuiz} disabled={selectedAnswers[currentQuestion] === -1}>
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} disabled={selectedAnswers[currentQuestion] === -1}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
