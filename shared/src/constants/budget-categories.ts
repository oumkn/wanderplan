import type { BudgetCategory } from '../types/trip'

export interface BudgetCategoryDefinition {
  value: BudgetCategory
  label: string
  emoji: string
}

export const BUDGET_CATEGORIES: BudgetCategoryDefinition[] = [
  { value: 'flights', label: 'Flights', emoji: '✈️' },
  { value: 'accommodation', label: 'Accommodation', emoji: '🏨' },
  { value: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { value: 'activities', label: 'Activities', emoji: '🎯' },
  { value: 'local_transport', label: 'Local Transport', emoji: '🚌' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'miscellaneous', label: 'Miscellaneous', emoji: '💡' },
]
