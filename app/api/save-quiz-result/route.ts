import { type NextRequest, NextResponse } from "next/server"

// Mock storage for quiz results (in a real app, this would be a database)
const quizResults: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quizId, title, score, totalQuestions, answers, completedAt } = body

    const result = {
      id: `result_${Date.now()}`,
      quizId,
      title,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      answers,
      completedAt,
    }

    quizResults.push(result)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Save quiz result error:", error)
    return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 })
  }
}
