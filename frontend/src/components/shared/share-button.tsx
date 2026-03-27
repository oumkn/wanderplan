'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  shareToken: string
}

export function ShareButton({ shareToken }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/share/${shareToken}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share Trip
        </>
      )}
    </button>
  )
}
