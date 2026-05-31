import { AUTHORITIES } from '../data/authorities'

export function classifyIssue(text) {
  if (!text || text.trim().length === 0) {
    return { category: null, confidence: 0, authority: null, matchedKeywords: [] }
  }

  const lower = text.toLowerCase().trim()
  const words = lower.split(/\s+/)
  
  let bestMatch = null
  let bestScore = 0
  let bestKeywords = []

  for (const [category, authority] of Object.entries(AUTHORITIES)) {
    let score = 0
    const matched = []

    for (const keyword of authority.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(' ').length
        matched.push(keyword)
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = category
      bestKeywords = matched
    }
  }

  if (!bestMatch) {
    return {
      category: 'unknown',
      confidence: 0,
      authority: null,
      matchedKeywords: [],
      suggestion: 'Could not classify. Please select a category manually.'
    }
  }

  const totalWords = words.length
  const confidence = Math.min(bestScore / Math.max(totalWords * 0.3, 1), 1)

  return {
    category: bestMatch,
    confidence: Math.round(confidence * 100) / 100,
    authority: AUTHORITIES[bestMatch],
    matchedKeywords: bestKeywords
  }
}

export function getCategoryFromText(text) {
  const result = classifyIssue(text)
  return result.category
}
