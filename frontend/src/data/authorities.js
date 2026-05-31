export const AUTHORITIES = {
  pothole: {
    name: 'Greater Bengaluru Authority (GBA)',
    category: 'Roads & Infrastructure',
    subcategories: ['pothole', 'road damage', 'footpath', 'sidewalk', 'crack'],
    helpline: '1800-425-2424',
    email: 'complaints@gba.karnataka.gov.in',
    icon: '🛣️',
    color: '#f59e0b',
    keywords: ['pothole', 'road', 'footpath', 'sidewalk', 'asphalt', 'crack', 'damage', 'hole', 'broken road', 'bump']
  },
  garbage: {
    name: 'GBA - Sanitation',
    category: 'Solid Waste Management',
    subcategories: ['garbage collection', 'littering', 'dustbin', 'segregation'],
    helpline: '1800-425-2424',
    email: 'sanitation@gba.karnataka.gov.in',
    icon: '🗑️',
    color: '#16a34a',
    keywords: ['garbage', 'waste', 'trash', 'dustbin', 'bin', 'litter', 'dirty', 'smell', 'stink', 'collection', 'sewage smell']
  },
  water: {
    name: 'BWSSB',
    category: 'Water Supply & Sewerage',
    subcategories: ['water leak', 'no water supply', 'sewage overflow', 'pipe burst'],
    helpline: '1916',
    email: 'complaints@bwssb.karnataka.gov.in',
    icon: '💧',
    color: '#3b82f6',
    keywords: ['water', 'leak', 'pipe', 'sewage', 'drain', 'sewer', 'overflow', 'tap', 'no water', 'water supply', 'burst pipe', 'water logging']
  },
  electricity: {
    name: 'BESCOM',
    category: 'Electricity Supply',
    subcategories: ['power cut', 'street light', 'transformer', 'wire hanging'],
    helpline: '1912',
    email: 'complaints@bescom.karnataka.gov.in',
    icon: '⚡',
    color: '#eab308',
    keywords: ['power', 'electricity', 'transformer', 'streetlight', 'street light', 'wire', 'cable', 'outage', 'cut', 'power cut', 'electric']
  },
  flood: {
    name: 'GBA - Stormwater Drains',
    category: 'Drainage & Flooding',
    subcategories: ['waterlogging', 'blocked drain', 'storm drain'],
    helpline: '1800-425-2424',
    email: 'drains@gba.karnataka.gov.in',
    icon: '🌊',
    color: '#0891b2',
    keywords: ['flood', 'waterlogging', 'rain', 'storm', 'drain', 'clogged', 'stagnant', 'water log', 'flooding']
  },
  encroachment: {
    name: 'BDA',
    category: 'Encroachment & Land Use',
    subcategories: ['illegal construction', 'public land encroachment'],
    helpline: '080-2224-4444',
    email: 'info@bdabangalore.org',
    icon: '🏗️',
    color: '#dc2626',
    keywords: ['encroach', 'illegal', 'construction', 'unauthorized', 'occupation', 'illegal building']
  }
}

export const BANGALORE_AREAS = [
  'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout',
  'BTM Layout', 'JP Nagar', 'Jayanagar', 'Banashankari', 'Rajajinagar',
  'Malleshwaram', 'Yelahanka', 'Hebbal', 'Marathahalli', 'Bellandur',
  'Sarjapur Road', 'Bannerghatta Road', 'Hosur Road', 'Old Airport Road',
  'MG Road', 'Brigade Road', 'Commercial Street', 'Frazer Town', 'Cooke Town',
  'Basavanagudi', 'Girinagar', 'Vijayanagar', 'Nagarbhavi', 'Kengeri',
  'Peenya', 'Dasarahalli', 'R T Nagar', 'Sanjay Nagar', 'Sahakara Nagar',
  'Kalyan Nagar', 'Kammanahalli', 'Banaswadi', 'KR Puram', 'Mahadevapura'
]

export const ISSUE_CATEGORIES = Object.entries(AUTHORITIES).map(([key, val]) => ({
  id: key,
  label: val.category,
  icon: val.icon
}))

export const STATUS_LABELS = {
  pending: { label: 'Pending', class: 'badge-pending' },
  acknowledged: { label: 'Acknowledged', class: 'badge-acknowledged' },
  in_progress: { label: 'In Progress', class: 'badge-in-progress' },
  resolved: { label: 'Resolved', class: 'badge-resolved' }
}
