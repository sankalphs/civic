import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { reverseGeocode, forwardGeocode } from '../services/geocoder'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BANGALORE_CENTER = [12.9716, 77.5946]

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? (
    <Marker position={[position.lat, position.lng]} />
  ) : null
}

function FlyToLocation({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1 })
    }
  }, [position, map])
  return null
}

export default function LocationPicker({ position, onPositionChange, onAddressChange }) {
  const [address, setAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const fetchAddress = useCallback(async (lat, lng) => {
    setLoadingAddress(true)
    const addr = await reverseGeocode(lat, lng)
    setAddress(addr)
    onAddressChange?.(addr)
    setLoadingAddress(false)
  }, [onAddressChange])

  useEffect(() => {
    if (position) {
      fetchAddress(position.lat, position.lng)
    }
  }, [position, fetchAddress])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await forwardGeocode(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }

  const selectSearchResult = (result) => {
    onPositionChange(result.lat, result.lng)
    setSearchResults([])
    setSearchQuery('')
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => onPositionChange(pos.coords.latitude, pos.coords.longitude),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-3">Location</h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search area in Bangalore..."
          className="input-field flex-1"
        />
        <button onClick={handleSearch} disabled={searching} className="btn-primary whitespace-nowrap">
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-3 bg-white border border-gray-200 rounded-lg shadow-sm max-h-40 overflow-y-auto">
          {searchResults.map((r, i) => (
            <button
              key={i}
              onClick={() => selectSearchResult(r)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 text-sm"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}

      <div className="h-48 rounded-lg overflow-hidden mb-3 border border-gray-200">
        <MapContainer
          center={position ? [position.lat, position.lng] : BANGALORE_CENTER}
          zoom={position ? 16 : 12}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={onPositionChange} />
          <FlyToLocation position={position} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={useMyLocation} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use my location
        </button>

        {position && (
          <span className="text-xs text-gray-500">
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        )}
      </div>

      {position && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          {loadingAddress ? (
            <p className="text-sm text-gray-500">Loading address...</p>
          ) : address ? (
            <div>
              <p className="text-sm font-medium text-gray-800">{address.road || address.neighbourhood || address.area}</p>
              <p className="text-xs text-gray-500">{address.display_name}</p>
            </div>
          ) : null}
        </div>
      )}

      {!position && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Tap on the map or use GPS to set your location
        </p>
      )}
    </div>
  )
}
