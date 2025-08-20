import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the backend quiz submit endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to save quiz result" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Save quiz result error:", error)
    return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 })
  }
}
