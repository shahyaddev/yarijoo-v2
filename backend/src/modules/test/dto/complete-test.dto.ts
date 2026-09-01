import { IsObject } from 'class-validator';

export class CompleteTestDto {
    @IsObject()
    answers: Record<string, unknown>;
}
