import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator'

export class CreateTicketDto {
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    subject: string

    @IsString()
    @MinLength(10)
    content: string

    @IsOptional()
    @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    priority?: string
}
