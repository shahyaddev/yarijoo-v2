import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateBookmarkDto } from './dto/create-bookmark.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    // ── Profile ────────────────────────────────────────────────────────
    @Get('profile')
    getProfile(@CurrentUser() user: JwtUser) {
        return this.userService.getProfile(user.sub)
    }

    @Patch('profile')
    updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
        return this.userService.updateProfile(user.sub, dto)
    }

    // ── Avatar ─────────────────────────────────────────────────────────
    @Post('avatar')
    @HttpCode(HttpStatus.OK)
    getAvatarUploadUrl(@CurrentUser() user: JwtUser) {
        return this.userService.getAvatarUploadUrl(user.sub)
    }

    @Patch('avatar/confirm')
    confirmAvatar(
        @CurrentUser() user: JwtUser,
        @Body('objectName') objectName: string,
    ) {
        return this.userService.confirmAvatarUpload(user.sub, objectName)
    }

    // ── Bookmarks ──────────────────────────────────────────────────────
    @Get('bookmarks')
    getBookmarks(@CurrentUser() user: JwtUser) {
        return this.userService.getBookmarks(user.sub)
    }

    @Post('bookmarks')
    createBookmark(@CurrentUser() user: JwtUser, @Body() dto: CreateBookmarkDto) {
        return this.userService.createBookmark(user.sub, dto)
    }

    @Delete('bookmarks/:id')
    @HttpCode(HttpStatus.OK)
    deleteBookmark(@CurrentUser() user: JwtUser, @Param('id') id: string) {
        return this.userService.deleteBookmark(user.sub, id)
    }

    // ── Data Management ────────────────────────────────────────────────
    @Get('me/data-export')
    dataExport(@CurrentUser() user: JwtUser) {
        return this.userService.exportUserData(user.sub)
    }

    @Post('me/delete')
    @HttpCode(HttpStatus.OK)
    deleteAccount(@CurrentUser() user: JwtUser) {
        return this.userService.requestAccountDeletion(user.sub)
    }
}
