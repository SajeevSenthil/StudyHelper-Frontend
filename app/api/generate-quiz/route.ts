import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")
    
    let backendResponse: Response

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload - use /quiz/generate/file endpoint
      const formData = await request.formData()
      
      backendResponse = await fetch(`${BACKEND_URL}/quiz/generate/file`, {
        method: "POST",
        body: formData,
      })
    } else {
      // Handle topic-based quiz - use /quiz/generate endpoint
      const body = await request.json()
      
      // Transform frontend format to backend format
      const backendData = {
        topic: body.topic,
        content: body.content,
        quiz_type: body.type || "topic" // Map "type" to "quiz_type"
      }
      
      backendResponse = await fetch(`${BACKEND_URL}/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      })
    }

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate quiz" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    
    // Transform backend response to frontend format
    const frontendQuiz = {
      id: result.quiz_id?.toString() || Date.now().toString(),
      title: `Quiz: ${result.topic}`,
      questions: result.total_questions || 0,
      timeLimit: 10, // Default 10 minutes
      topic: result.topic,
      quiz_id: result.quiz_id,
      doc_id: result.doc_id
    }

    return NextResponse.json(frontendQuiz)
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}


