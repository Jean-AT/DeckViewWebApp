import { describe, expect, it } from 'vitest'
import { formatCount, formatDuration, shortSha } from '../lib/format'

describe('formatDuration', () => {
  it('returns — for null/undefined', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(undefined)).toBe('—')
  })

  it('formats seconds', () => {
    expect(formatDuration(5_000)).toBe('5s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125_000)).toBe('2m 5s')
  })

  it('formats hours', () => {
    expect(formatDuration(3_725_000)).toBe('1h 2m')
  })
})

describe('shortSha', () => {
  it('truncates to 7 chars', () => {
    expect(shortSha('abcdef1234567890')).toBe('abcdef1')
  })

  it('returns — for empty', () => {
    expect(shortSha(null)).toBe('—')
    expect(shortSha(undefined)).toBe('—')
  })
})

describe('formatCount', () => {
  it('formats thousands', () => {
    expect(formatCount(1234)).toBe('1,234')
  })
})