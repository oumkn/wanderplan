interface PerPersonSplitProps {
  total: number
  groupSize: number
}

export function PerPersonSplit({ total, groupSize }: PerPersonSplitProps) {
  const perPerson = groupSize > 0 ? total / groupSize : total

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-700">Per person</p>
          <p className="text-xs text-indigo-400 mt-0.5">{groupSize} people</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-700">
            ${perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-indigo-400">${total.toLocaleString()} total</p>
        </div>
      </div>
    </div>
  )
}
