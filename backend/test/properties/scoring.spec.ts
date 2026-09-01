/**
 * Property 8 — Score Determinism
 * For any random array of questions with weights and any random answers map,
 * calling scoringService.calculate() twice produces identical total values.
 */
import * as fc from 'fast-check'
import { ScoringService } from '../../src/modules/test/scoring.service'
import { ScoringType } from '@prisma/client'

describe('Property: Score Determinism', () => {
    const scoringService = new ScoringService()

    it('SUM scoring produces identical results for same inputs (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        scoringWeight: fc.float({ min: Math.fround(0.1), max: Math.fround(5.0), noNaN: true }),
                        subscaleKey: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: null }),
                        options: fc.constant([
                            { value: '1', score: 1 },
                            { value: '2', score: 2 },
                            { value: '3', score: 3 },
                        ]),
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                fc.dictionary(
                    fc.uuid(),
                    fc.oneof(fc.constant('1'), fc.constant('2'), fc.constant('3'))
                ),
                (questions, answers) => {
                    const result1 = scoringService.calculate(ScoringType.SUM, questions, answers)
                    const result2 = scoringService.calculate(ScoringType.SUM, questions, answers)
                    return result1.total === result2.total
                }
            ),
            { numRuns: 100 }
        )
    })

    it('WEIGHTED scoring is deterministic (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        scoringWeight: fc.float({ min: Math.fround(0.5), max: Math.fround(3.0), noNaN: true }),
                        subscaleKey: fc.constant(null),
                        options: fc.constant([
                            { value: 'a', score: 1 },
                            { value: 'b', score: 2 },
                        ]),
                    }),
                    { minLength: 1, maxLength: 15 }
                ),
                fc.dictionary(
                    fc.uuid(),
                    fc.oneof(fc.constant('a'), fc.constant('b'))
                ),
                (questions, answers) => {
                    const r1 = scoringService.calculate(ScoringType.WEIGHTED, questions, answers)
                    const r2 = scoringService.calculate(ScoringType.WEIGHTED, questions, answers)
                    return r1.total === r2.total
                }
            ),
            { numRuns: 100 }
        )
    })

    it('SUBSCALE scoring is deterministic (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        scoringWeight: fc.float({ min: Math.fround(1.0), max: Math.fround(2.0), noNaN: true }),
                        subscaleKey: fc.oneof(fc.constant('a'), fc.constant('b'), fc.constant(null)),
                        options: fc.constant([
                            { value: '0', score: 0 },
                            { value: '1', score: 1 },
                        ]),
                    }),
                    { minLength: 1, maxLength: 15 }
                ),
                fc.dictionary(
                    fc.uuid(),
                    fc.oneof(fc.constant('0'), fc.constant('1'))
                ),
                (questions, answers) => {
                    const r1 = scoringService.calculate(ScoringType.SUBSCALE, questions, answers)
                    const r2 = scoringService.calculate(ScoringType.SUBSCALE, questions, answers)
                    return r1.total === r2.total &&
                        JSON.stringify(r1.subscales) === JSON.stringify(r2.subscales)
                }
            ),
            { numRuns: 100 }
        )
    })
})
