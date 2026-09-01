import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export interface CartItem {
    productId: string
    quantity: number
    addedAt: string
}

@Injectable()
export class CartService {
    private redis: Redis | null = null
    private readonly logger = new Logger(CartService.name)
    private readonly CART_TTL = 7 * 24 * 60 * 60 // 7 days in seconds

    constructor(private config: ConfigService) {
        const redisUrl =
            this.config.get<string>('REDIS_URL') ??
            `redis://${this.config.get<string>('REDIS_HOST') ?? 'localhost'}:6379`
        try {
            this.redis = new Redis(redisUrl, { lazyConnect: true })
            this.redis.connect().catch((err: unknown) => {
                this.logger.warn('Redis connection failed, cart will be unavailable', err)
                this.redis = null
            })
            this.logger.log('Cart Redis connecting...')
        } catch (err) {
            this.logger.warn('Redis unavailable, using in-memory cart fallback', err)
        }
    }

    private cartKey(userId: string): string {
        return `cart:${userId}`
    }

    async getCart(userId: string): Promise<CartItem[]> {
        if (!this.redis) return []
        try {
            const data = await this.redis.get(this.cartKey(userId))
            return data ? (JSON.parse(data) as CartItem[]) : []
        } catch {
            return []
        }
    }

    async addItem(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
        const cart = await this.getCart(userId)
        const existing = cart.find((i) => i.productId === productId)
        if (existing) {
            existing.quantity += quantity
        } else {
            cart.push({ productId, quantity, addedAt: new Date().toISOString() })
        }
        await this.saveCart(userId, cart)
        return cart
    }

    async updateItem(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
        let cart = await this.getCart(userId)
        if (quantity === 0) {
            cart = cart.filter((i) => i.productId !== productId)
        } else {
            const item = cart.find((i) => i.productId === productId)
            if (item) item.quantity = quantity
        }
        await this.saveCart(userId, cart)
        return cart
    }

    async removeItem(userId: string, productId: string): Promise<CartItem[]> {
        const cart = (await this.getCart(userId)).filter((i) => i.productId !== productId)
        await this.saveCart(userId, cart)
        return cart
    }

    async clearCart(userId: string): Promise<void> {
        if (!this.redis) return
        try {
            await this.redis.del(this.cartKey(userId))
        } catch {
            // ignore
        }
    }

    private async saveCart(userId: string, cart: CartItem[]): Promise<void> {
        if (!this.redis) return
        try {
            await this.redis.setex(this.cartKey(userId), this.CART_TTL, JSON.stringify(cart))
        } catch {
            // ignore
        }
    }
}
