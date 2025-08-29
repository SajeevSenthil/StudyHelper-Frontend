import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params

    const backendResponse = await fetch(`${BACKEND_URL}/quiz/${quizId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch quiz" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    
    // Transform backend response to frontend format
    const frontendQuiz = {
      id: result.quiz_id?.toString() || quizId,
      title: `Quiz: ${result.topic}`,
      timeLimit: 10, // Default 10 minutes
      questions: result.questions.map((q: any, index: number) => ({
        id: q.question_id || index + 1,
        question: q.question_text,
        options: [
          { id: "A", text: q.option_a },
          { id: "B", text: q.option_b },
          { id: "C", text: q.option_c },
          { id: "D", text: q.option_d }
        ],
        questionOrder: q.question_order,
        maxMarks: q.max_marks || 1
      }))
    }

    return NextResponse.json(frontendQuiz)
  } catch (error) {
    console.error("Quiz fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}
