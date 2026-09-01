import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { ContentStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { MinioService } from '../user/minio.service'
import { NotificationService } from '../notification/notification.service'

@Injectable()
export class CourseService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly minio: MinioService,
        private readonly notificationService: NotificationService,
    ) { }

    async getCourses(dto: {
        categoryId?: string
        search?: string
        minPrice?: number
        maxPrice?: number
        page?: number
        limit?: number
    }) {
        const { categoryId, search, minPrice, maxPrice, page = 1, limit = 12 } = dto
        const skip = (page - 1) * limit

        const where: Prisma.CourseWhereInput = { status: ContentStatus.PUBLISHED }

        if (categoryId) where.categoryId = categoryId

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {}
            if (minPrice !== undefined) where.price.gte = minPrice
            if (maxPrice !== undefined) where.price.lte = maxPrice
        }

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { id: true, name: true } },
                    _count: { select: { lessons: true, enrollments: true } },
                },
            }),
            this.prisma.course.count({ where }),
        ])

        return {
            courses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }

    async getCourseBySlug(slug: string) {
        const course = await this.prisma.course.findUnique({
            where: { slug },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        duration: true,
                        isFree: true,
                    },
                },
                category: { select: { id: true, name: true } },
                _count: { select: { enrollments: true } },
            },
        })

        if (!course) throw new NotFoundException('دوره یافت نشد')
        return course
    }

    async getLessonContent(userId: string, slug: string, lessonId: string) {
        const course = await this.prisma.course.findUnique({
            where: { slug },
            select: { id: true },
        })
        if (!course) throw new NotFoundException('دوره یافت نشد')

        const lesson = await this.prisma.courseLesson.findFirst({
            where: { id: lessonId, courseId: course.id },
        })
        if (!lesson) throw new NotFoundException('درس یافت نشد')

        // First lesson (isFree) is always accessible without enrollment
        if (!lesson.isFree) {
            const enrollment = await this.prisma.courseEnrollment.findUnique({
                where: { userId_courseId: { userId, courseId: course.id } },
            })
            if (!enrollment) {
                throw new ForbiddenException('برای دسترسی به این درس ابتدا در دوره ثبت‌نام کنید')
            }
        }

        // Generate presigned URL for HLS video with 1hr expiry
        let streamingUrl: string | null = null
        if (lesson.videoUrl) {
            try {
                streamingUrl = await this.minio.getPresignedDownloadUrl(lesson.videoUrl, 3600)
            } catch {
                // Fallback to raw URL if presigned URL generation fails
                streamingUrl = lesson.videoUrl
            }
        }

        return {
            lesson: {
                id: lesson.id,
                title: lesson.title,
                order: lesson.order,
                duration: lesson.duration,
                isFree: lesson.isFree,
            },
            streamingUrl,
        }
    }

    async saveProgress(
        userId: string,
        courseId: string,
        lessonId: string,
        watchedSeconds: number,
        percentComplete: number,
    ) {
        // Verify the lesson belongs to the course
        const lesson = await this.prisma.courseLesson.findFirst({
            where: { id: lessonId, courseId },
        })
        if (!lesson) throw new NotFoundException('درس یافت نشد')

        const isCompleted = percentComplete >= 100

        // Upsert lesson progress
        const progress = await this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: {
                watchedSeconds,
                percentComplete,
                ...(isCompleted ? { completedAt: new Date() } : {}),
            },
            create: {
                userId,
                lessonId,
                watchedSeconds,
                percentComplete,
                ...(isCompleted ? { completedAt: new Date() } : {}),
            },
        })

        // Compute overall course completion percentage
        const [allLessonsCount, completedLessonsCount] = await Promise.all([
            this.prisma.courseLesson.count({ where: { courseId } }),
            this.prisma.lessonProgress.count({
                where: {
                    userId,
                    lesson: { courseId },
                    percentComplete: { gte: 100 },
                },
            }),
        ])

        const overallPercent =
            allLessonsCount > 0
                ? Math.round((completedLessonsCount / allLessonsCount) * 100)
                : 0

        // Update enrollment completion percent
        await this.prisma.courseEnrollment.updateMany({
            where: { userId, courseId },
            data: { completionPercent: overallPercent },
        })

        // On 100% completion, trigger congratulations notification
        if (overallPercent >= 100) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                select: { title: true },
            })

            await this.notificationService.notify(
                userId,
                'course_completion',
                '🎉 تبریک! دوره را تمام کردید',
                `شما دوره «${course?.title ?? ''}» را با موفقیت به پایان رساندید.`,
                { courseId },
            )
        }

        return { progress, overallPercent }
    }
}
