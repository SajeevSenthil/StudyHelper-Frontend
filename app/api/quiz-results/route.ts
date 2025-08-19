import { type NextRequest, NextResponse } from "next/server"

// Mock storage for quiz results (in a real app, this would be a database)
const quizResults: any[] = [
  {
    id: "result_1",
    title: "JavaScript Fundamentals",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "result_2",
    title: "React Components",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    completedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "result_3",
    title: "World History",
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    completedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
]

export async function GET(request: NextRequest) {
  try {
    // Sort by completion date (most recent first)
    const sortedResults = quizResults.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )

    return NextResponse.json(sortedResults)
  } catch (error) {
    console.error("Fetch quiz results error:", error)
    return NextResponse.json({ error: "Failed to fetch quiz results" }, { status: 500 })
  }
}
