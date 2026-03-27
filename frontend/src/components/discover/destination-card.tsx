'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { VisaBadge } from './visa-badge'
import type { VisaType } from '@wanderplan/shared'

interface DestinationCardProps {
  destination: {
    id: string
    countryName: string
    flagEmoji: string
    visaType: VisaType
    bestMonths: string[]
    vibeTags: string[]
    costRangeLow: number | null
    costRangeHigh: number | null
    costCurrency: string
  }
  onSelect: (id: string) => Promise<void>
}

export function DestinationCard({ destination: d, onSelect }: DestinationCardProps) {
  const [selecting, setSelecting] = useState(false)

  async function handleSelect() {
    setSelecting(true)
    await onSelect(d.id)
    setSelecting(false)
  }

  const costRange =
    d.costRangeLow && d.costRangeHigh
      ? `$${d.costRangeLow.toLocaleString()} – $${d.costRangeHigh.toLocaleString()} per person`
      : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 transition-all">
      {/* Header: flag + country */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{d.flagEmoji}</span>
        <div>
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{d.countryName}</h3>
          <VisaBadge visaType={d.visaType} />
        </div>
      </div>

      {/* Best months */}
      {d.bestMonths.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Best time to visit</div>
          <div className="text-sm text-gray-700">{d.bestMonths.join(', ')}</div>
        </div>
      )}

      {/* Vibe tags */}
      {d.vibeTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {d.vibeTags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Cost range */}
      {costRange && (
        <div className="text-sm font-medium text-gray-700">💰 {costRange}</div>
      )}

      {/* Visa disclaimer */}
      <p className="text-xs text-gray-400 border-t border-gray-50 pt-3">
        ⚠️ Visa requirements may change. Always verify with the official embassy before travel.
      </p>

      {/* Select button */}
      <Button
        onClick={handleSelect}
        disabled={selecting}
        className="w-full mt-auto"
        variant="outline"
      >
        {selecting ? 'Selecting…' : `Choose ${d.countryName}`}
      </Button>
    </div>
  )
}
