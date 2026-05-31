import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getIssues, updateIssueStatus, getStats } from '../services/api'
import { AUTHORITIES, STATUS_LABELS, BANGALORE_AREAS } from '../data/authorities'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BANGALORE_CENTER = [12.9716, 77.5946]

function createCategoryIcon(category) {
  const colors = {
    pothole: '#f59e0b', garbage: '#16a34a', water: '#3b82f6',
    electricity: '#eab308', flood: '#0891b2', encroachment: '#dc2626'
  }
  const color = colors[category] || '#6b7280'

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

export default function AdminDashboard() {
  const [issues, setIssues] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', category: '' })
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [view, setView] = useState('map')

  useEffect(() => { loadData() }, [filter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [issuesData, statsData] = await Promise.all([
        getIssues(filter),
        getStats()
      ])
      setIssues(issuesData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      await updateIssueStatus(issueId, newStatus)
      loadData()
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Bangalore Civic Issues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Map
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-gray-50 border-b px-4 py-2 flex gap-4 overflow-x-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          {Object.entries(STATUS_LABELS).map(([key, val]) => (
            <div key={key} className="text-center">
              <p className="text-lg font-bold text-gray-800">{stats[key] || 0}</p>
              <p className="text-xs text-gray-500">{val.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b px-4 py-2 flex gap-3">
        <select value={filter.status} onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))} className="input-field text-sm py-1.5">
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filter.category} onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))} className="input-field text-sm py-1.5">
          <option value="">All Categories</option>
          {Object.entries(AUTHORITIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.category}</option>)}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'map' ? (
          <div className="h-full flex">
            <div className="flex-1">
              <MapContainer center={BANGALORE_CENTER} zoom={12} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[issue.latitude, issue.longitude]}
                    icon={createCategoryIcon(issue.category)}
                    eventHandlers={{ click: () => setSelectedIssue(issue) }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{AUTHORITIES[issue.category]?.icon} {AUTHORITIES[issue.category]?.category}</p>
                        <p className="text-gray-600 mt-1">{issue.description.slice(0, 100)}...</p>
                        <p className="text-gray-400 text-xs mt-1">{issue.tracking_id}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {selectedIssue && (
              <div className="w-80 bg-white border-l overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{selectedIssue.tracking_id}</span>
                  <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <h3 className="font-semibold mb-1">{AUTHORITIES[selectedIssue.category]?.icon} {AUTHORITIES[selectedIssue.category]?.category}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedIssue.description}</p>
                {selectedIssue.area && <p className="text-xs text-gray-400 mb-2">📍 {selectedIssue.area}</p>}
                <p className="text-xs text-gray-400 mb-4">{formatDate(selectedIssue.created_at)}</p>

                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={selectedIssue.status}
                  onChange={(e) => handleStatusUpdate(selectedIssue.id, e.target.value)}
                  className="input-field text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto h-full p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : issues.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No issues found</p>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => {
                  const authority = AUTHORITIES[issue.category]
                  const status = STATUS_LABELS[issue.status] || { label: issue.status, class: 'badge-pending' }

                  return (
                    <div key={issue.id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{authority?.icon}</span>
                            <span className="font-semibold">{authority?.category}</span>
                            <span className={`badge ${status.class}`}>{status.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="font-mono">{issue.tracking_id}</span>
                            {issue.area && <span>📍 {issue.area}</span>}
                            <span>{formatDate(issue.created_at)}</span>
                          </div>
                        </div>
                        <select
                          value={issue.status}
                          onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                          className="input-field text-sm py-1 ml-3 w-36"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
