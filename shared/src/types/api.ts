import type { Destination, ItineraryDay, BudgetItem, TripWithDetails } from './trip'
import type { WizardState } from './onboarding'

// Request types
export interface CreateTripRequest {
  nationality: string
  travelStyles: string[]
  startDate: string
  endDate: string
  groupSize: number
  budgetAmount: number
  budgetCurrency?: string
}

export interface UpdateTripRequest {
  nationality?: string
  travelStyles?: string[]
  startDate?: string
  endDate?: string
  groupSize?: number
  budgetAmount?: number
  status?: string
}

export interface SelectDestinationRequest {
  destinationId: string
}

export interface UpdateActivityRequest {
  title?: string
  description?: string
}

export interface UpdateBudgetItemRequest {
  actualAmount: number
}

// Response types
export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
  code: string
}

export interface DiscoverDestinationsResponse {
  destinations: Destination[]
}

export interface ItineraryResponse {
  days: ItineraryDay[]
}

export interface BudgetResponse {
  items: BudgetItem[]
}

export interface ShareResponse {
  trip: TripWithDetails
}
