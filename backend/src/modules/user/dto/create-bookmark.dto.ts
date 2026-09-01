import { IsString, IsIn } from 'class-validator'

export class CreateBookmarkDto {
    @IsString()
    @IsIn(['blog', 'book', 'test', 'course'])
    type: string

    @IsString()
    targetId: string
}
