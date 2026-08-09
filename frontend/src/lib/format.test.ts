import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatDate } from './format.ts'

describe('date formatting', () => {
  it('formats both date-only values and saved-estimate timestamps', () => {
    assert.match(formatDate('2026-08-08'), /Aug 8, 2026/)
    assert.match(formatDate('2026-08-08T19:00:00.000Z'), /Aug 8, 2026/)
  })
})
