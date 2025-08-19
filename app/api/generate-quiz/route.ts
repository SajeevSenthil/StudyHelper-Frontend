import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")
    let topic = ""
    let content = ""

    console.log("[v0] Content-Type:", contentType)

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get("file") as File

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Process file content based on type
      if (file.type === "text/plain") {
        content = await file.text()
      } else if (file.type === "application/pdf") {
        // For demo purposes, we'll simulate PDF processing
        content = `Content extracted from PDF: ${file.name}. This would contain the actual PDF text in a real implementation.`
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // For demo purposes, we'll simulate DOCX processing
        content = `Content extracted from DOCX: ${file.name}. This would contain the actual document text in a real implementation.`
      }

      topic = file.name.replace(/\.[^/.]+$/, "") // Remove file extension
    } else {
      // Handle topic-based quiz
      try {
        const rawBody = await request.text()
        console.log("[v0] Raw request body:", rawBody)
        console.log("[v0] Raw body length:", rawBody.length)
        console.log("[v0] First few characters:", rawBody.substring(0, 10))

        if (!rawBody || rawBody.trim() === "") {
          return NextResponse.json({ error: "Empty request body" }, { status: 400 })
        }

        // Try to parse the JSON
        const body = JSON.parse(rawBody)
        console.log("[v0] Parsed body:", body)

        topic = body.topic || ""

        if (!topic) {
          return NextResponse.json({ error: "Topic is required" }, { status: 400 })
        }
      } catch (jsonError) {
        console.error("[v0] JSON parsing error:", jsonError)
        console.error("[v0] Error details:", {
          message: jsonError instanceof Error ? jsonError.message : "Unknown error",
          name: jsonError instanceof Error ? jsonError.name : "Unknown",
        })
        return NextResponse.json(
          {
            error: "Invalid JSON in request body",
            details: jsonError instanceof Error ? jsonError.message : "Unknown parsing error",
          },
          { status: 400 },
        )
      }
    }

    // Validate topic
    if (!topic.trim()) {
      return NextResponse.json({ error: "Topic cannot be empty" }, { status: 400 })
    }

    console.log("[v0] Generating quiz for topic:", topic)

    // Generate mock quiz questions based on topic/content
    const quiz = generateMockQuiz(topic, content)

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("[v0] Quiz generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateMockQuiz(topic: string, content?: string) {
  // This is a mock implementation. In a real app, you'd use AI to generate questions
  const questions = [
    {
      id: 1,
      question: `What is the main concept related to ${topic}?`,
      options: [
        `Primary aspect of ${topic}`,
        `Secondary feature of ${topic}`,
        `Unrelated concept`,
        `Alternative approach to ${topic}`,
      ],
      correctAnswer: 0,
      explanation: `The main concept of ${topic} involves understanding its primary aspects and applications.`,
    },
    {
      id: 2,
      question: `Which of the following best describes ${topic}?`,
      options: [`A complex system`, `A simple process`, `An outdated method`, `A theoretical concept`],
      correctAnswer: 0,
      explanation: `${topic} is typically characterized as a complex system with multiple interconnected components.`,
    },
    {
      id: 3,
      question: `What is a key benefit of understanding ${topic}?`,
      options: [
        `Improved knowledge and skills`,
        `No practical benefits`,
        `Only theoretical value`,
        `Limited applications`,
      ],
      correctAnswer: 0,
      explanation: `Understanding ${topic} provides improved knowledge and practical skills that can be applied in various contexts.`,
    },
    {
      id: 4,
      question: `How does ${topic} relate to modern applications?`,
      options: [
        `Highly relevant and widely used`,
        `Completely obsolete`,
        `Only used in research`,
        `Limited to specific fields`,
      ],
      correctAnswer: 0,
      explanation: `${topic} remains highly relevant and is widely used in modern applications across various industries.`,
    },
    {
      id: 5,
      question: `What should be the next step after learning about ${topic}?`,
      options: [
        `Practice and apply the knowledge`,
        `Forget about it`,
        `Only memorize facts`,
        `Avoid practical application`,
      ],
      correctAnswer: 0,
      explanation: `The best approach after learning about ${topic} is to practice and apply the knowledge in real-world scenarios.`,
    },
  ]

  return {
    id: `quiz_${Date.now()}`,
    title: `Quiz: ${topic}`,
    questions,
    timeLimit: 10, // 10 minutes
  }
}
