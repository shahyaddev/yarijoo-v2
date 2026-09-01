import { Module } from '@nestjs/common'
import { ShopController, CartController, OrderController } from './shop.controller'
import { ShopService } from './shop.service'
import { CartService } from './cart.service'
import { PaymentService } from './payment.service'

@Module({
    controllers: [ShopController, CartController, OrderController],
    providers: [ShopService, CartService, PaymentService],
    exports: [ShopService, CartService],
})
export class ShopModule { }
