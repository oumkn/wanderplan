'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TravelStyle } from '@wanderplan/shared'

interface OnboardingState {
  nationality: string
  nationalityLabel: string
  travelStyles: TravelStyle[]
  startDate: string
  endDate: string
  groupSize: number
  budgetAmount: number
  budgetCurrency: string
  currentStep: number

  setNationality: (code: string, label: string) => void
  toggleTravelStyle: (style: TravelStyle) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setGroupSize: (size: number) => void
  setBudgetAmount: (amount: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  reset: () => void
}

const initialState = {
  nationality: '',
  nationalityLabel: '',
  travelStyles: [] as TravelStyle[],
  startDate: '',
  endDate: '',
  groupSize: 2,
  budgetAmount: 3000,
  budgetCurrency: 'USD',
  currentStep: 1,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setNationality: (code, label) =>
        set({ nationality: code, nationalityLabel: label }),

      toggleTravelStyle: (style) =>
        set((state) => ({
          travelStyles: state.travelStyles.includes(style)
            ? state.travelStyles.filter((s) => s !== style)
            : [...state.travelStyles, style],
        })),

      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      setGroupSize: (size) => set({ groupSize: size }),
      setBudgetAmount: (amount) => set({ budgetAmount: amount }),

      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      goToStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: 'wanderplan-onboarding',
    }
  )
)
