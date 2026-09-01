import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator'

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    fullName?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string
}
