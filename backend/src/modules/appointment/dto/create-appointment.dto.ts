import { IsString, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
    @IsString()
    psychologistId: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;
}
