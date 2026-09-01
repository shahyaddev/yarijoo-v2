import { Module } from '@nestjs/common';
import { BlogController, AdminCommentController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
    controllers: [BlogController, AdminCommentController],
    providers: [BlogService],
    exports: [BlogService],
})
export class BlogModule { }
