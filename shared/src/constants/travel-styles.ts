import type { TravelStyle } from '../types/onboarding'

export interface TravelStyleDefinition {
  value: TravelStyle
  label: string
  description: string
  emoji: string
}

export const TRAVEL_STYLES: TravelStyleDefinition[] = [
  {
    value: 'adventure',
    label: 'Adventure',
    description: 'Hiking, diving, extreme sports',
    emoji: '🏔️',
  },
  {
    value: 'leisure',
    label: 'Leisure',
    description: 'Beaches, spas, slow travel',
    emoji: '🌴',
  },
  {
    value: 'instagrammable',
    label: 'Instagrammable',
    description: 'Stunning backdrops, iconic spots',
    emoji: '📸',
  },
  {
    value: 'foodie',
    label: 'Foodie',
    description: 'Local cuisine, markets, restaurants',
    emoji: '🍜',
  },
  {
    value: 'cultural',
    label: 'Cultural',
    description: 'Museums, history, local traditions',
    emoji: '🏛️',
  },
]
