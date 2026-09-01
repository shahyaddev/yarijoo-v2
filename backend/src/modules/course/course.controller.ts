import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common'
import { IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { FastifyReply } from 'fastify'
import { CourseService } from './course.service'
import { CertificateService } from './certificate.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'

class SaveProgressDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    watchedSeconds: number

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    percentComplete: number
}

@Controller('courses')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly certificateService: CertificateService,
    ) { }

    /**
     * GET /api/v1/courses
     * List published courses with optional filters (categoryId, search, price range) and pagination.
     * Requirement 6.1
     */
    @Get()
    getCourses(
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '12',
    ) {
        return this.courseService.getCourses({
            categoryId,
            search,
            minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
            maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
            page: Number(page),
            limit: Number(limit),
        })
    }

    /**
     * GET /api/v1/courses/:slug
     * Get full course details including the lesson curriculum (without video URLs).
     * Requirement 6.2
     */
    @Get(':slug')
    getCourse(@Param('slug') slug: string) {
        return this.courseService.getCourseBySlug(slug)
    }

    /**
     * GET /api/v1/courses/:slug/lessons/:lessonId
     * Return lesson content with presigned HLS streaming URL (1hr expiry).
     * Free (preview) lessons are accessible without enrollment;
     * all other lessons require a valid enrollment.
     * Requirement 6.3, 6.6
     */
    @Get(':slug/lessons/:lessonId')
    @UseGuards(JwtAuthGuard)
    getLessonContent(
        @Param('slug') slug: string,
        @Param('lessonId') lessonId: string,
        @CurrentUser() user: JwtUser,
    ) {
        return this.courseService.getLessonContent(user.sub, slug, lessonId)
    }

    /**
     * POST /api/v1/courses/:courseId/lessons/:lessonId/progress
     * Save watched seconds and completion percentage for a lesson.
     * Computes overall course completion and triggers congratulations notification on 100%.
     * Requirement 6.4, 6.5
     */
    @Post(':courseId/lessons/:lessonId/progress')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    saveProgress(
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: SaveProgressDto,
    ) {
        return this.courseService.saveProgress(
            user.sub,
            courseId,
            lessonId,
            dto.watchedSeconds,
            dto.percentComplete,
        )
    }

    /**
     * GET /api/v1/courses/:slug/certificate
     * Generate and stream a PDF certificate for a completed course.
     * Requires 100% completion in the enrollment.
     */
    @Get(':slug/certificate')
    @UseGuards(JwtAuthGuard)
    async getCertificate(
        @Param('slug') slug: string,
        @CurrentUser() user: JwtUser,
        @Res() res: FastifyReply,
    ) {
        const pdfBuffer = await this.certificateService.generateCertificate(user.sub, slug)
        const filename = `certificate-${slug}.pdf`

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Disposition', `attachment; filename="${filename}"`)
        res.header('Content-Length', String(pdfBuffer.length))
        return res.send(pdfBuffer)
    }
}
