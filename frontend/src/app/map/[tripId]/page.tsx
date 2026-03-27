import { MapView } from './map-view'

export default function MapPage({ params }: { params: { tripId: string } }) {
  return <MapView tripId={params.tripId} />
}
