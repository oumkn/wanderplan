import { streamText } from './ai.js'

interface ActivityResult {
  slot: 'morning' | 'afternoon' | 'evening'
  title: string
  description: string
  durationMinutes: number
  costEstimate: number
}

export interface DayResult {
  dayNumber: number
  date: string
  restaurantName: string
  restaurantDescription: string
  transportNote: string
  activities: ActivityResult[]
}

const DAY_DELIMITER = '---DAY---'

export async function* streamItinerary(params: {
  destination: string
  startDate: string
  endDate: string
  groupSize: number
  travelStyles: string[]
  excludeDayNumbers?: number[]
}): AsyncGenerator<DayResult> {
  const start = new Date(params.startDate)
  const end = new Date(params.endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const excludeNote =
    params.excludeDayNumbers && params.excludeDayNumbers.length > 0
      ? `Only generate days NOT in this list: ${params.excludeDayNumbers.join(', ')}.`
      : ''

  const systemPrompt = `You are a travel itinerary expert. Output each day as a JSON object on its own, separated by the delimiter "${DAY_DELIMITER}". No markdown, no explanation — just alternating JSON and delimiters.`

  const prompt = `Create a ${totalDays}-day itinerary for ${params.destination}.
Travel dates: ${params.startDate} to ${params.endDate}
Group size: ${params.groupSize} people
Travel styles: ${params.travelStyles.join(', ')}
${excludeNote}

For each day, output a JSON object followed by "${DAY_DELIMITER}":
{
  "dayNumber": number,
  "date": "YYYY-MM-DD",
  "restaurantName": "string",
  "restaurantDescription": "string",
  "transportNote": "string",
  "activities": [
    {
      "slot": "morning",
      "title": "string",
      "description": "string",
      "durationMinutes": number,
      "costEstimate": number
    },
    { "slot": "afternoon", ... },
    { "slot": "evening", ... }
  ]
}
${DAY_DELIMITER}

Generate all ${totalDays} days.`

  let buffer = ''

  for await (const chunk of streamText(prompt, systemPrompt)) {
    buffer += chunk

    // Extract complete day objects from buffer
    const parts = buffer.split(DAY_DELIMITER)

    // All parts except last are complete (last may be incomplete)
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].trim()
      if (!part) continue

      try {
        // Find JSON object in the part
        const jsonMatch = part.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const day = JSON.parse(jsonMatch[0]) as DayResult
          yield day
        }
      } catch {
        // Partial JSON, skip
      }
    }

    // Keep the last (potentially incomplete) part in buffer
    buffer = parts[parts.length - 1]
  }

  // Handle any remaining content
  if (buffer.trim()) {
    try {
      const jsonMatch = buffer.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const day = JSON.parse(jsonMatch[0]) as DayResult
        yield day
      }
    } catch {
      // Ignore incomplete final chunk
    }
  }
}
