import { Module } from '@nestjs/common'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'

/**
 * SearchModule
 *
 * Provides full-text search across blog posts, books, tests, courses, and
 * psychologist profiles, plus an autocomplete endpoint.
 *
 * PrismaService is global — no need to import PrismaModule here.
 * ConfigService is global — no need to import ConfigModule here.
 */
@Module({
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
