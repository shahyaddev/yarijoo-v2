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
} from '@nestjs/common';
import { TestService } from './test.service';
import { AiAnalysisService } from './ai-analysis.service';
import { GetTestsDto } from './dto/get-tests.dto';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { CompleteTestDto } from './dto/complete-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('')
export class TestController {
    constructor(
        private testService: TestService,
        private aiAnalysis: AiAnalysisService,
    ) { }

    // ─── Public ────────────────────────────────────────────────────────────────

    @Get('tests')
    getTests(@Query() dto: GetTestsDto) {
        return this.testService.getTests(dto);
    }

    // NOTE: This must be declared before `GET tests/:slug` to avoid ambiguity.
    @Get('tests/attempts/:id')
    @UseGuards(JwtAuthGuard)
    getAttempt(
        @Param('id') attemptId: string,
        @CurrentUser() user: JwtUser,
    ) {
        return this.testService.getAttemptById(user.sub, attemptId);
    }

    @Get('tests/:slug')
    getTestBySlug(@Param('slug') slug: string) {
        return this.testService.getTestBySlug(slug);
    }

    // ─── Authenticated ─────────────────────────────────────────────────────────

    @Post('tests/:id/start')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async startTest(@Param('id') testId: string, @CurrentUser() user: JwtUser) {
        await this.testService.checkPremiumAccess(user.sub, testId);
        return this.testService.startTest(user.sub, testId);
    }

    @Patch('tests/attempts/:id')
    @UseGuards(JwtAuthGuard)
    saveAnswers(
        @Param('id') attemptId: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: SaveAnswersDto,
    ) {
        return this.testService.saveAnswers(user.sub, attemptId, dto);
    }

    @Post('tests/attempts/:id/complete')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    completeTest(
        @Param('id') attemptId: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: CompleteTestDto,
    ) {
        return this.testService.completeTest(user.sub, attemptId, dto);
    }

    @Get('users/me/test-attempts')
    @UseGuards(JwtAuthGuard)
    getUserAttempts(
        @CurrentUser() user: JwtUser,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.testService.getUserAttempts(user.sub, Number(page), Number(limit));
    }

    // NOTE: Declared after GET tests/attempts/:id to avoid route ambiguity.
    @Post('tests/attempts/:id/ai-insight')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    getAiInsight(
        @Param('id') attemptId: string,
        @CurrentUser() user: JwtUser,
    ) {
        return this.aiAnalysis.generateInsight(user.sub, attemptId);
    }
}
