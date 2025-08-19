import { type NextRequest, NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { summary } = await request.json()

    if (!summary) {
      return NextResponse.json({ error: "No summary provided" }, { status: 400 })
    }

    // Generate mock study resources based on the summary
    const resources = generateMockResources(summary)

    return NextResponse.json({ resources })
  } catch (error) {
    console.error("Resources error:", error)
    return NextResponse.json({ error: "Failed to get resources" }, { status: 500 })
  }
}

function generateMockResources(summary: string) {
  // Mock study resources - in production, this would query real educational databases
  const mockResources = [
    {
      title: "Khan Academy - Comprehensive Study Guide",
      url: "https://www.khanacademy.org",
      description: "Free online courses and practice exercises covering the topics in your summary.",
    },
    {
      title: "Coursera - Related Course Materials",
      url: "https://www.coursera.org",
      description: "University-level courses and specializations related to your study content.",
    },
    {
      title: "MIT OpenCourseWare",
      url: "https://ocw.mit.edu",
      description: "Free lecture notes, exams, and videos from MIT courses on similar topics.",
    },
    {
      title: "Wikipedia - Background Information",
      url: "https://www.wikipedia.org",
      description: "Comprehensive encyclopedia articles providing context and additional details.",
    },
    {
      title: "YouTube Educational Channels",
      url: "https://www.youtube.com/education",
      description: "Video explanations and tutorials from top educational content creators.",
    },
  ]

  // Return 3-4 random resources for variety
  const shuffled = mockResources.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 3)
}
