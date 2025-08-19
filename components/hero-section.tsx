"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Brain, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-indigo-600" />,
      title: "AI Summarization",
      description: "Transform lengthy documents into concise, actionable summaries",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-generated quizzes",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Study Analytics",
      description: "Track your progress and identify areas for improvement",
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Resource Library",
      description: "Access curated study materials and references",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero Content */}
      <div className="text-center mb-16">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StudyHelper
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI-powered study companion that transforms the way you learn. Upload documents, get instant summaries,
            take quizzes, and track your progress all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/summarization">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                Start Summarizing
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button size="lg" variant="outline" className="px-8 py-3 bg-transparent">
                Take a Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-20 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="animate-pulse-slow">
            <div className="text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
            <div className="text-gray-600">Documents Summarized</div>
          </div>
          <div className="animate-pulse-slow" style={{ animationDelay: "0.2s" }}>
            <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
            <div className="text-gray-600">Quizzes Completed</div>
          </div>
          <div className="animate-pulse-slow" style={{ animationDelay: "0.4s" }}>
            <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600">Student Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  )
}
