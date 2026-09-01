import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @Matches(/^(\+98|0)?9[0-9]{9}$/)
    phone: string;

    @IsString()
    @Length(6, 6, { message: 'کد باید ۶ رقم باشد' })
    code: string;
}
