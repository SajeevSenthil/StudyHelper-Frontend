"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Brain } from "lucide-react"
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

export default function QuizzesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("create")
  const [topic, setTopic] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        })
      }
    }
  }

  const generateQuizFromTopic = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the quiz.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", topic }),
      })

      if (response.ok) {
        const quiz = await response.json()
        sessionStorage.setItem(`quiz_${quiz.id}`, JSON.stringify(quiz))
        router.push(`/quiz/${quiz.id}`)
      } else {
        throw new Error("Failed to generate quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateQuizFromFile = async () => {
    if (!file) {
      toast({
        title: "File required",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "document")

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const quiz = await response.json()
        sessionStorage.setItem(`quiz_${quiz.id}`, JSON.stringify(quiz))
        router.push(`/quiz/${quiz.id}`)
      } else {
        throw new Error("Failed to generate quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz from document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Quizzes</h1>
            <p className="text-xl text-gray-600">Test your knowledge with AI-generated quizzes</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="create">Create Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Topic-based Quiz */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Topic-Based Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Enter a topic</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., World War II, Photosynthesis, JavaScript"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>
                    <Button onClick={generateQuizFromTopic} disabled={isGenerating || !topic.trim()} className="w-full">
                      {isGenerating ? "Generating..." : "Generate Quiz"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Document-based Quiz */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Document-Based Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="file">Upload document</Label>
                      <Input id="file" type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                      {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
                    </div>
                    <Button onClick={generateQuizFromFile} disabled={isGenerating || !file} className="w-full">
                      {isGenerating ? "Generating..." : "Generate Quiz"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
