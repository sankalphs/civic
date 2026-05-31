const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

let lastRequestTime = 0

async function rateLimitedFetch(url) {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < 1100) {
    await new Promise(resolve => setTimeout(resolve, 1100 - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
  
  return fetch(url, {
    headers: {
      'User-Agent': 'CivicBLR/1.0 (civic-issue-resolver)'
    }
  })
}

export async function reverseGeocode(lat, lon) {
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`
    const res = await rateLimitedFetch(url)
    if (!res.ok) throw new Error('Geocoding failed')
    
    const data = await res.json()
    const addr = data.address || {}

    return {
      display_name: data.display_name,
      road: addr.road || addr.pedestrian || '',
      neighbourhood: addr.neighbourhood || addr.suburb || addr.residential || '',
      area: addr.suburb || addr.neighbourhood || addr.quarter || '',
      city: addr.city || addr.town || 'Bengaluru',
      state: addr.state || 'Karnataka',
      postcode: addr.postcode || '',
      ward: addr.suburb || addr.neighbourhood || ''
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err)
    return {
      display_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      road: '',
      neighbourhood: '',
      area: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postcode: '',
      ward: ''
    }
  }
}

export async function forwardGeocode(query) {
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query + ' Bangalore')}&format=json&limit=5&addressdetails=1`
    const res = await rateLimitedFetch(url)
    if (!res.ok) throw new Error('Geocoding failed')
    
    const data = await res.json()
    return data.map(item => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      area: item.address?.suburb || item.address?.neighbourhood || ''
    }))
  } catch (err) {
    console.error('Forward geocoding error:', err)
    return []
  }
}
