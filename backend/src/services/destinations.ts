import { generateJSON } from './ai.js'

interface DestinationResult {
  countryName: string
  countryCode: string
  flagEmoji: string
  visaType: 'visa-free' | 'visa-on-arrival' | 'e-visa'
  bestMonths: string[]
  vibeTags: string[]
  costRangeLow: number
  costRangeHigh: number
  costCurrency: string
  rank: number
}

export async function generateDestinations(params: {
  nationality: string
  travelStyles: string[]
  startDate: string
  endDate: string
  groupSize: number
  budgetAmount: number
}): Promise<DestinationResult[]> {
  const systemPrompt = `You are a travel expert. Return ONLY a valid JSON array with no markdown, no explanation — just the raw JSON array. Never include markdown code blocks.`

  const prompt = `Generate exactly 6 travel destination recommendations for:
- Passport nationality: ${params.nationality}
- Travel styles: ${params.travelStyles.join(', ')}
- Travel dates: ${params.startDate} to ${params.endDate}
- Group size: ${params.groupSize} people
- Total budget: $${params.budgetAmount} USD

Return a JSON array of exactly 6 objects, ranked from most to least suitable. Each object must have:
{
  "countryName": "string",
  "countryCode": "ISO 2-letter code",
  "flagEmoji": "flag emoji",
  "visaType": "visa-free" | "visa-on-arrival" | "e-visa",
  "bestMonths": ["Month1", "Month2"],
  "vibeTags": ["tag1", "tag2", "tag3"],
  "costRangeLow": number (per person in USD),
  "costRangeHigh": number (per person in USD),
  "costCurrency": "USD",
  "rank": number (1-6)
}

Filter visa types based on the traveler's passport nationality. Prioritize visa-free and visa-on-arrival destinations. Consider seasonal weather for the given travel dates. Match destinations to the stated travel styles.`

  const result = await generateJSON<DestinationResult[]>(prompt, systemPrompt)

  if (!Array.isArray(result) || result.length === 0) {
    throw new Error('AI returned invalid destinations format')
  }

  return result.slice(0, 6)
}
