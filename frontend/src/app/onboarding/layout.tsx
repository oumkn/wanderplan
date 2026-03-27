import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan your trip — WanderPlan',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {children}
    </div>
  )
}
