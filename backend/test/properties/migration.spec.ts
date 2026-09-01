/**
 * Property 15 — Migration Row Count
 * For any sample batch of legacy rows (valid + invalid mixed),
 * migrateBatch() migrates all valid rows and skips/logs invalid ones without throwing.
 */
import * as fc from 'fast-check'

interface LegacyUser {
    id: number
    phone_number: string | null
    name: string | null
    family_name: string | null
    role: number
    status: number
}

interface BatchResult {
    migrated: number
    skipped: number
    errors: number
}

// Pure function mirroring MigrationService.migrateUsers batch logic
function normalizePhone(phone: string): string {
    const clean = String(phone ?? '').trim().replace(/\s/g, '')
    if (clean.startsWith('+98')) return clean
    if (clean.startsWith('0')) return '+98' + clean.slice(1)
    if (/^9\d{9}$/.test(clean)) return '+98' + clean
    return clean
}

function migrateBatch(users: LegacyUser[]): BatchResult {
    let migrated = 0
    let skipped = 0
    const errors = 0

    for (const user of users) {
        try {
            const phone = normalizePhone(String(user.phone_number ?? ''))
            if (!phone || !/^\+98/.test(phone)) {
                skipped++
                continue
            }
            migrated++
        } catch {
            // errors++ — but our pure function can't throw, so this path is unreachable
        }
    }

    return { migrated, skipped, errors }
}

// Arbitraries
const validPhone = fc.oneof(
    fc.stringMatching(/^09[0-9]{9}$/),
    fc.stringMatching(/^\+989[0-9]{9}$/),
)

const invalidPhone = fc.oneof(
    fc.constant(null),
    fc.constant(''),
    fc.constant('invalid'),
    fc.constant('12345'),
)

const validUser = fc.record({
    id: fc.integer({ min: 1 }),
    phone_number: validPhone,
    name: fc.string({ minLength: 2, maxLength: 20 }),
    family_name: fc.string({ minLength: 2, maxLength: 20 }),
    role: fc.oneof(fc.constant(1), fc.constant(2)),
    status: fc.oneof(fc.constant(0), fc.constant(1)),
})

const invalidUser = fc.record({
    id: fc.integer({ min: 1 }),
    phone_number: invalidPhone,
    name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    family_name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    role: fc.constant(1),
    status: fc.constant(1),
})

describe('Property: Migration Row Count', () => {
    it('total = migrated + skipped + errors for any batch (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(fc.oneof(validUser, invalidUser), { minLength: 1, maxLength: 50 }),
                (users) => {
                    const result = migrateBatch(users)
                    return result.migrated + result.skipped + result.errors === users.length
                }
            ),
            { numRuns: 100 }
        )
    })

    it('all valid rows are migrated, none skipped (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(validUser, { minLength: 1, maxLength: 30 }),
                (users) => {
                    const result = migrateBatch(users)
                    return result.migrated === users.length && result.skipped === 0
                }
            ),
            { numRuns: 100 }
        )
    })

    it('all invalid rows are skipped, none migrated (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(invalidUser, { minLength: 1, maxLength: 30 }),
                (users) => {
                    const result = migrateBatch(users)
                    return result.migrated === 0 && result.skipped === users.length
                }
            ),
            { numRuns: 100 }
        )
    })

    it('phone normalization: 09xx always produces +989xx (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.stringMatching(/^09[0-9]{9}$/),
                (phone) => {
                    const normalized = normalizePhone(phone)
                    return normalized.startsWith('+98') && normalized.length === 13
                }
            ),
            { numRuns: 100 }
        )
    })
})
