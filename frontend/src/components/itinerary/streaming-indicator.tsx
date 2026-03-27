export function StreamingIndicator({ dayNumber }: { dayNumber: number }) {
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 flex items-center gap-4">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">Generating Day {dayNumber}…</p>
        <p className="text-xs text-gray-400">Planning your activities</p>
      </div>
    </div>
  )
}
