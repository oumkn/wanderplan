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

  const prompt = `Generate travel destination recommendations for:
- Passport nationality: ${params.nationality}
- Travel styles: ${params.travelStyles.join(', ')}
- Travel dates: ${params.startDate} to ${params.endDate}
- Group size: ${params.groupSize} people
- Total budget: $${params.budgetAmount} USD

Return a JSON array of all destinations that are a genuinely strong match for this traveler — considering visa access for their passport, seasonal weather for the given dates, travel style alignment, and budget fit. Include only countries where visa access is confirmed for this nationality (visa-free, visa-on-arrival, or e-visa). Exclude poor seasonal matches and destinations clearly outside the budget. Maximum 25 results, ranked from best to least suitable. Each object must have:
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
  "rank": number (1 to N)
}`

  const result = await generateJSON<DestinationResult[]>(prompt, systemPrompt)

  if (!Array.isArray(result) || result.length === 0) {
    throw new Error('AI returned invalid destinations format')
  }

  return result.slice(0, 25)
}
