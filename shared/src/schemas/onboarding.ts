import { z } from 'zod'

export const TravelStyleSchema = z.enum([
  'adventure',
  'leisure',
  'instagrammable',
  'foodie',
  'cultural',
])

export const CreateTripSchema = z.object({
  nationality: z.string().min(1, 'Passport nationality is required'),
  travelStyles: z
    .array(TravelStyleSchema)
    .min(1, 'Select at least one travel style'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  groupSize: z.number().int().min(1).max(20),
  budgetAmount: z.number().min(100),
  budgetCurrency: z.string().default('USD'),
})

export const WizardStateSchema = z.object({
  nationality: z.string(),
  nationalityLabel: z.string(),
  travelStyles: z.array(TravelStyleSchema),
  startDate: z.string(),
  endDate: z.string(),
  groupSize: z.number(),
  budgetAmount: z.number(),
  budgetCurrency: z.string(),
  currentStep: z.number(),
})
