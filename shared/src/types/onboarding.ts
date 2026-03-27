export type TravelStyle = 'adventure' | 'leisure' | 'instagrammable' | 'foodie' | 'cultural'

export interface WizardState {
  nationality: string
  nationalityLabel: string
  travelStyles: TravelStyle[]
  startDate: string
  endDate: string
  groupSize: number
  budgetAmount: number
  budgetCurrency: string
  currentStep: number
}
