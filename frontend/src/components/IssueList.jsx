import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getIssues } from '../services/api'
import { AUTHORITIES, STATUS_LABELS } from '../data/authorities'

export default function IssueList() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', category: '' })

  useEffect(() => {
    loadIssues()
  }, [filter])

  const loadIssues = async () => {
    setLoading(true)
    try {
      const data = await getIssues(filter)
      setIssues(data)
    } catch (err) {
      console.error('Failed to load issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Reports</h1>

      <div className="flex gap-3 mb-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
          className="input-field flex-1"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
          className="input-field flex-1"
        >
          <option value="">All Categories</option>
          {Object.entries(AUTHORITIES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.category}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-3">No issues found</p>
          <Link to="/" className="btn-primary inline-block">Report an Issue</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const authority = AUTHORITIES[issue.category]
            const status = STATUS_LABELS[issue.status] || { label: issue.status, class: 'badge-pending' }

            return (
              <Link key={issue.id} to={`/track/${issue.tracking_id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{authority?.icon || '📋'}</span>
                      <span className="font-semibold text-gray-800">{authority?.category || issue.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                    {issue.area && <p className="text-xs text-gray-400 mt-1">📍 {issue.area}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <span className={`badge ${status.class}`}>{status.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{issue.tracking_id}</span>
                    <span className="text-xs text-gray-400">{formatDate(issue.created_at)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
