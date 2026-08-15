import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const containerStyle = { width: '100%', height: '100%' }

export default function DeliveryMap({ lat, lng, label }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  })

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return <Fallback text="Map unavailable for this address." />
  }

  if (!GOOGLE_MAPS_API_KEY || loadError) {
    return <Fallback text="Map couldn't be loaded." />
  }

  if (!isLoaded) {
    return <Fallback text="Loading map…" />
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        <Marker position={{ lat, lng }} title={label} />
      </GoogleMap>
    </div>
  )
}

function Fallback({ text }) {
  return (
    <div className="w-full h-full min-h-[220px] rounded-2xl bg-onLight/5 flex flex-col items-center justify-center gap-2 text-onLight/40">
      <MapPin size={24} />
      <span className="text-xs">{text}</span>
    </div>
  )
}
