import { cn } from '@/lib/utils'
import type { VisaType } from '@wanderplan/shared'

interface VisaBadgeProps {
  visaType: VisaType
}

const VISA_CONFIG: Record<VisaType, { label: string; className: string }> = {
  'visa-free': {
    label: '✓ Visa Free',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'visa-on-arrival': {
    label: '✈ Visa on Arrival',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'e-visa': {
    label: '💻 e-Visa',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
}

export function VisaBadge({ visaType }: VisaBadgeProps) {
  const config = VISA_CONFIG[visaType] ?? VISA_CONFIG['e-visa']
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
