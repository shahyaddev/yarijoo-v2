import { IsString, IsIn } from 'class-validator'

export class SubscribeDto {
    @IsString()
    @IsIn(['SILVER', 'GOLD', 'PLATINUM'])
    plan: string

    @IsString()
    @IsIn(['monthly', 'yearly'])
    period: 'monthly' | 'yearly'
}
