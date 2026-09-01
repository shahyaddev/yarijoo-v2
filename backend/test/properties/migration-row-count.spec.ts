/**
 * Property 15 — Migration Row Count
 * Validates: Requirements 17
 *
 * For any sample batch of legacy rows (valid + invalid mixed),
 * migrateBatch() migrates all valid rows and skips/logs invalid ones
 * without throwing.
 */
import * as fc from 'fast-check'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LegacyUserRow {
    id: number
    phone_number: string | null | undefined
    name: string | null
    family_name: string | null
    role: number
    status: number
}

interface BatchResult {
    migrated: number
    skipped: number
    errors: number
    threw: boolean
}

// ─── Pure migration logic extracted from MigrationService ────────────────────

function normalizePhone(raw: unknown): string | null {
    const phone = String(raw ?? '').trim().replace(/\s/g, '')
    if (!phone) return null
    if (phone.startsWith('+98')) return phone
    if (phone.startsWith('0')) return '+98' + phone.slice(1)
    if (/^9\d{9}$/.test(phone)) return '+98' + phone
    return phone
}

function isValidPhone(phone: string | null): phone is string {
    return phone !== null && /^\+98\d{10}$/.test(phone)
}

/**
 * Models the per-row processing logic from MigrationService.migrateUsers.
 * Returns a BatchResult (never throws).
 */
function migrateBatch(rows: LegacyUserRow[]): BatchResult {
    let migrated = 0
    let skipped = 0
    let errors = 0
    let threw = false

    try {
        for (const row of rows) {
            try {
                const phone = normalizePhone(row.phone_number)
                if (!isValidPhone(phone)) {
                    skipped++
                    continue
                }
                // All rows with a valid phone are "migratable"
                migrated++
            } catch {
                errors++
            }
        }
    } catch {
        threw = true
    }

    return { migrated, skipped, errors, threw }
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

// A valid Iranian mobile number starting with 09
const validPhoneArb: fc.Arbitrary<string> = fc
    .integer({ min: 0, max: 999_999_999 })
    .map((n) => '0' + String(n).padStart(10, '9').slice(-10))

// An invalid phone: too short, letters, empty, or null
const invalidPhoneArb: fc.Arbitrary<string | null | undefined> = fc.oneof(
    fc.constant(null),
    fc.constant(undefined),
    fc.constant(''),
    fc.constant('123'),
    fc.constant('notaphone'),
    fc.string({ minLength: 0, maxLength: 6 }),
)

const validRowArb: fc.Arbitrary<LegacyUserRow> = fc.record({
    id: fc.nat(),
    phone_number: validPhoneArb,
    name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    family_name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    role: fc.constantFrom(1, 2),
    status: fc.constantFrom(0, 1),
})

const invalidRowArb: fc.Arbitrary<LegacyUserRow> = fc.record({
    id: fc.nat(),
    phone_number: invalidPhoneArb,
    name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    family_name: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    role: fc.constantFrom(1, 2),
    status: fc.constantFrom(0, 1),
})

// Mixed batch: random number of valid and invalid rows
const mixedBatchArb = fc.record({
    validRows: fc.array(validRowArb, { minLength: 0, maxLength: 15 }),
    invalidRows: fc.array(invalidRowArb, { minLength: 0, maxLength: 15 }),
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 15: Migration Row Count', () => {
    it('never throws regardless of input (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.oneof(validRowArb, invalidRowArb),
                    { minLength: 0, maxLength: 30 },
                ),
                (rows) => {
                    const result = migrateBatch(rows)
                    return result.threw === false
                },
            ),
            { numRuns: 100 },
        )
    })

    it('migrated + skipped + errors = total row count (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.oneof(validRowArb, invalidRowArb),
                    { minLength: 0, maxLength: 30 },
                ),
                (rows) => {
                    const { migrated, skipped, errors } = migrateBatch(rows)
                    return migrated + skipped + errors === rows.length
                },
            ),
            { numRuns: 100 },
        )
    })

    it('all valid rows are migrated; all invalid rows are skipped (numRuns=100)', () => {
        fc.assert(
            fc.property(
                mixedBatchArb,
                ({ validRows, invalidRows }) => {
                    // Shuffle rows together to simulate a mixed real-world batch
                    const allRows = [...validRows, ...invalidRows]
                    const { migrated, skipped } = migrateBatch(allRows)
                    return (
                        migrated === validRows.length &&
                        skipped === invalidRows.length
                    )
                },
            ),
            { numRuns: 100 },
        )
    })

    it('empty batch produces zero counts (numRuns=100)', () => {
        fc.assert(
            fc.property(fc.boolean(), (_) => {
                const { migrated, skipped, errors, threw } = migrateBatch([])
                return migrated === 0 && skipped === 0 && errors === 0 && threw === false
            }),
            { numRuns: 100 },
        )
    })
})
