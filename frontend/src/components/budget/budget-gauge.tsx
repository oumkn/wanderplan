'use client'

import { cn } from '@/lib/utils'

interface BudgetGaugeProps {
  actual: number
  budget: number
}

export function BudgetGauge({ actual, budget }: BudgetGaugeProps) {
  const percent = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0
  const overBudget = actual > budget
  const remaining = budget - actual

  const barColor = overBudget
    ? 'bg-red-500'
    : percent >= 80
    ? 'bg-amber-400'
    : 'bg-green-500'

  const textColor = overBudget ? 'text-red-600' : percent >= 80 ? 'text-amber-600' : 'text-green-600'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Budget</h3>
        <span className={cn('text-sm font-bold', textColor)}>
          {overBudget
            ? `$${Math.abs(remaining).toLocaleString()} over`
            : `$${remaining.toLocaleString()} left`}
        </span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>${actual.toLocaleString()} spent</span>
        <span>${budget.toLocaleString()} budget</span>
      </div>
    </div>
  )
}
