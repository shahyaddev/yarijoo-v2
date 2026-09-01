import { Injectable } from '@nestjs/common';
import { ScoringType } from '@prisma/client';

export interface ScoringQuestion {
    id: string;
    scoringWeight: number;
    subscaleKey: string | null;
    options: unknown;
}

export interface ScoringResult {
    total: number;
    subscales: Record<string, number>;
    normalized?: number;
}

@Injectable()
export class ScoringService {
    calculate(
        scoringType: ScoringType,
        questions: ScoringQuestion[],
        answers: Record<string, unknown>,
        config?: unknown,
    ): ScoringResult {
        switch (scoringType) {
            case ScoringType.SUM:
                return this.calculateSum(questions, answers);
            case ScoringType.WEIGHTED:
                return this.calculateWeighted(questions, answers);
            case ScoringType.SUBSCALE:
                return this.calculateSubscale(questions, answers);
            case ScoringType.CUSTOM:
                return this.calculateCustom(questions, answers, config);
            default:
                return this.calculateSum(questions, answers);
        }
    }

    private getOptionScore(
        question: ScoringQuestion,
        selectedValue: unknown,
    ): number {
        try {
            const options = question.options as Array<{
                value: unknown;
                score: number;
            }>;
            if (!Array.isArray(options)) return 0;
            const opt = options.find(
                (o) => String(o.value) === String(selectedValue),
            );
            return opt?.score ?? 0;
        } catch {
            return 0;
        }
    }

    private calculateSum(
        questions: ScoringQuestion[],
        answers: Record<string, unknown>,
    ): ScoringResult {
        let total = 0;
        for (const q of questions) {
            const answer = answers[q.id];
            if (answer !== undefined) {
                total += this.getOptionScore(q, answer);
            }
        }
        return { total, subscales: {} };
    }

    private calculateWeighted(
        questions: ScoringQuestion[],
        answers: Record<string, unknown>,
    ): ScoringResult {
        let total = 0;
        for (const q of questions) {
            const answer = answers[q.id];
            if (answer !== undefined) {
                total += this.getOptionScore(q, answer) * q.scoringWeight;
            }
        }
        return { total: Math.round(total * 100) / 100, subscales: {} };
    }

    private calculateSubscale(
        questions: ScoringQuestion[],
        answers: Record<string, unknown>,
    ): ScoringResult {
        const subscales: Record<string, number> = {};
        let total = 0;
        for (const q of questions) {
            const answer = answers[q.id];
            if (answer === undefined) continue;
            const score = this.getOptionScore(q, answer) * q.scoringWeight;
            total += score;
            if (q.subscaleKey) {
                subscales[q.subscaleKey] = (subscales[q.subscaleKey] ?? 0) + score;
            }
        }
        return { total: Math.round(total * 100) / 100, subscales };
    }

    private calculateCustom(
        questions: ScoringQuestion[],
        answers: Record<string, unknown>,
        config: unknown,
    ): ScoringResult {
        // Custom config-based scoring — defaults to SUM if no custom logic defined
        const baseResult = this.calculateSum(questions, answers);
        if (config && typeof config === 'object') {
            const cfg = config as { maxScore?: number };
            if (cfg.maxScore && cfg.maxScore > 0) {
                baseResult.normalized = Math.round(
                    (baseResult.total / cfg.maxScore) * 100,
                );
            }
        }
        return baseResult;
    }
}
