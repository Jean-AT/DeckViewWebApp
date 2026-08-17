import { describe, expect, it } from 'vitest'
import { formatDuration, shortSha, timeAgo } from './format'

describe('format helpers', () => {
  it('formats durations compactly', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(12_000)).toBe('12s')
    expect(formatDuration(125_000)).toBe('2m 5s')
  })

  it('shortens commit shas', () => {
    expect(shortSha('abcdef123456')).toBe('abcdef1')
    expect(shortSha(null)).toBe('—')
  })

  it('formats recent relative times', () => {
    expect(timeAgo(new Date(Date.now() - 90_000).toISOString())).toBe('1m ago')
  })
})
