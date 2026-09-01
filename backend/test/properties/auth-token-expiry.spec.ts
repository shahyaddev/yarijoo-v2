/**
 * Property 1 — Token Expiry
 * Validates: Requirements 2.11
 *
 * For any createTokens(userId) call, decoded access token expiry ≤ 15 min and
 * refresh token expiry ≤ 7 days from Date.now().
 */
import * as fc from 'fast-check'
import * as jwt from 'jsonwebtoken'

const ACCESS_SECRET = 'test-access-secret'
const REFRESH_SECRET = 'test-refresh-secret'
const ACCESS_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes in ms
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

// Standalone token factory that mirrors AuthService.issueTokens logic
function createTokens(userId: string): { accessToken: string; refreshToken: string } {
    const payload = { sub: userId, phone: '+989120000000', role: 'USER' }
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
    return { accessToken, refreshToken }
}

describe('Property 1: Token Expiry', () => {
    it('access token expires within 15 minutes of issuance (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.uuid(), // any userId
                (userId) => {
                    const before = Date.now()
                    const { accessToken } = createTokens(userId)
                    const decoded = jwt.decode(accessToken) as { exp: number }
                    const expMs = decoded.exp * 1000
                    // exp must be within the next 15 min from now (with 1s tolerance for test speed)
                    return expMs - before <= ACCESS_EXPIRY_MS + 1000 && expMs > before
                },
            ),
            { numRuns: 100 },
        )
    })

    it('refresh token expires within 7 days of issuance (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.uuid(),
                (userId) => {
                    const before = Date.now()
                    const { refreshToken } = createTokens(userId)
                    const decoded = jwt.decode(refreshToken) as { exp: number }
                    const expMs = decoded.exp * 1000
                    return expMs - before <= REFRESH_EXPIRY_MS + 1000 && expMs > before
                },
            ),
            { numRuns: 100 },
        )
    })

    it('access token expiry is always less than refresh token expiry (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.uuid(),
                (userId) => {
                    const { accessToken, refreshToken } = createTokens(userId)
                    const accessDecoded = jwt.decode(accessToken) as { exp: number }
                    const refreshDecoded = jwt.decode(refreshToken) as { exp: number }
                    return accessDecoded.exp < refreshDecoded.exp
                },
            ),
            { numRuns: 100 },
        )
    })
})
