'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { DayWithMappedActivities } from './map-view'

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createColoredIcon(color: string, number: number) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.8 14 22 14 22s14-12.2 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="9" fill="white"/>
      <text x="14" y="19" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}" font-family="sans-serif">${number}</text>
    </svg>
  `
  return L.divIcon({
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    className: '',
  })
}

// Inner component to expose map controls to parent
function MapController({ onFlyToReady }: { onFlyToReady: (fn: (lat: number, lng: number) => void) => void }) {
  const map = useMap()
  useEffect(() => {
    onFlyToReady((lat, lng) => {
      map.flyTo([lat, lng], 15, { duration: 0.8 })
    })
  }, [map, onFlyToReady])
  return null
}

// Fit all markers in view on mount
function BoundsController({ days }: { days: DayWithMappedActivities[] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current) return
    const coords = days.flatMap((d) => d.activities.map((a) => [a.latitude, a.longitude] as [number, number]))
    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [40, 40] })
      fitted.current = true
    }
  }, [map, days])
  return null
}

interface LeafletMapProps {
  days: DayWithMappedActivities[]
  selectedActivityId: string | null
  onSelectActivity: (id: string) => void
  onFlyToReady: (fn: (lat: number, lng: number) => void) => void
}

export default function LeafletMap({ days, selectedActivityId, onSelectActivity, onFlyToReady }: LeafletMapProps) {
  const firstActivity = days[0]?.activities[0]
  const center: [number, number] = firstActivity
    ? [firstActivity.latitude, firstActivity.longitude]
    : [20, 0]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController onFlyToReady={onFlyToReady} />
      <BoundsController days={days} />

      {days.map((day) =>
        day.activities.map((activity) => {
          const icon = createColoredIcon(day.color, activity.markerNumber)
          const isSelected = selectedActivityId === activity.id

          // Use L.marker directly for dynamic icon updates
          return (
            <MarkerWithPopup
              key={activity.id}
              lat={activity.latitude}
              lng={activity.longitude}
              icon={icon}
              isSelected={isSelected}
              title={activity.title}
              cost={activity.cost_estimate}
              color={day.color}
              onClick={() => onSelectActivity(activity.id)}
            />
          )
        })
      )}
    </MapContainer>
  )
}

function MarkerWithPopup({
  lat, lng, icon, isSelected, title, cost, color, onClick,
}: {
  lat: number
  lng: number
  icon: L.DivIcon
  isSelected: boolean
  title: string
  cost: number | null
  color: string
  onClick: () => void
}) {
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [isSelected])

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      ref={markerRef}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-sm min-w-[120px]">
          <p className="font-semibold" style={{ color }}>{title}</p>
          {cost !== null && <p className="text-xs text-gray-500 mt-0.5">~${cost}</p>}
        </div>
      </Popup>
    </Marker>
  )
}
