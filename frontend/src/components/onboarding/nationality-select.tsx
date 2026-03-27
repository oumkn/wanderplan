'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { NATIONALITIES } from '@wanderplan/shared'

export function NationalitySelect() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const { nationality, nationalityLabel, setNationality, nextStep } = useOnboardingStore()

  function handleSelect(code: string, name: string) {
    setNationality(code, name)
    setError('')
    setOpen(false)
  }

  function handleContinue() {
    if (!nationality) {
      setError('Please select your passport nationality to continue.')
      return
    }
    nextStep()
  }

  const selectedFlag = NATIONALITIES.find((n) => n.code === nationality)?.flag

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold text-gray-900">What passport do you travel with?</h1>
          <p className="mt-2 text-gray-500">
            We&apos;ll use this to filter visa-free destinations for you.
          </p>
        </div>

        <div className="space-y-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={cn(
                'w-full flex items-center justify-between h-12 px-3 rounded-lg border bg-background text-sm transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !nationalityLabel && 'text-muted-foreground',
                error ? 'border-red-400' : 'border-input'
              )}
              aria-expanded={open}
            >
              {nationalityLabel ? (
                <span className="flex items-center gap-2">
                  <span className="text-xl">{selectedFlag}</span>
                  {nationalityLabel}
                </span>
              ) : (
                'Select your nationality…'
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] max-w-md p-0" align="start">
              <Command>
                <CommandInput placeholder="Search nationality…" />
                <CommandList>
                  <CommandEmpty>No nationality found.</CommandEmpty>
                  <CommandGroup>
                    {NATIONALITIES.map((nat) => (
                      <CommandItem
                        key={nat.code}
                        value={`${nat.name} ${nat.code}`}
                        onSelect={() => handleSelect(nat.code, nat.name)}
                      >
                        <span className="mr-2 text-lg">{nat.flag}</span>
                        {nat.name}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            nationality === nat.code ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <Button onClick={handleContinue} className="w-full mt-6 h-12 text-base">
          Continue
        </Button>
      </div>
    </div>
  )
}
