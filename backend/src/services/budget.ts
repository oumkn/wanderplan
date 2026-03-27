import { generateJSON } from './ai.js'
import type { BudgetCategory } from '@wanderplan/shared'

interface BudgetEstimate {
  category: BudgetCategory
  estimatedAmount: number
  currency: string
}

export async function generateBudgetEstimates(params: {
  destination: string
  startDate: string
  endDate: string
  groupSize: number
  totalBudget: number
  travelStyles: string[]
}): Promise<BudgetEstimate[]> {
  const start = new Date(params.startDate)
  const end = new Date(params.endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const systemPrompt = `You are a travel budget expert. Return ONLY a valid JSON array with no markdown.`

  const prompt = `Estimate a travel budget breakdown for:
- Destination: ${params.destination}
- Duration: ${totalDays} days (${params.startDate} to ${params.endDate})
- Group size: ${params.groupSize} people
- Total budget: $${params.totalBudget} USD
- Travel styles: ${params.travelStyles.join(', ')}

Return a JSON array of exactly 7 objects covering these categories:
flights, accommodation, food, activities, local_transport, shopping, miscellaneous

Each object:
{
  "category": "category_name",
  "estimatedAmount": number (total for the group in USD),
  "currency": "USD"
}

The amounts should be realistic for the destination and add up to approximately the total budget.`

  const result = await generateJSON<BudgetEstimate[]>(prompt, systemPrompt)

  if (!Array.isArray(result)) {
    throw new Error('AI returned invalid budget format')
  }

  return result
}
