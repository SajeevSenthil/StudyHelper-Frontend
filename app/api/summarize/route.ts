import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")
    
    let backendResponse: Response

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload - use /summarize/file endpoint
      const formData = await request.formData()
      
      backendResponse = await fetch(`${BACKEND_URL}/summarize/file`, {
        method: "POST",
        body: formData,
      })
    } else {
      // Handle text summarization - use /summarize/text endpoint
      const body = await request.json()
      
      backendResponse = await fetch(`${BACKEND_URL}/summarize/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    }

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to process content" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Summarization error:", error)
    return NextResponse.json({ error: "Failed to process content" }, { status: 500 })
  }
}


