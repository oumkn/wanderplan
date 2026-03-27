'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { BUDGET_CATEGORIES } from '@wanderplan/shared'
import { useDebounce } from '@/hooks/use-debounce'
import { apiPatch } from '@/lib/api'

export interface BudgetItem {
  id: string
  category: string
  estimated_amount: number
  actual_amount: number
  currency: string
}

interface BudgetTableProps {
  items: BudgetItem[]
  tripId: string
  onUpdate: (itemId: string, actual: number) => void
}

export function BudgetTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BudgetTable({ items, tripId, onUpdate }: BudgetTableProps) {
  const [actuals, setActuals] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, String(i.actual_amount)]))
  )

  const save = useDebounce(async (itemId: string, value: number) => {
    try {
      await apiPatch(`/api/v1/trips/${tripId}/budget/${itemId}`, { actualAmount: value })
    } catch {
      // Fail silently — value is already reflected in UI
    }
  }, 500)

  function handleChange(itemId: string, raw: string) {
    setActuals((prev) => ({ ...prev, [itemId]: raw }))
    const value = parseFloat(raw) || 0
    onUpdate(itemId, value)
    save(itemId, value)
  }

  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(actuals[item.id] ?? '0') || 0)
  }, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-20">Est.</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-24">Actual</span>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const catDef = BUDGET_CATEGORIES.find((c) => c.value === item.category)
          return (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3.5 items-center">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{catDef?.emoji ?? '💡'}</span>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {catDef?.label ?? item.category}
                </span>
              </div>
              <span className="text-sm text-gray-400 text-right w-20">
                ${item.estimated_amount.toLocaleString()}
              </span>
              <div className="w-24">
                <input
                  type="number"
                  min={0}
                  value={actuals[item.id] ?? ''}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  className="w-full text-sm font-semibold text-gray-900 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total row */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 bg-gray-50 border-t border-gray-100">
        <span className="text-sm font-bold text-gray-900">Total</span>
        <span className="text-sm text-gray-400 text-right w-20">
          ${items.reduce((s, i) => s + i.estimated_amount, 0).toLocaleString()}
        </span>
        <span className="text-sm font-bold text-gray-900 text-right w-24">
          ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  )
}
