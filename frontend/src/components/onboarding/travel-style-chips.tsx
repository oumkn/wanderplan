'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { TRAVEL_STYLES } from '@wanderplan/shared'
import type { TravelStyle } from '@wanderplan/shared'

export function TravelStyleChips() {
  const [error, setError] = useState('')
  const { travelStyles, toggleTravelStyle, nextStep, prevStep } = useOnboardingStore()

  function handleToggle(style: TravelStyle) {
    toggleTravelStyle(style)
    setError('')
  }

  function handleContinue() {
    if (travelStyles.length === 0) {
      setError('Please select at least one travel style.')
      return
    }
    nextStep()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-2xl font-bold text-gray-900">How do you like to travel?</h1>
          <p className="mt-2 text-gray-500">Pick everything that fits. You can select multiple.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = travelStyles.includes(style.value)
            return (
              <button
                key={style.value}
                onClick={() => handleToggle(style.value)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span className="text-3xl">{style.emoji}</span>
                <div>
                  <div
                    className={cn(
                      'font-semibold',
                      isSelected ? 'text-indigo-700' : 'text-gray-900'
                    )}
                  >
                    {style.label}
                  </div>
                  <div className="text-sm text-gray-500">{style.description}</div>
                </div>
                <div
                  className={cn(
                    'ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                  )}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
            Back
          </Button>
          <Button onClick={handleContinue} className="flex-1 h-12 text-base">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
