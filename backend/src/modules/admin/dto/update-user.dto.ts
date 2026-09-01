import { IsOptional, IsBoolean, IsIn } from 'class-validator'

export class UpdateUserDto {
    @IsOptional()
    @IsIn(['USER', 'PSYCHOLOGIST', 'ADMIN', 'SUPER_ADMIN'])
    role?: string

    @IsOptional()
    @IsBoolean()
    isSuspended?: boolean
}
