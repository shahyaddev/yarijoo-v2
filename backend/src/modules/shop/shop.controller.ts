import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Query,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common'
import { ShopService } from './shop.service'
import { CartService } from './cart.service'
import { GetProductsDto } from './dto/get-products.dto'
import { CartItemDto } from './dto/cart-item.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('shop')
export class ShopController {
    constructor(
        private readonly shopService: ShopService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('products')
    getProducts(@Query() dto: GetProductsDto) {
        return this.shopService.getProducts(dto)
    }

    @Get('products/:slug')
    getProduct(@Param('slug') slug: string) {
        return this.shopService.getProductBySlug(slug)
    }

    /** Check whether the authenticated user has bookmarked a product */
    @Get('products/:id/wishlist')
    @UseGuards(OptionalJwtAuthGuard)
    async getWishlistStatus(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser | null,
    ) {
        if (!user) return { saved: false, bookmarkId: null }
        const bookmark = await this.prisma.bookmark.findUnique({
            where: { userId_type_targetId: { userId: user.sub, type: 'product', targetId: id } },
        })
        return { saved: !!bookmark, bookmarkId: bookmark?.id ?? null }
    }

    /** Add a product to wishlist */
    @Post('products/:id/wishlist')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async addToWishlist(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
    ) {
        const existing = await this.prisma.bookmark.findUnique({
            where: { userId_type_targetId: { userId: user.sub, type: 'product', targetId: id } },
        })
        if (existing) return { saved: true, bookmarkId: existing.id }
        const bookmark = await this.prisma.bookmark.create({
            data: { userId: user.sub, type: 'product', targetId: id },
        })
        return { saved: true, bookmarkId: bookmark.id }
    }

    /** Remove a product from wishlist */
    @Delete('products/:id/wishlist')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async removeFromWishlist(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
    ) {
        await this.prisma.bookmark.deleteMany({
            where: { userId: user.sub, type: 'product', targetId: id },
        })
        return { saved: false, bookmarkId: null }
    }
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(
        private readonly shopService: ShopService,
        private readonly cartService: CartService,
    ) { }

    @Get()
    getCart(@CurrentUser() user: JwtUser) {
        return this.cartService.getCart(user.sub)
    }

    @Post('items')
    @HttpCode(HttpStatus.OK)
    addItem(@CurrentUser() user: JwtUser, @Body() dto: CartItemDto) {
        return this.cartService.addItem(user.sub, dto.productId, dto.quantity)
    }

    @Patch('items/:productId')
    updateItem(
        @CurrentUser() user: JwtUser,
        @Param('productId') productId: string,
        @Body('quantity') quantity: number,
    ) {
        return this.cartService.updateItem(user.sub, productId, quantity)
    }

    @Delete('items/:productId')
    @HttpCode(HttpStatus.OK)
    removeItem(
        @CurrentUser() user: JwtUser,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(user.sub, productId)
    }

    @Post('discount')
    @HttpCode(HttpStatus.OK)
    validateDiscount(
        @CurrentUser() user: JwtUser,
        @Body('code') code: string,
    ) {
        return this.shopService.validateDiscount(code, user.sub)
    }
}

@Controller()
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly shopService: ShopService) { }

    @Post('orders')
    @HttpCode(HttpStatus.OK)
    createOrder(@CurrentUser() user: JwtUser, @Body() dto: CreateOrderDto) {
        return this.shopService.createOrder(user.sub, dto)
    }

    @Post('payments/verify')
    @HttpCode(HttpStatus.OK)
    verifyPayment(
        @Query('Authority') authority: string,
        @Query('Status') status: string,
    ) {
        return this.shopService.verifyPayment(authority, status)
    }
}
