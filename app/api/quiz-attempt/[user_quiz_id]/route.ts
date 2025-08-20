import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function GET(
  request: NextRequest,
  { params }: { params: { user_quiz_id: string } }
) {
  try {
    const userQuizId = params.user_quiz_id
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/quiz/attempt/${userQuizId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to retrieve quiz attempt details" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Quiz attempt details error:", error)
    return NextResponse.json({ error: "Failed to retrieve quiz attempt details" }, { status: 500 })
  }
}
