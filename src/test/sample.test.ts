import { describe, it, expect } from '@jest/globals'
import * as fc from 'fast-check'
import { runPropertyTest } from './property-test-utils'

describe('Sample Tests', () => {
  describe('Unit Tests', () => {
    it('should pass basic unit test', () => {
      expect(1 + 1).toBe(2)
    })

    it('should handle string operations', () => {
      const str = 'Hello World'
      expect(str.toLowerCase()).toBe('hello world')
      expect(str.length).toBe(11)
    })
  })

  describe('Property Tests', () => {
    it('Property: Addition should be commutative', () => {
      runPropertyTest(
        'Addition commutativity',
        fc.tuple(
          fc.integer({ min: -100, max: 100 }),
          fc.integer({ min: -100, max: 100 })
        ),
        ([a, b]) => a + b === b + a
      )
    })

    it('Property: String length should be non-negative', () => {
      runPropertyTest(
        'String length validation',
        fc.string(),
        str => str.length >= 0
      )
    })
  })
})
