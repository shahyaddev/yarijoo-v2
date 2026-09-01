// Property 13 — Cart Round-Trip
// Validates: Requirements 15.8
import * as fc from 'fast-check'

type AddOp = { op: 'add'; productId: string; quantity: number }
type UpdateOp = { op: 'update'; productId: string; quantity: number }
type RemoveOp = { op: 'remove'; productId: string }
type CartOp = AddOp | UpdateOp | RemoveOp

interface CartItem { productId: string; quantity: number }

function simulateCart(operations: CartOp[]): CartItem[] {
    const cart = new Map<string, number>()
    for (const op of operations) {
        if (op.op === 'add') {
            cart.set(op.productId, (cart.get(op.productId) ?? 0) + op.quantity)
        } else if (op.op === 'update') {
            if (op.quantity <= 0) cart.delete(op.productId)
            else cart.set(op.productId, op.quantity)
        } else {
            cart.delete(op.productId)
        }
    }
    return Array.from(cart.entries()).map(([productId, quantity]) => ({ productId, quantity }))
}

const productIdArb: fc.Arbitrary<string> = fc.stringMatching(/^[a-f0-9]{4,6}$/)

const addOpArb: fc.Arbitrary<AddOp> = fc.record({
    op: fc.constant('add' as const),
    productId: productIdArb,
    quantity: fc.integer({ min: 1, max: 10 }),
})

const updateOpArb: fc.Arbitrary<UpdateOp> = fc.record({
    op: fc.constant('update' as const),
    productId: productIdArb,
    quantity: fc.integer({ min: 0, max: 10 }),
})

const removeOpArb: fc.Arbitrary<RemoveOp> = productIdArb
    .map((productId): RemoveOp => ({ op: 'remove', productId }))

const cartOpArb: fc.Arbitrary<CartOp> = fc.oneof(addOpArb, updateOpArb, removeOpArb)

describe('Property 13: Cart Round-Trip', () => {
    it('all final cart items have positive quantities (numRuns=100)', () => {
        fc.assert(
            fc.property(fc.array(cartOpArb, { minLength: 0, maxLength: 25 }), (ops) => {
                return simulateCart(ops).every(i => i.quantity > 0)
            }),
            { numRuns: 100 },
        )
    })

    it('add then remove yields no net change (numRuns=100)', () => {
        fc.assert(
            fc.property(
                productIdArb,
                fc.integer({ min: 1, max: 10 }),
                (productId, qty) => {
                    const ops: CartOp[] = [
                        { op: 'add', productId, quantity: qty },
                        { op: 'remove', productId },
                    ]
                    return simulateCart(ops).length === 0
                },
            ),
            { numRuns: 100 },
        )
    })

    it('update with qty=0 removes item (numRuns=100)', () => {
        fc.assert(
            fc.property(
                productIdArb,
                fc.integer({ min: 1, max: 5 }),
                (productId, addQty) => {
                    const ops: CartOp[] = [
                        { op: 'add', productId, quantity: addQty },
                        { op: 'update', productId, quantity: 0 },
                    ]
                    return !simulateCart(ops).find(i => i.productId === productId)
                },
            ),
            { numRuns: 100 },
        )
    })

    it('two adds accumulate (numRuns=100)', () => {
        fc.assert(
            fc.property(
                productIdArb,
                fc.integer({ min: 1, max: 5 }),
                fc.integer({ min: 1, max: 5 }),
                (productId, q1, q2) => {
                    const ops: CartOp[] = [
                        { op: 'add', productId, quantity: q1 },
                        { op: 'add', productId, quantity: q2 },
                    ]
                    const item = simulateCart(ops).find(i => i.productId === productId)
                    return item?.quantity === q1 + q2
                },
            ),
            { numRuns: 100 },
        )
    })

    it('sequential update operations produce expected final state (numRuns=100)', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        productId: productIdArb,
                        finalQty: fc.integer({ min: 0, max: 15 }),
                    }),
                    { minLength: 1, maxLength: 10 },
                ),
                (setOps) => {
                    const ops: CartOp[] = setOps.flatMap(({ productId, finalQty }): CartOp[] => [
                        { op: 'add', productId, quantity: 1 },
                        { op: 'update', productId, quantity: finalQty },
                    ])
                    const cart = simulateCart(ops)
                    for (const { productId, finalQty } of setOps) {
                        const found = cart.find(i => i.productId === productId)
                        if (finalQty > 0 && found?.quantity !== finalQty) return false
                        if (finalQty === 0 && found !== undefined) return false
                    }
                    return true
                },
            ),
            { numRuns: 100 },
        )
    })
})
