import { IsOptional, IsString, IsObject, IsArray, ValidateNested, IsNumber, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class OrderItemDto {
    @IsString()
    productId: string

    @IsInt()
    @Min(1)
    quantity: number
}

export class CreateOrderDto {
    @IsOptional()
    @IsObject()
    shippingAddress?: Record<string, unknown>

    @IsOptional()
    @IsString()
    notes?: string

    @IsOptional()
    @IsString()
    discountCode?: string

    // Allow frontend to pass cart items directly (bypasses Redis cart)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items?: OrderItemDto[]
}
