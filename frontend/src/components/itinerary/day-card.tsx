'use client'

import { RefreshCw } from 'lucide-react'
import { ActivitySlot } from './activity-slot'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  slot: string
  title: string
  description: string | null
  duration_minutes: number | null
  cost_estimate: number | null
}

interface Day {
  id: string
  day_number: number
  date: string
  restaurant_name: string | null
  restaurant_description: string | null
  transport_note: string | null
  activities: Activity[]
}

interface DayCardProps {
  day: Day
  tripId: string
  onRegenerate: (dayNumber: number) => void
  isRegenerating: boolean
  isNew?: boolean
}

export function DayCard({ day, tripId, onRegenerate, isRegenerating, isNew }: DayCardProps) {
  const date = new Date(day.date + 'T00:00:00')
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const orderedActivities = ['morning', 'afternoon', 'evening']
    .map((slot) => day.activities.find((a) => a.slot === slot))
    .filter(Boolean) as Activity[]

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all',
        isNew && 'animate-in fade-in slide-in-from-bottom-4 duration-500',
        isRegenerating && 'opacity-60'
      )}
    >
      {/* Day header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Day {day.day_number}
          </span>
          <h3 className="text-sm font-bold text-gray-900 mt-0.5">{dateLabel}</h3>
        </div>
        <button
          onClick={() => onRegenerate(day.day_number)}
          disabled={isRegenerating}
          title="Regenerate this day"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-40 p-1.5 rounded-lg hover:bg-indigo-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
          <span className="hidden sm:inline">{isRegenerating ? 'Regenerating…' : 'Regenerate'}</span>
        </button>
      </div>

      {/* Activities */}
      <div className="px-5 pt-2 pb-3">
        {orderedActivities.map((activity) => (
          <ActivitySlot key={activity.id} activity={activity} tripId={tripId} />
        ))}
      </div>

      {/* Restaurant + transport footer */}
      {(day.restaurant_name || day.transport_note) && (
        <div className="px-5 pb-4 space-y-1.5 border-t border-gray-50 pt-3">
          {day.restaurant_name && (
            <div className="flex gap-2 text-xs text-gray-600">
              <span>🍽️</span>
              <div>
                <span className="font-medium">{day.restaurant_name}</span>
                {day.restaurant_description && (
                  <span className="text-gray-400 ml-1">— {day.restaurant_description}</span>
                )}
              </div>
            </div>
          )}
          {day.transport_note && (
            <div className="flex gap-2 text-xs text-gray-600">
              <span>🚌</span>
              <span>{day.transport_note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
