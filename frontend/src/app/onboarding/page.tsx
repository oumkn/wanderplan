'use client'

import { ProgressBar } from '@/components/shared/progress-bar'
import { NationalitySelect } from '@/components/onboarding/nationality-select'
import { TravelStyleChips } from '@/components/onboarding/travel-style-chips'
import { TripDetailsForm } from '@/components/onboarding/trip-details-form'
import { SummaryScreen } from '@/components/onboarding/summary-screen'
import { useOnboardingStore } from '@/stores/onboarding-store'

const STEPS = ['Passport', 'Style', 'Details', 'Summary']

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((s) => s.currentStep)

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar currentStep={currentStep} totalSteps={4} steps={STEPS} />

      <div className="flex-1">
        {currentStep === 1 && <NationalitySelect />}
        {currentStep === 2 && <TravelStyleChips />}
        {currentStep === 3 && <TripDetailsForm />}
        {currentStep === 4 && <SummaryScreen />}
      </div>
    </div>
  )
}
