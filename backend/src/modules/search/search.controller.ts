import {
    Controller,
    Get,
    Query,
    Request,
} from '@nestjs/common'
import { SearchService, SearchType } from './search.service'
import { JwtUser } from '../auth/strategies/jwt.strategy'

class SearchQueryDto {
    q?: string
    type?: SearchType
    page?: number
    limit?: number
}

class AutocompleteQueryDto {
    q?: string
}

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    /**
     * GET /search?q=:query&type=all|blog|book|test|course|psychologist&page=1&limit=10
     * Public endpoint — no auth required.
     * Optional: authenticated user's ID passed to search log.
     */
    @Get()
    search(
        @Query() dto: SearchQueryDto,
        @Request() req: { user?: JwtUser },
    ) {
        const query = (dto.q ?? '').trim()
        const type = (dto.type as SearchType) ?? 'all'
        const page = Number(dto.page) > 0 ? Number(dto.page) : 1
        const limit = Number(dto.limit) > 0 ? Math.min(Number(dto.limit), 50) : 10
        const userId = req.user?.sub

        return this.searchService.search(query, type, page, limit, userId)
    }

    /**
     * GET /search/autocomplete?q=:query
     * Public endpoint — no auth required.
     */
    @Get('autocomplete')
    autocomplete(@Query() dto: AutocompleteQueryDto) {
        const query = (dto.q ?? '').trim()
        return this.searchService.autocomplete(query)
    }
}
