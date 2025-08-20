import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/saved-summaries`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch summaries" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch summaries error:", error)
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 })
  }
}
