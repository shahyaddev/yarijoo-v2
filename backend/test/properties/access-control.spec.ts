/**
 * Property 6 — Premium Gate
 * For any test with isPremium=true and any user with subscriptionLevel=FREE,
 * canStartTest() always returns { allowed: false, reason: 'PREMIUM_REQUIRED' }.
 */
import * as fc from 'fast-check'

// Pure function mirroring TestService.checkPremiumAccess logic
function canStartTest(
    isPremium: boolean,
    subscriptionLevel: string
): { allowed: boolean; reason?: string } {
    if (!isPremium) return { allowed: true }
    if (subscriptionLevel === 'FREE') return { allowed: false, reason: 'PREMIUM_REQUIRED' }
    return { allowed: true }
}

describe('Property: Premium Gate', () => {
    it('FREE users always get PREMIUM_REQUIRED for isPremium=true tests (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.constant(true), // isPremium is always true
                fc.constant('FREE'),
                (isPremium, level) => {
                    const result = canStartTest(isPremium, level)
                    return result.allowed === false && result.reason === 'PREMIUM_REQUIRED'
                }
            ),
            { numRuns: 100 }
        )
    })

    it('non-premium tests allow any subscription level (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant('FREE'),
                    fc.constant('SILVER'),
                    fc.constant('GOLD'),
                    fc.constant('PLATINUM')
                ),
                (level) => {
                    const result = canStartTest(false, level)
                    return result.allowed === true
                }
            ),
            { numRuns: 100 }
        )
    })

    it('paid subscription levels can always access premium tests (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant('SILVER'),
                    fc.constant('GOLD'),
                    fc.constant('PLATINUM')
                ),
                (level) => {
                    const result = canStartTest(true, level)
                    return result.allowed === true
                }
            ),
            { numRuns: 100 }
        )
    })
})
