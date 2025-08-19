import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, summary, links } = await request.json()

    if (!summary) {
      return NextResponse.json({ error: "No summary provided" }, { status: 400 })
    }

    // Save to database (for now, we'll simulate this since we haven't set up Supabase yet)
    // In the next task, we'll replace this with actual Supabase integration
    const savedSession = {
      id: Date.now().toString(),
      userId: "demo-user",
      originalText: text || "File upload",
      summary,
      links: JSON.stringify(links || []),
      createdAt: new Date(),
    }

    console.log("[v0] Simulating save to database:", savedSession)

    return NextResponse.json({
      success: true,
      sessionId: savedSession.id,
      message: "Summary saved successfully",
    })
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Failed to save summary" }, { status: 500 })
  }
}
