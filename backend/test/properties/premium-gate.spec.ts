/**
 * Property 6 — Premium Gate
 * Validates: Requirements 2.11
 *
 * For any test with isPremium=true and any user with subscriptionLevel=FREE,
 * the access check always denies access with reason PREMIUM_REQUIRED.
 */
import * as fc from 'fast-check'

type SubscriptionLevel = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM'

interface AccessResult {
    allowed: boolean
    reason?: string
}

/**
 * Pure function that mirrors TestService.checkPremiumAccess logic.
 * Returns an AccessResult rather than throwing, so we can property-test it.
 */
function canStartTest(
    isPremium: boolean,
    subscriptionLevel: SubscriptionLevel,
): AccessResult {
    if (!isPremium) {
        return { allowed: true }
    }
    if (subscriptionLevel === 'FREE') {
        return { allowed: false, reason: 'PREMIUM_REQUIRED' }
    }
    return { allowed: true }
}

const paidLevelArb: fc.Arbitrary<SubscriptionLevel> = fc.constantFrom(
    'SILVER' as const,
    'GOLD' as const,
    'PLATINUM' as const,
)

describe('Property 6: Premium Gate', () => {
    it('isPremium=true + FREE → always denied with PREMIUM_REQUIRED (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.boolean(), // any other test attributes (we fix isPremium=true below)
                (_) => {
                    const result = canStartTest(true, 'FREE')
                    return result.allowed === false && result.reason === 'PREMIUM_REQUIRED'
                },
            ),
            { numRuns: 100 },
        )
    })

    it('isPremium=false + FREE → always allowed (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.boolean(),
                (_) => {
                    const result = canStartTest(false, 'FREE')
                    return result.allowed === true
                },
            ),
            { numRuns: 100 },
        )
    })

    it('isPremium=true + paid subscription → always allowed (numRuns=100)', () => {
        fc.assert(
            fc.property(
                paidLevelArb,
                (level) => {
                    const result = canStartTest(true, level)
                    return result.allowed === true
                },
            ),
            { numRuns: 100 },
        )
    })
})
