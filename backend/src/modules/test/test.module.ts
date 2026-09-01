import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { ScoringService } from './scoring.service';
import { AiAnalysisService } from './ai-analysis.service';

/**
 * TestModule — Psychological test engine.
 * PrismaModule is global, so no explicit import needed.
 */
@Module({
    controllers: [TestController],
    providers: [TestService, ScoringService, AiAnalysisService],
    exports: [TestService, ScoringService],
})
export class TestModule { }
