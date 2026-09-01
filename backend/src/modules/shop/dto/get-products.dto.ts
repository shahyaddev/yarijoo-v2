import { IsOptional, IsString, IsNumber, IsIn, Min, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class GetProductsDto {
    @IsOptional()
    @IsString()
    categoryId?: string

    @IsOptional()
    @IsString()
    search?: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number

    @IsOptional()
    @IsIn(['price_asc', 'price_desc', 'newest', 'popular'])
    sort?: string = 'newest'

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 12
}
