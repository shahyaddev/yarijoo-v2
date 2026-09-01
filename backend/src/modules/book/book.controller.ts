import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { BookService } from './book.service';
import { GetBooksDto } from './dto/get-books.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('books')
export class BookController {
    constructor(private readonly bookService: BookService) { }

    @Get()
    getBooks(@Query() dto: GetBooksDto) {
        return this.bookService.getBooks(dto);
    }

    @Get(':slug')
    getBook(@Param('slug') slug: string) {
        return this.bookService.getBookBySlug(slug);
    }

    @Get(':id/read')
    @UseGuards(JwtAuthGuard)
    readPage(
        @Param('id') bookId: string,
        @CurrentUser() user: JwtUser,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ) {
        return this.bookService.readBook(user.sub, bookId, page);
    }

    // Public endpoint — read pages by slug (no auth required for free books)
    @Get(':slug/pages')
    readPagesBySlug(@Param('slug') slug: string) {
        return this.bookService.readBookBySlug(slug);
    }

    @Post(':id/progress')
    @UseGuards(JwtAuthGuard)
    saveProgress(
        @Param('id') bookId: string,
        @CurrentUser() user: JwtUser,
        @Body('lastPage', ParseIntPipe) lastPage: number,
    ) {
        return this.bookService.saveProgress(user.sub, bookId, lastPage);
    }
}
