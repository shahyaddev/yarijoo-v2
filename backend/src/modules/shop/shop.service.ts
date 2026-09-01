import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common'
import { Prisma, OrderStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { GetProductsDto } from './dto/get-products.dto'
import { CartService } from './cart.service'
import { PaymentService } from './payment.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ShopService {
    constructor(
        private prisma: PrismaService,
        private cart: CartService,
        private payment: PaymentService,
        private config: ConfigService,
    ) { }

    async getProducts(dto: GetProductsDto) {
        const {
            categoryId,
            search,
            minPrice,
            maxPrice,
            sort = 'newest',
            page = 1,
            limit = 12,
        } = dto
        const skip = (page - 1) * limit

        const where: Prisma.ProductWhereInput = { isActive: true }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {}
            if (minPrice !== undefined) where.price.gte = minPrice
            if (maxPrice !== undefined) where.price.lte = maxPrice
        }

        let orderBy: Prisma.ProductOrderByWithRelationInput
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' }
                break
            case 'price_desc':
                orderBy = { price: 'desc' }
                break
            default:
                orderBy = { createdAt: 'desc' }
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({ where, skip, take: limit, orderBy }),
            this.prisma.product.count({ where }),
        ])

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }

    async getProductBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({ where: { slug } })
        if (!product) throw new NotFoundException('محصول یافت نشد')
        return product
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const cartItems = await this.cart.getCart(userId)
        if (cartItems.length === 0) {
            throw new BadRequestException('سبد خرید خالی است')
        }

        const productIds = cartItems.map((i) => i.productId)
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
        })

        let totalAmount = 0
        const orderItems: { productId: string; quantity: number; unitPrice: number }[] = []

        for (const cartItem of cartItems) {
            const product = products.find((p) => p.id === cartItem.productId)
            if (!product) {
                throw new BadRequestException(`محصول ${cartItem.productId} یافت نشد`)
            }
            if (product.stock > 0 && product.stock < cartItem.quantity) {
                throw new BadRequestException(
                    `موجودی محصول "${product.title}" کافی نیست`,
                )
            }
            const price = product.salePrice ?? product.price
            totalAmount += price * cartItem.quantity
            orderItems.push({
                productId: product.id,
                quantity: cartItem.quantity,
                unitPrice: price,
            })
        }

        // Apply discount code
        let discountAmount = 0
        let discountCodeId: string | undefined
        if (dto.discountCode) {
            const code = await this.prisma.discountCode.findFirst({
                where: { code: dto.discountCode, isActive: true },
            })
            if (code) {
                if (code.type === 'percentage') {
                    discountAmount = Math.round((totalAmount * code.amount) / 100)
                } else {
                    discountAmount = Math.round(code.amount)
                }
                discountCodeId = code.id
            }
        }

        const finalAmount = Math.max(0, totalAmount - discountAmount)

        const order = await this.prisma.order.create({
            data: {
                userId,
                totalAmount: finalAmount,
                discountAmount,
                discountCodeId,
                shippingAddress: dto.shippingAddress as Prisma.InputJsonValue,
                notes: dto.notes,
                items: {
                    create: orderItems.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                    })),
                },
            },
        })

        const frontendUrl =
            this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
        const callbackUrl = `${frontendUrl}/checkout/callback?orderId=${order.id}`

        const { authority, redirectUrl } = await this.payment.requestPayment(
            finalAmount,
            'خرید از یاری‌جو',
            callbackUrl,
        )

        await this.prisma.order.update({
            where: { id: order.id },
            data: { zarinpalAuthority: authority },
        })

        return { orderId: order.id, redirectUrl }
    }

    async verifyPayment(authority: string, status: string) {
        const order = await this.prisma.order.findFirst({
            where: { zarinpalAuthority: authority },
        })
        if (!order) throw new NotFoundException('سفارش یافت نشد')

        if (status !== 'OK') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CANCELLED },
            })
            return { success: false, message: 'پرداخت ناموفق بود' }
        }

        const { refId, success } = await this.payment.verifyPayment(
            authority,
            order.totalAmount,
        )

        if (!success) {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CANCELLED },
            })
            return { success: false, message: 'تأیید پرداخت ناموفق بود' }
        }

        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                status: OrderStatus.PAID,
                zarinpalRefId: String(refId),
            },
        })

        // Clear cart after successful payment
        await this.cart.clearCart(order.userId)

        return { success: true, refId, orderId: order.id }
    }

    async validateDiscount(code: string, _userId: string) {
        const discount = await this.prisma.discountCode.findFirst({
            where: { code, isActive: true },
        })
        if (!discount) throw new NotFoundException('کد تخفیف یافت نشد')

        if (discount.expiresAt && discount.expiresAt < new Date()) {
            throw new BadRequestException('کد تخفیف منقضی شده است')
        }

        if (
            discount.usageLimit !== null &&
            discount.usedCount >= discount.usageLimit
        ) {
            throw new BadRequestException(
                'ظرفیت استفاده از این کد تخفیف پر شده است',
            )
        }

        return {
            code: discount.code,
            type: discount.type,
            amount: discount.amount,
            valid: true,
        }
    }
}
