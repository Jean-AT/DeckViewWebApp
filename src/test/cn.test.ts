import { describe, expect, it } from 'vitest'
import { cn } from '../lib/cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('skips falsy values', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})