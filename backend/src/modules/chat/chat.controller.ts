import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
    BadRequestException,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'
import { MinioService } from '../user/minio.service'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private chatService: ChatService,
        private minioService: MinioService,
    ) { }

    /**
     * GET /api/v1/chat/rooms
     * Returns all chat rooms the authenticated user is a member of.
     */
    @Get('rooms')
    getRooms(@CurrentUser() user: JwtUser) {
        return this.chatService.getUserRooms(user.sub)
    }

    /**
     * GET /api/v1/chat/rooms/:id/messages?cursor=<messageId>
     * Returns paginated message history (30 messages per page, cursor-based).
     */
    @Get('rooms/:id/messages')
    getMessages(
        @Param('id') roomId: string,
        @CurrentUser() user: JwtUser,
        @Query('cursor') cursor?: string,
    ) {
        return this.chatService.getRoomMessages(user.sub, roomId, cursor)
    }

    /**
     * POST /api/v1/chat/rooms/:id/upload
     * Upload a file/image to MinIO and return the public URL.
     * The client can then emit chat:send with the returned fileUrl.
     * Accepts multipart/form-data with a single field named "file".
     */
    @Post('rooms/:id/upload')
    @HttpCode(HttpStatus.OK)
    async uploadFile(
        @Param('id') roomId: string,
        @CurrentUser() user: JwtUser,
        @Req() req: FastifyRequest,
    ) {
        // Verify room membership before accepting upload
        const hasAccess = await this.chatService.verifyRoomAccess(user.sub, roomId)
        if (!hasAccess) {
            throw new BadRequestException('دسترسی غیرمجاز به این چت‌روم')
        }

        const multipart = req as FastifyRequest & {
            file?: () => Promise<{
                filename: string
                mimetype: string
                file: AsyncIterable<Buffer>
            }>
        }

        if (!multipart.file) {
            throw new BadRequestException('آپلود فایل پشتیبانی نمی‌شود. افزونه multipart فعال نیست.')
        }

        const data = await multipart.file()
        if (!data) {
            throw new BadRequestException('هیچ فایلی ارسال نشد')
        }

        // Collect buffer
        const chunks: Buffer[] = []
        for await (const chunk of data.file) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        // Validate file size (max 10 MB)
        const MAX_SIZE = 10 * 1024 * 1024
        if (buffer.length > MAX_SIZE) {
            throw new BadRequestException('حجم فایل بیش از ۱۰ مگابایت است')
        }

        // Validate MIME type — allow images, PDFs, and common docs
        const ALLOWED_TYPES = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        if (!ALLOWED_TYPES.includes(data.mimetype)) {
            throw new BadRequestException(
                'نوع فایل مجاز نیست. فقط تصویر، PDF و Word پشتیبانی می‌شود.',
            )
        }

        // Determine subfolder by mime type
        const folder = data.mimetype.startsWith('image/') ? 'chat/images' : 'chat/files'
        const safeFilename = data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
        const objectName = `${folder}/${user.sub}/${Date.now()}-${safeFilename}`

        // Upload to MinIO directly using putObject
        await this.minioService.putObject(objectName, buffer, data.mimetype)

        const fileUrl = this.minioService.getPublicUrl(objectName)

        return { fileUrl, filename: data.filename, type: data.mimetype }
    }
}
