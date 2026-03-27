'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import { BudgetTable, BudgetTableSkeleton, type BudgetItem } from '@/components/budget/budget-table'
import { BudgetGauge } from '@/components/budget/budget-gauge'
import { PerPersonSplit } from '@/components/budget/per-person-split'
import { toast } from 'sonner'

interface Trip {
  id: string
  group_size: number
  budget_amount: number | null
  status: string
}

interface BudgetData {
  items: BudgetItem[]
}

export default function BudgetPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params
  const router = useRouter()
  const [items, setItems] = useState<BudgetItem[]>([])
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [tripData, budgetData] = await Promise.all([
          apiGet<Trip>(`/api/v1/trips/${tripId}`),
          apiGet<BudgetData>(`/api/v1/trips/${tripId}/budget`),
        ])
        setTrip(tripData)

        if (budgetData.items.length === 0) {
          // Generate budget
          const generated = await apiPost<BudgetData>(`/api/v1/trips/${tripId}/budget/generate`)
          setItems(generated.items)
        } else {
          setItems(budgetData.items)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load budget')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tripId])

  function handleUpdate(itemId: string, actual: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, actual_amount: actual } : item))
    )
  }

  async function handleSaveTrip() {
    setSaving(true)
    try {
      await apiPatch(`/api/v1/trips/${tripId}`, { status: 'complete' })
      toast.success('Trip saved!')
      router.push('/trips')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save trip')
    } finally {
      setSaving(false)
    }
  }

  const totalActual = items.reduce((sum, i) => sum + (i.actual_amount ?? 0), 0)
  const groupSize = trip?.group_size ?? 2
  const budget = trip?.budget_amount ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/trips" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
          <p className="mt-1 text-gray-500 text-sm">
            {loading ? 'Estimating costs for your trip…' : 'Edit actuals as you spend'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Per-person split (sticky at top) */}
          {!loading && (
            <PerPersonSplit total={totalActual} groupSize={groupSize} />
          )}

          {/* Budget gauge */}
          {!loading && budget > 0 && (
            <BudgetGauge actual={totalActual} budget={budget} />
          )}

          {/* Budget table */}
          {loading ? (
            <BudgetTableSkeleton />
          ) : (
            <BudgetTable items={items} tripId={tripId} onUpdate={handleUpdate} />
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Link
              href={`/itinerary/${tripId}`}
              className="flex items-center justify-center flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              ← Itinerary
            </Link>
            {trip?.status !== 'complete' && (
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="flex items-center justify-center flex-1 h-12 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : '🎉 Save Trip'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
