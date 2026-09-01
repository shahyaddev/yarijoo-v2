import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateStoryDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsString()
    @MaxLength(500)
    content: string;

    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @IsOptional()
    @IsString()
    expiresAt?: string;
}
