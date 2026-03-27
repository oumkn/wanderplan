'use client'

import { useState } from 'react'
import { Clock, DollarSign, Check, Loader2 } from 'lucide-react'
import { apiPatch } from '@/lib/api'
import { useDebounce } from '@/hooks/use-debounce'

interface Activity {
  id: string
  slot: string
  title: string
  description: string | null
  duration_minutes: number | null
  cost_estimate: number | null
}

const SLOT_LABEL: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
}

type SaveState = 'idle' | 'saving' | 'saved'

export function ActivitySlot({
  activity,
  tripId,
}: {
  activity: Activity
  tripId: string
}) {
  const [title, setTitle] = useState(activity.title)
  const [description, setDescription] = useState(activity.description ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const save = useDebounce(async (t: string, d: string) => {
    setSaveState('saving')
    try {
      await apiPatch(`/api/v1/trips/${tripId}/itinerary/activities/${activity.id}`, {
        title: t,
        description: d,
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('idle')
    }
  }, 500)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    save(e.target.value, description)
  }

  function handleDescChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value)
    save(title, e.target.value)
  }

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-gray-400 min-w-[80px] pt-0.5">
          {SLOT_LABEL[activity.slot] ?? activity.slot}
        </span>

        <div className="flex-1 min-w-0">
          <input
            className="w-full text-sm font-semibold text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none py-0.5 transition-colors"
            value={title}
            onChange={handleTitleChange}
          />
          <textarea
            className="w-full text-xs text-gray-500 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none py-0.5 resize-none transition-colors mt-0.5"
            value={description}
            onChange={handleDescChange}
            rows={2}
          />

          <div className="flex items-center gap-3 mt-1">
            {activity.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {activity.duration_minutes} min
              </span>
            )}
            {activity.cost_estimate && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <DollarSign className="w-3 h-3" />
                ${activity.cost_estimate}
              </span>
            )}
          </div>
        </div>

        <div className="w-4 flex-shrink-0 pt-0.5">
          {saveState === 'saving' && (
            <Loader2 className="w-3.5 h-3.5 text-gray-300 animate-spin" />
          )}
          {saveState === 'saved' && (
            <Check className="w-3.5 h-3.5 text-green-500" />
          )}
        </div>
      </div>
    </div>
  )
}
