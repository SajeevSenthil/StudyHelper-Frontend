import { type NextRequest, NextResponse } from "next/server"

// Mock data for demonstration (in real app, this would come from Supabase)
const mockSummaries = [
  {
    id: "1",
    originalText:
      "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells and involves two main stages: the light-dependent reactions and the Calvin cycle. During photosynthesis, plants absorb carbon dioxide from the atmosphere and water from the soil, using sunlight to convert these into glucose and oxygen.",
    summary:
      "Photosynthesis converts light energy to chemical energy in plant chloroplasts through light-dependent reactions and the Calvin cycle, using CO2, water, and sunlight to produce glucose and oxygen.",
    links: [
      "https://www.khanacademy.org/science/biology/photosynthesis-in-plants",
      "https://www.britannica.com/science/photosynthesis",
      "https://www.nationalgeographic.org/encyclopedia/photosynthesis/",
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "2",
    originalText:
      "The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799. Many of its ideas are considered fundamental principles of liberal democracy, while phrases like 'liberté, égalité, fraternité' became rallying cries for other revolutions.",
    summary:
      "The French Revolution (1789-1799) was a transformative period that established liberal democratic principles and popularized ideals like 'liberté, égalité, fraternité' that inspired future revolutions worldwide.",
    links: [
      "https://www.history.com/topics/france/french-revolution",
      "https://www.britannica.com/event/French-Revolution",
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real app, we would query Supabase here
    // For now, return mock data
    console.log("[v0] Fetching summaries for demo user")

    return NextResponse.json({
      summaries: mockSummaries,
      message: "Summaries fetched successfully (mock data - add Supabase integration for real data)",
    })
  } catch (error) {
    console.error("Fetch summaries error:", error)
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 })
  }
}
