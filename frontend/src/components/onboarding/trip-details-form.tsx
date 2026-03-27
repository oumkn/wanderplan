'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function TripDetailsForm() {
  const {
    startDate,
    endDate,
    groupSize,
    budgetAmount,
    setStartDate,
    setEndDate,
    setGroupSize,
    setBudgetAmount,
    nextStep,
    prevStep,
  } = useOnboardingStore()

  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!startDate) newErrors.startDate = 'Start date is required.'
    if (!endDate) newErrors.endDate = 'End date is required.'
    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = 'End date must be after start date.'
    }
    if (startDate && startDate < today) {
      newErrors.startDate = 'Start date must be in the future.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleContinue() {
    if (validate()) nextStep()
  }

  const tripDays =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      : null

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-2xl font-bold text-gray-900">Trip details</h1>
          <p className="mt-2 text-gray-500">When are you going, and what&apos;s your budget?</p>
        </div>

        <div className="space-y-6">
          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Travel dates</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <Input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setErrors((prev) => ({ ...prev, startDate: '' }))
                  }}
                  className={errors.startDate ? 'border-red-400' : ''}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setErrors((prev) => ({ ...prev, endDate: '' }))
                  }}
                  className={errors.endDate ? 'border-red-400' : ''}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
            {tripDays && tripDays > 0 && (
              <p className="mt-2 text-sm text-indigo-600 font-medium">
                {tripDays} {tripDays === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>

          {/* Group size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group size
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-40"
                disabled={groupSize <= 1}
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-gray-900">{groupSize}</span>
                <p className="text-sm text-gray-500">{groupSize === 1 ? 'person' : 'people'}</p>
              </div>
              <button
                onClick={() => setGroupSize(Math.min(20, groupSize + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-40"
                disabled={groupSize >= 20}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Total budget</label>
              <span className="text-lg font-bold text-indigo-700">
                ${budgetAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={20000}
              step={100}
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="w-full h-2 accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">$500</span>
              <span className="text-xs text-gray-400">$20,000</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ≈ ${Math.round(budgetAmount / groupSize).toLocaleString()} per person
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
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
