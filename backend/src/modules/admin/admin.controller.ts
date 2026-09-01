import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    HttpCode,
    HttpStatus,
    Res,
    Req,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'
import { UserRole, TicketStatus } from '@prisma/client'
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor'

@Controller('admin')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ── Dashboard ──────────────────────────────────────────────────────────
    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboardStats()
    }

    // ── Users ──────────────────────────────────────────────────────────────
    @Get('users')
    getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('role') role?: UserRole,
    ) {
        return this.adminService.getUsers(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search,
            role,
        )
    }

    @Get('users/:id')
    getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id)
    }

    @Patch('users/:id')
    updateUser(
        @CurrentUser() admin: JwtUser,
        @Param('id') userId: string,
        @Body() body: { role?: UserRole; isSuspended?: boolean },
        @Req() req: FastifyRequest,
    ) {
        const ip = req.ip
        return this.adminService.updateUser(admin.sub, userId, body, ip)
    }

    // ── Media Upload ───────────────────────────────────────────────────────
    @Post('media/upload')
    @HttpCode(HttpStatus.OK)
    async uploadMedia(@Req() req: FastifyRequest) {
        const multipartReq = req as FastifyRequest & { file: () => Promise<{ filename: string; file: AsyncIterable<unknown> }> }
        const data = await multipartReq.file()
        if (!data) {
            return { error: 'No file provided' }
        }
        const chunks: Buffer[] = []
        for await (const chunk of data.file) {
            chunks.push(chunk as Buffer)
        }
        const buffer = Buffer.concat(chunks)
        return this.adminService.uploadMedia(buffer, data.filename)
    }

    // ── Reports ────────────────────────────────────────────────────────────
    @Get('reports/users')
    async getUsersReport(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('format') format?: string,
        @Res({ passthrough: true }) res?: FastifyReply,
    ) {
        const result = await this.adminService.getReports('users', from, to, format)
        if (format === 'csv' && res) {
            res.header('Content-Type', 'text/csv')
            res.header('Content-Disposition', 'attachment; filename="users-report.csv"')
        }
        return result
    }

    @Get('reports/revenue')
    async getRevenueReport(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('format') format?: string,
        @Res({ passthrough: true }) res?: FastifyReply,
    ) {
        const result = await this.adminService.getReports('revenue', from, to, format)
        if (format === 'csv' && res) {
            res.header('Content-Type', 'text/csv')
            res.header('Content-Disposition', 'attachment; filename="revenue-report.csv"')
        }
        return result
    }

    @Get('reports/tests')
    async getTestsReport(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('format') format?: string,
        @Res({ passthrough: true }) res?: FastifyReply,
    ) {
        const result = await this.adminService.getReports('tests', from, to, format)
        if (format === 'csv' && res) {
            res.header('Content-Type', 'text/csv')
            res.header('Content-Disposition', 'attachment; filename="tests-report.csv"')
        }
        return result
    }

    // ── Settings ───────────────────────────────────────────────────────────
    @Get('settings')
    getSettings() {
        return this.adminService.getSettings()
    }

    @Patch('settings')
    updateSettings(@Body() body: { key: string; value: string }) {
        return this.adminService.updateSettings(body.key, body.value)
    }

    // ── Tickets ────────────────────────────────────────────────────────────
    @Get('tickets')
    getTickets(@Query('status') status?: TicketStatus) {
        return this.adminService.getAdminTickets(status)
    }

    @Post('tickets/:id/messages')
    replyToTicket(
        @CurrentUser() admin: JwtUser,
        @Param('id') ticketId: string,
        @Body('content') content: string,
    ) {
        return this.adminService.replyToTicket(admin.sub, ticketId, content)
    }

    @Patch('tickets/:id/status')
    updateTicketStatus(
        @Param('id') ticketId: string,
        @Body('status') status: TicketStatus,
    ) {
        return this.adminService.updateTicketStatus(ticketId, status)
    }

    // ── CRUD: Tests ────────────────────────────────────────────────────────
    @Get('tests')
    getTests(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getTests(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('tests')
    createTest(@Body() body: {
        slug: string
        title: string
        description?: string
        category: string
        scoringType: string
        isPremium?: boolean
        imageUrl?: string
        duration?: number
    }) {
        return this.adminService.createTest(body)
    }

    @Patch('tests/:id')
    updateTest(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateTest(id, body as never)
    }

    @Delete('tests/:id')
    @HttpCode(HttpStatus.OK)
    deleteTest(@Param('id') id: string) {
        return this.adminService.deleteTest(id)
    }

    // ── CRUD: Blog ─────────────────────────────────────────────────────────
    @Get('blog')
    getBlogPosts(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getBlogPosts(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('blog')
    createBlogPost(@CurrentUser() admin: JwtUser, @Body() body: {
        slug: string
        title: string
        content: string
        excerpt?: string
        coverImage?: string
        categoryId?: string
        isPremium?: boolean
        tags?: string[]
    }) {
        return this.adminService.createBlogPost({ ...body, authorId: admin.sub })
    }

    @Patch('blog/:id')
    updateBlogPost(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateBlogPost(id, body as never)
    }

    @Delete('blog/:id')
    @HttpCode(HttpStatus.OK)
    deleteBlogPost(@Param('id') id: string) {
        return this.adminService.deleteBlogPost(id)
    }

    // ── CRUD: Books ────────────────────────────────────────────────────────
    @Get('books')
    getBooks(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getBooks(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('books')
    createBook(@Body() body: {
        slug: string
        title: string
        author: string
        description?: string
        coverImage?: string
        fileUrl?: string
        categoryId?: string
        isPremium?: boolean
        price?: number
        totalPages?: number
    }) {
        return this.adminService.createBook(body)
    }

    @Patch('books/:id')
    updateBook(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateBook(id, body as never)
    }

    @Delete('books/:id')
    @HttpCode(HttpStatus.OK)
    deleteBook(@Param('id') id: string) {
        return this.adminService.deleteBook(id)
    }

    // ── CRUD: Products ─────────────────────────────────────────────────────
    @Get('products')
    getProducts(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getProducts(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('products')
    createProduct(@Body() body: {
        slug: string
        title: string
        price: number
        description?: string
        salePrice?: number
        stock?: number
        images?: string[]
        categoryId?: string
        type?: string
        fileUrl?: string
    }) {
        return this.adminService.createProduct(body)
    }

    @Patch('products/:id')
    updateProduct(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateProduct(id, body as never)
    }

    @Delete('products/:id')
    @HttpCode(HttpStatus.OK)
    deleteProduct(@Param('id') id: string) {
        return this.adminService.deleteProduct(id)
    }

    // ── CRUD: Courses ──────────────────────────────────────────────────────
    @Get('courses')
    getCourses(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getCourses(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('courses')
    createCourse(@CurrentUser() admin: JwtUser, @Body() body: {
        slug: string
        title: string
        description?: string
        thumbnail?: string
        price?: number
        salePrice?: number
        categoryId?: string
        duration?: number
    }) {
        return this.adminService.createCourse({ ...body, instructorId: admin.sub })
    }

    @Patch('courses/:id')
    updateCourse(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateCourse(id, body as never)
    }

    @Delete('courses/:id')
    @HttpCode(HttpStatus.OK)
    deleteCourse(@Param('id') id: string) {
        return this.adminService.deleteCourse(id)
    }

    // ── CRUD: Stories ──────────────────────────────────────────────────────
    @Get('stories')
    getStories(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.adminService.getStories(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        )
    }

    @Post('stories')
    createStory(@CurrentUser() admin: JwtUser, @Body() body: {
        content: string
        title?: string
        mediaUrl?: string
        expiresAt?: Date
    }) {
        return this.adminService.createStory({ ...body, authorId: admin.sub })
    }

    @Patch('stories/:id')
    updateStory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.adminService.updateStory(id, body as never)
    }

    @Delete('stories/:id')
    @HttpCode(HttpStatus.OK)
    deleteStory(@Param('id') id: string) {
        return this.adminService.deleteStory(id)
    }

    // ── Psychologists ──────────────────────────────────────────────────────────
    @Get('psychologists')
    getPsychologists(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('verified') verified?: string,
    ) {
        return this.adminService.getPsychologists(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            verified === 'true' ? true : verified === 'false' ? false : undefined,
        )
    }

    @Patch('psychologists/:id/verify')
    verifyPsychologist(
        @Param('id') profileId: string,
        @Body('isVerified') isVerified: boolean,
    ) {
        return this.adminService.verifyPsychologist(profileId, isVerified)
    }
}
