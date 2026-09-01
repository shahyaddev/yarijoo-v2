import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { UserRole } from '@prisma/client';

@Controller('stories')
export class StoryController {
    constructor(private readonly storyService: StoryService) { }

    @Get()
    getStories(
        @Request() req: { user?: JwtUser },
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.storyService.getStories(
            req.user?.sub,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    /**
     * POST /api/v1/stories/:id/view
     * Records a story view for the authenticated user (idempotent).
     */
    @Post(':id/view')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    recordView(@Param('id') storyId: string, @CurrentUser() user: JwtUser) {
        return this.storyService.recordView(user.sub, storyId);
    }
}

@Controller('admin/stories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminStoryController {
    constructor(private readonly storyService: StoryService) { }

    /**
     * POST /api/v1/admin/stories
     * Creates a new story (admin only).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createStory(@Body() dto: CreateStoryDto, @CurrentUser() user: JwtUser) {
        return this.storyService.createStory({
            title: dto.title,
            content: dto.content,
            mediaUrl: dto.mediaUrl,
            authorId: user.sub,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        });
    }
}
