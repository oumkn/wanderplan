import { notFound } from 'next/navigation'

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

interface BudgetItem {
  id: string
  category: string
  actual_amount: number
  estimated_amount: number
}

interface SharedTrip {
  id: string
  destination_country: string | null
  destination_flag: string | null
  start_date: string | null
  end_date: string | null
  group_size: number
  itinerary: Day[]
  budget: BudgetItem[]
}

const SLOT_LABEL: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
}

async function getSharedTrip(token: string): Promise<SharedTrip | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${apiUrl}/api/v1/share/${token}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data?.trip ?? null
  } catch {
    return null
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const trip = await getSharedTrip(token)

  if (!trip) notFound()

  const totalActual = trip.budget.reduce((s, i) => s + (i.actual_amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{trip.destination_flag ?? '🌍'}</div>
          <h1 className="text-3xl font-bold text-gray-900">{trip.destination_country}</h1>
          {trip.start_date && trip.end_date && (
            <p className="mt-2 text-gray-500">
              {trip.start_date} → {trip.end_date} · {trip.group_size}{' '}
              {trip.group_size === 1 ? 'person' : 'people'}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 shadow-sm">
            <span>🗺️</span> Planned with WanderPlan
          </div>
        </div>

        {/* Itinerary */}
        {trip.itinerary.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-bold text-gray-900">Itinerary</h2>
            {trip.itinerary.map((day) => {
              const date = new Date(day.date + 'T00:00:00')
              const dateLabel = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
              const ordered = ['morning', 'afternoon', 'evening']
                .map((s) => day.activities.find((a) => a.slot === s))
                .filter(Boolean) as Activity[]

              return (
                <div key={day.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Day {day.day_number}</span>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5">{dateLabel}</h3>
                  </div>
                  <div className="px-5 py-3 space-y-3">
                    {ordered.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <span className="text-xs text-gray-400 min-w-[80px] pt-0.5">
                          {SLOT_LABEL[activity.slot]}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(day.restaurant_name || day.transport_note) && (
                    <div className="px-5 pb-4 pt-2 border-t border-gray-50 space-y-1">
                      {day.restaurant_name && (
                        <p className="text-xs text-gray-500">🍽️ <strong>{day.restaurant_name}</strong>{day.restaurant_description ? ` — ${day.restaurant_description}` : ''}</p>
                      )}
                      {day.transport_note && (
                        <p className="text-xs text-gray-500">🚌 {day.transport_note}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Budget summary */}
        {trip.budget.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900">Budget Summary</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {trip.budget.map((item) => (
                <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-gray-700 capitalize">{item.category.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900">
                    ${(item.actual_amount || item.estimated_amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between px-5 py-4 font-bold text-sm bg-gray-50">
                <span>Total</span>
                <span>${totalActual.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Created with WanderPlan · AI-powered travel planning
        </p>
      </div>
    </div>
  )
}
