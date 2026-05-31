import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { trackIssue } from '../services/api'
import { AUTHORITIES, STATUS_LABELS } from '../data/authorities'

export default function IssueTracker() {
  const { trackingId } = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchId, setSearchId] = useState(trackingId || '')

  useEffect(() => {
    if (trackingId) loadIssue(trackingId)
  }, [trackingId])

  const loadIssue = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await trackIssue(id)
      setIssue(data)
    } catch (err) {
      setError('Issue not found. Please check your tracking ID.')
      setIssue(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchId.trim()) loadIssue(searchId.trim())
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const statusSteps = ['pending', 'acknowledged', 'in_progress', 'resolved']

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Track Issue</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter tracking ID (e.g., BLR-2026-00001)"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">Track</button>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card text-center py-8">
          <p className="text-red-600 mb-3">{error}</p>
          <Link to="/" className="btn-primary inline-block">Report New Issue</Link>
        </div>
      )}

      {issue && !loading && (
        <div className="space-y-4">
          {/* Status Timeline */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Status</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const currentIndex = statusSteps.indexOf(issue.status)
                const isActive = i <= currentIndex
                const isCurrent = step === issue.status
                const label = STATUS_LABELS[step]?.label || step

                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                      {isActive ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    {i < statusSteps.length - 1 && (
                      <div className={`absolute h-0.5 w-full ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Issue Details */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-gray-500">{issue.tracking_id}</span>
              <span className={`badge ${STATUS_LABELS[issue.status]?.class || 'badge-pending'}`}>
                {STATUS_LABELS[issue.status]?.label || issue.status}
              </span>
            </div>

            <h3 className="font-semibold text-gray-800 mb-1">
              {AUTHORITIES[issue.category]?.icon} {AUTHORITIES[issue.category]?.category || issue.category}
            </h3>
            <p className="text-sm text-gray-700 mb-3">{issue.description}</p>

            {issue.photo_path && (
              <img
                src={`/api/uploads/${issue.photo_path}`}
                alt="Issue"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            {issue.area && (
              <p className="text-sm text-gray-500 mb-1">📍 {issue.area}</p>
            )}
            {issue.address && (
              <p className="text-xs text-gray-400 mb-3">{issue.address}</p>
            )}

            <div className="border-t pt-3 mt-3">
              <p className="text-xs text-gray-500">Reported: {formatDate(issue.created_at)}</p>
              {issue.updated_at !== issue.created_at && (
                <p className="text-xs text-gray-500">Updated: {formatDate(issue.updated_at)}</p>
              )}
            </div>
          </div>

          {/* Authority Info */}
          {AUTHORITIES[issue.category] && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Assigned Authority</h3>
              <p className="font-medium">{AUTHORITIES[issue.category].icon} {AUTHORITIES[issue.category].name}</p>
              <p className="text-sm text-gray-600 mt-1">Helpline: {AUTHORITIES[issue.category].helpline}</p>
            </div>
          )}

          <Link to="/" className="btn-secondary w-full block text-center">
            Report Another Issue
          </Link>
        </div>
      )}
    </div>
  )
}
