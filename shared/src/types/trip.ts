import type { TravelStyle } from './onboarding'

export type TripStatus = 'draft' | 'planning' | 'complete'
export type VisaType = 'visa-free' | 'visa-on-arrival' | 'e-visa'
export type ActivitySlot = 'morning' | 'afternoon' | 'evening'
export type BudgetCategory =
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'local_transport'
  | 'shopping'
  | 'miscellaneous'

export interface Trip {
  id: string
  userId: string
  shareToken: string
  status: TripStatus
  nationality: string | null
  travelStyles: TravelStyle[]
  startDate: string | null
  endDate: string | null
  groupSize: number
  budgetAmount: number | null
  budgetCurrency: string
  destinationCountry: string | null
  destinationFlag: string | null
  visaType: VisaType | null
  createdAt: string
  updatedAt: string
}

export interface Destination {
  id: string
  tripId: string
  countryName: string
  countryCode: string
  flagEmoji: string
  visaType: VisaType
  bestMonths: string[]
  vibeTags: string[]
  costRangeLow: number | null
  costRangeHigh: number | null
  costCurrency: string
  rank: number
  selected: boolean
  createdAt: string
}

export interface Activity {
  id: string
  dayId: string
  slot: ActivitySlot
  title: string
  description: string | null
  durationMinutes: number | null
  costEstimate: number | null
  costCurrency: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ItineraryDay {
  id: string
  tripId: string
  dayNumber: number
  date: string
  restaurantName: string | null
  restaurantDescription: string | null
  transportNote: string | null
  activities: Activity[]
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  tripId: string
  category: BudgetCategory
  estimatedAmount: number
  actualAmount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface TripWithDetails extends Trip {
  destinations: Destination[]
  itinerary: ItineraryDay[]
  budget: BudgetItem[]
}
