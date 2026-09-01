import { IsOptional, IsString, IsObject } from 'class-validator'

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
}
