import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured in environment variables.")
    }

    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error(" Error fetching Google Maps API key:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
    return NextResponse.json({ error: "Could not retrieve API key.", details: errorMessage }, { status: 500 })
  }
}
