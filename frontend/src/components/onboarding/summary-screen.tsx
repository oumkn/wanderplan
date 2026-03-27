'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { NATIONALITIES, TRAVEL_STYLES } from '@wanderplan/shared'
import { apiPost } from '@/lib/api'
import { toast } from 'sonner'

export function SummaryScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const store = useOnboardingStore()

  const flag = NATIONALITIES.find((n) => n.code === store.nationality)?.flag ?? ''

  const tripDays =
    store.startDate && store.endDate
      ? Math.ceil(
          (new Date(store.endDate).getTime() - new Date(store.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : null

  const styleLabels = store.travelStyles
    .map((s) => TRAVEL_STYLES.find((t) => t.value === s))
    .filter(Boolean)

  async function handleFindDestinations() {
    setLoading(true)
    try {
      const trip = await apiPost<{ id: string }>('/api/v1/trips', {
        nationality: store.nationality,
        travelStyles: store.travelStyles,
        startDate: store.startDate,
        endDate: store.endDate,
        groupSize: store.groupSize,
        budgetAmount: store.budgetAmount,
        budgetCurrency: store.budgetCurrency,
      })
      store.reset()
      router.push(`/discover/${trip.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create trip')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900">Review your trip</h1>
          <p className="mt-2 text-gray-500">
            Everything look good? We&apos;ll find your perfect destinations.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Passport */}
          <SummaryRow
            emoji="🛂"
            label="Passport"
            value={`${flag} ${store.nationalityLabel}`}
            onEdit={() => store.goToStep(1)}
          />

          {/* Travel styles */}
          <SummaryRow
            emoji="✨"
            label="Travel style"
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                {styleLabels.map((s) => (
                  <span
                    key={s!.value}
                    className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                  >
                    {s!.emoji} {s!.label}
                  </span>
                ))}
              </div>
            }
            onEdit={() => store.goToStep(2)}
          />

          {/* Dates */}
          <SummaryRow
            emoji="📅"
            label="Dates"
            value={
              <div className="text-right">
                <div className="font-medium">
                  {store.startDate} → {store.endDate}
                </div>
                {tripDays && (
                  <div className="text-xs text-gray-500">{tripDays} days</div>
                )}
              </div>
            }
            onEdit={() => store.goToStep(3)}
          />

          {/* Group size */}
          <SummaryRow
            emoji="👥"
            label="Group size"
            value={`${store.groupSize} ${store.groupSize === 1 ? 'person' : 'people'}`}
            onEdit={() => store.goToStep(3)}
          />

          {/* Budget */}
          <SummaryRow
            emoji="💰"
            label="Budget"
            value={
              <div className="text-right">
                <div className="font-medium">${store.budgetAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  ≈ ${Math.round(store.budgetAmount / store.groupSize).toLocaleString()}/person
                </div>
              </div>
            }
            onEdit={() => store.goToStep(3)}
          />
        </div>

        <Button
          onClick={handleFindDestinations}
          className="w-full mt-6 h-12 text-base bg-indigo-600 hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Finding destinations…' : '✈️ Find Destinations'}
        </Button>

        <Button
          variant="ghost"
          onClick={() => store.prevStep()}
          className="w-full mt-2 text-gray-500"
        >
          Back
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({
  emoji,
  label,
  value,
  onEdit,
}: {
  emoji: string
  label: string
  value: React.ReactNode
  onEdit: () => void
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span className="text-xl mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-0.5 flex-shrink-0"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    </div>
  )
}
