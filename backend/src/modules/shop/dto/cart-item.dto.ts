import { IsString, IsInt, Min } from 'class-validator'

export class CartItemDto {
    @IsString()
    productId: string

    @IsInt()
    @Min(1)
    quantity: number
}

export class UpdateCartItemDto {
    @IsString()
    productId: string

    @IsInt()
    @Min(0)
    quantity: number
}
