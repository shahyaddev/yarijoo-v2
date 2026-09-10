import { IsString, MinLength, IsOptional } from 'class-validator'

export class AddMessageDto {
    @IsString({ message: 'پیام باید متن باشد' })
    @MinLength(1, { message: 'پیام نمی‌تواند خالی باشد' })
    content: string

    @IsOptional()
    @IsString({ message: 'آدرس تصویر باید متن باشد' })
    imageUrl?: string
}
