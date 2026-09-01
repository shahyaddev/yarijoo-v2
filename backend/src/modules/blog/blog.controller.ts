import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
    Optional,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { GetBlogDto } from './dto/get-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { UserRole } from '@prisma/client';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get()
    getPosts(@Query() dto: GetBlogDto) {
        return this.blogService.getPosts(dto);
    }

    @Get('categories')
    getCategories() {
        return this.blogService.getCategories();
    }

    @Get(':slug')
    async getPost(
        @Param('slug') slug: string,
        @Request() req: { user?: JwtUser },
    ) {
        // Unauthenticated users are treated as FREE
        const subscriptionLevel = req.user ? undefined : 'FREE';
        return this.blogService.getPostBySlug(slug, subscriptionLevel);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createComment(
        @Param('id') postId: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: CreateCommentDto,
    ) {
        return this.blogService.createComment(user.sub, postId, dto);
    }
}

@Controller('admin/comments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminCommentController {
    constructor(private readonly blogService: BlogService) { }

    @Patch(':id/approve')
    approveComment(@Param('id') commentId: string) {
        return this.blogService.approveComment(commentId);
    }
}
