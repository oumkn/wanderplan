'use client'

const SLOT_LABEL: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
}

interface MappedActivity {
  id: string
  slot: string
  title: string
  cost_estimate: number | null
  latitude: number
  longitude: number
  markerNumber: number
}

interface DayWithMappedActivities {
  id: string
  day_number: number
  date: string
  color: string
  activities: MappedActivity[]
}

interface SidebarProps {
  days: DayWithMappedActivities[]
  selectedActivityId: string | null
  onActivityClick: (lat: number, lng: number, activityId: string) => void
}

export function MapSidebar({ days, selectedActivityId, onActivityClick }: SidebarProps) {
  return (
    <div className="w-full md:w-80 md:flex-shrink-0 overflow-y-auto bg-white border-r border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          {days.length} {days.length === 1 ? 'Day' : 'Days'} · {days.reduce((s, d) => s + d.activities.length, 0)} Places
        </p>
      </div>

      {days.map((day) => {
        const date = new Date(day.date + 'T00:00:00')
        const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

        return (
          <div key={day.id} className="border-b border-gray-50 last:border-0">
            {/* Day header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderLeft: `3px solid ${day.color}` }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: day.color }}
              />
              <div>
                <p className="text-xs font-bold text-gray-900">Day {day.day_number}</p>
                <p className="text-xs text-gray-500">{dateLabel}</p>
              </div>
            </div>

            {/* Activities */}
            <div className="pb-2">
              {day.activities.map((activity) => {
                const isSelected = selectedActivityId === activity.id
                return (
                  <button
                    key={activity.id}
                    onClick={() => onActivityClick(activity.latitude, activity.longitude, activity.id)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-indigo-50' : ''
                    }`}
                  >
                    {/* Numbered circle */}
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                      style={{ backgroundColor: day.color }}
                    >
                      {activity.markerNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{SLOT_LABEL[activity.slot]}</p>
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {activity.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
