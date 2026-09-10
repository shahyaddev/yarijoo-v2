import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator'

export class CreateTicketDto {
    @IsString({ message: 'موضوع باید متن باشد' })
    @MinLength(5, { message: 'موضوع باید حداقل ۵ کاراکتر باشد' })
    @MaxLength(200, { message: 'موضوع نباید بیشتر از ۲۰۰ کاراکتر باشد' })
    subject: string

    @IsString({ message: 'پیام باید متن باشد' })
    @MinLength(10, { message: 'پیام باید حداقل ۱۰ کاراکتر باشد' })
    content: string

    @IsOptional()
    @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { message: 'اولویت نامعتبر است' })
    priority?: string

    @IsOptional()
    @IsString({ message: 'آدرس تصویر باید متن باشد' })
    imageUrl?: string
}
