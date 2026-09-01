import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { ShopService } from './shop.service'
import { CartService } from './cart.service'
import { GetProductsDto } from './dto/get-products.dto'
import { CartItemDto } from './dto/cart-item.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'

@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    @Get('products')
    getProducts(@Query() dto: GetProductsDto) {
        return this.shopService.getProducts(dto)
    }

    @Get('products/:slug')
    getProduct(@Param('slug') slug: string) {
        return this.shopService.getProductBySlug(slug)
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
