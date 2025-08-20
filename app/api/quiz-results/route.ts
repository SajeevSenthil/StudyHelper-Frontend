import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id") || "1" // Default user ID
    
    // Forward the request to the backend using the correct endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/quiz/attempts/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch quiz results" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch quiz results error:", error)
    return NextResponse.json({ error: "Failed to fetch quiz results" }, { status: 500 })
  }
}
