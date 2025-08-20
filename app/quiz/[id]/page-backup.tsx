"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"

interface QuizOption {
  id: string
  text: string
}

interface QuizResult {
  success: boolean
  user_quiz_id: number
  score: number
  total_marks: number
  percentage: number
  feedback: string
  quiz_topic: string
  detailed_results: DetailedResult[]
  message: string
}

interface DetailedResult {
  question_id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  user_selected: string | null
  is_correct: boolean
}

interface Question {
  id: number
  question: string
  options: QuizOption[]
  questionOrder: number
  maxMarks: number
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
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]) // Changed to string array for option IDs
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.id}`)
        if (response.ok) {
          const quizData = await response.json()
          setQuiz(quizData)
          setSelectedAnswers(new Array(quizData.questions.length).fill(""))
        } else {
          toast({
            title: "Error",
            description: "Failed to load quiz",
            variant: "destructive",
          })
          router.push("/quizzes")
        }
      } catch (error) {
        console.error("Quiz fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        })
        router.push("/quizzes")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQuiz()
    }
  }, [params.id, router, toast])

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionId
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
    setShowSaveDialog(true)
  }

  const handleSaveAndSubmitQuiz = async () => {
    if (!quiz || !quizTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your quiz",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Convert answers to the format expected by backend
    const backendAnswers = selectedAnswers.map((selectedOption, index) => ({
      question_id: quiz.questions[index].id,
      selected_option: selectedOption || null
    }))

    // Save quiz result to backend
    try {
      const response = await fetch("/api/save-quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: parseInt(quiz.id),
          user_id: 1, // Default user ID, should be from auth context
          answers: backendAnswers,
          doc_id: 1, // This should come from the quiz data
          quiz_title: quizTitle.trim()
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setQuizResults(result)
        setShowSaveDialog(false)
        setShowResults(true)
        toast({
          title: "Success",
          description: "Quiz submitted and saved successfully!",
        })
      } else {
        throw new Error("Failed to submit quiz")
      }
    } catch (error) {
      console.error("Failed to save quiz result:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[600px]">
          {!showResults && !showSaveDialog ? (
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{quiz.title}</CardTitle>
                  <span className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{quiz.questions[currentQuestionIndex].question}</h3>
                  <div className="space-y-2">
                    {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors ${
                          selectedAnswers[currentQuestionIndex] === option.id
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>Next</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : showSaveDialog ? (
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="quiz-title" className="block text-sm font-medium mb-2">
                    Enter a title for your quiz:
                  </label>
                  <Input
                    id="quiz-title"
                    type="text"
                    placeholder="e.g., Math Quiz - Chapter 1"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAndSubmitQuiz}
                    disabled={isSaving || !quizTitle.trim()}
                    className="flex-1"
                  >
                    {isSaving ? "Saving..." : "Save & Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : quizResults ? (
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">Quiz Results</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round((quizResults.score / quizResults.total_marks) * 100)}%
                </div>
                <p className="text-gray-600">
                  You scored {quizResults.score} out of {quizResults.total_marks} questions correctly
                </p>
              </CardHeader>
              
              <CardContent>
                {/* Performance Feedback */}
                <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h3 className="font-semibold text-lg mb-2">Performance</h3>
                  <p className="text-gray-700">
                    {Math.round((quizResults.score / quizResults.total_marks) * 100) >= 80 
                      ? "Excellent work! You have a strong understanding of the material."
                      : Math.round((quizResults.score / quizResults.total_marks) * 100) >= 60
                      ? "Good job! There's room for improvement in some areas."
                      : "Keep studying! Review the material and try again."}
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Detailed Results</h3>
                  {quizResults.detailed_results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex-1">
                          {index + 1}. {result.question_text}
                        </h4>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          result.is_correct 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.is_correct ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* Show user's answer */}
                        <div className="text-sm">
                          <span className="font-medium">Your answer: </span>
                          <span className={result.is_correct ? 'text-green-700' : 'text-red-700'}>
                            {result.user_selected || 'No answer selected'}
                          </span>
                        </div>

                        {/* Show correct answer if user was wrong */}
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

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 pt-6 border-t">
                  <Button
                    onClick={() => {
                      setShowResults(false)
                      setQuizResults(null)
                      setSelectedAnswers([])
                      setCurrentQuestionIndex(0)
                      setQuizTitle("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake Quiz
                  </Button>
                  <Button
                    onClick={() => router.push('/past-quizzes')}
                    className="flex-1"
                  >
                    View Past Quizzes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Quiz Completed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">✓</div>
                  <h3 className="text-xl font-semibold mb-2">Quiz Submitted Successfully</h3>
                  <p className="text-gray-600 mb-4">
                    Your answers have been recorded and your results are being processed.
                  </p>
                  <p className="text-sm text-gray-500">
                    You answered {selectedAnswers.filter(answer => answer !== "").length} out of {quiz.questions.length} questions.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
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
