import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Summary ID required" }, { status: 400 })
    }

    // Call backend to delete the specific document
    const backendResponse = await fetch(`${BACKEND_URL}/documents/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      console.error("Backend delete error:", errorData)
      return NextResponse.json(
        { error: "Failed to delete summary" }, 
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    
    return NextResponse.json({
      success: true,
      message: result.message || "Summary deleted successfully",
      deleted_doc_id: result.deleted_doc_id
    })
  } catch (error) {
    console.error("Delete summary error:", error)
    return NextResponse.json({ error: "Failed to delete summary" }, { status: 500 })
  }
}
