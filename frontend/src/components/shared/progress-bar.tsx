'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  return (
    <div className="w-full bg-white border-b border-gray-100 px-4 py-4">
      <div className="max-w-2xl mx-auto">
        {/* Step labels */}
        <div className="flex justify-between mb-2">
          {steps.map((label, idx) => {
            const step = idx + 1
            const isCompleted = step < currentStep
            const isActive = step === currentStep
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-1 transition-colors ${
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    isActive ? 'text-indigo-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
