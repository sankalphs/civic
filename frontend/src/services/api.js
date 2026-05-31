import { AUTHORITIES } from '../data/authorities'

const API_BASE = '/api'

export async function createIssue(issueData) {
  const formData = new FormData()
  
  formData.append('description', issueData.description)
  formData.append('category', issueData.category)
  formData.append('latitude', issueData.latitude)
  formData.append('longitude', issueData.longitude)
  formData.append('address', issueData.address || '')
  formData.append('area', issueData.area || '')
  formData.append('reporter_name', issueData.reporter_name || '')
  formData.append('reporter_phone', issueData.reporter_phone || '')
  formData.append('reporter_email', issueData.reporter_email || '')
  formData.append('transcript', issueData.transcript || '')
  
  if (issueData.photo) {
    formData.append('photo', issueData.photo)
  }

  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create issue' }))
    throw new Error(err.detail || 'Failed to create issue')
  }

  return res.json()
}

export async function getIssues(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.area) params.set('area', filters.area)

  const res = await fetch(`${API_BASE}/issues?${params}`)
  if (!res.ok) throw new Error('Failed to fetch issues')
  return res.json()
}

export async function getIssue(id) {
  const res = await fetch(`${API_BASE}/issues/${id}`)
  if (!res.ok) throw new Error('Issue not found')
  return res.json()
}

export async function trackIssue(trackingId) {
  const res = await fetch(`${API_BASE}/issues/track/${trackingId}`)
  if (!res.ok) throw new Error('Issue not found')
  return res.json()
}

export async function updateIssueStatus(id, status) {
  const res = await fetch(`${API_BASE}/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('Failed to update status')
  return res.json()
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}
