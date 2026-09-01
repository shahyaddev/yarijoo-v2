/**
 * Property 8 — Score Determinism
 * Validates: Requirements 2.11
 *
 * For any random array of questions with weights and any random answers map,
 * calling scoringService.calculate('SUM', questions, answers) twice produces
 * identical total values.
 */
import * as fc from 'fast-check'
import { ScoringService, ScoringQuestion } from '../../src/modules/test/scoring.service'
import { ScoringType } from '@prisma/client'

const service = new ScoringService()

// Arbitrary for a single option with a numeric score
const optionArb = fc.record({
    value: fc.string({ minLength: 1, maxLength: 10 }),
    score: fc.integer({ min: 0, max: 10 }),
})

// Arbitrary for a single question with a small options array
const questionArb: fc.Arbitrary<ScoringQuestion & { options: Array<{ value: string; score: number }> }> =
    fc.record({
        id: fc.uuid(),
        scoringWeight: fc.float({ min: Math.fround(0.1), max: Math.fround(5.0), noNaN: true }),
        subscaleKey: fc.option(fc.string({ minLength: 1, maxLength: 12 }), { nil: null }),
        options: fc.array(optionArb, { minLength: 1, maxLength: 5 }),
    })

// Build an answers map that selects from the question's own option values
function buildAnswers(
    questions: Array<ScoringQuestion & { options: Array<{ value: string; score: number }> }>,
    selectedIndices: number[],
): Record<string, unknown> {
    const answers: Record<string, unknown> = {}
    questions.forEach((q, i) => {
        const idx = selectedIndices[i] ?? 0
        if (q.options.length > 0) {
            answers[q.id] = q.options[idx % q.options.length].value
        }
    })
    return answers
}

describe('Property 8: Score Determinism', () => {
    it('SUM scoring returns identical total on two calls with same inputs (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(questionArb, { minLength: 0, maxLength: 20 }),
                fc.array(fc.nat({ max: 4 }), { minLength: 20, maxLength: 20 }),
                (questions, indices) => {
                    const answers = buildAnswers(questions, indices)
                    const result1 = service.calculate(ScoringType.SUM, questions, answers)
                    const result2 = service.calculate(ScoringType.SUM, questions, answers)
                    return result1.total === result2.total
                },
            ),
            { numRuns: 100 },
        )
    })

    it('WEIGHTED scoring returns identical total on two calls with same inputs (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(questionArb, { minLength: 0, maxLength: 20 }),
                fc.array(fc.nat({ max: 4 }), { minLength: 20, maxLength: 20 }),
                (questions, indices) => {
                    const answers = buildAnswers(questions, indices)
                    const result1 = service.calculate(ScoringType.WEIGHTED, questions, answers)
                    const result2 = service.calculate(ScoringType.WEIGHTED, questions, answers)
                    return result1.total === result2.total
                },
            ),
            { numRuns: 100 },
        )
    })

    it('SUBSCALE scoring returns identical total on two calls with same inputs (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(questionArb, { minLength: 0, maxLength: 20 }),
                fc.array(fc.nat({ max: 4 }), { minLength: 20, maxLength: 20 }),
                (questions, indices) => {
                    const answers = buildAnswers(questions, indices)
                    const result1 = service.calculate(ScoringType.SUBSCALE, questions, answers)
                    const result2 = service.calculate(ScoringType.SUBSCALE, questions, answers)
                    return result1.total === result2.total
                },
            ),
            { numRuns: 100 },
        )
    })
})
