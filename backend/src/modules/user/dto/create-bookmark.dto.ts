import { IsString, IsIn } from 'class-validator'

export class CreateBookmarkDto {
    @IsString()
    @IsIn(['blog', 'book', 'test', 'course', 'product'])
    type: string

    @IsString()
    targetId: string
}
