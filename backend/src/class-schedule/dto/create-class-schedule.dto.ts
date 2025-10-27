import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, TermEnum } from '../entities/class-schedule.entity';

export class CreateClassScheduleDto {
  @ApiProperty({ description: 'ID of the class' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'ID of the subject' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'ID of the teacher (optional)' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({
    description: 'Day of the week for the class',
    enum: DayOfWeek,
    enumName: 'DayOfWeek',
  })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Start time of the class in HH:MM:SS format',
    example: '09:00:00',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Invalid time format. Use HH:MM:SS or HH:MM',
  })
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the class in HH:MM:SS format',
    example: '10:30:00',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Invalid time format. Use HH:MM:SS or HH:MM',
  })
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Room number where the class will be held',
    required: false,
    example: 'A101',
  })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({
    description: 'Academic year in YYYY-YYYY format',
    example: '2023-2024',
  })
  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @ApiProperty({
    description: 'Academic term',
    enum: TermEnum,
    enumName: 'TermEnum',
  })
  @IsEnum(TermEnum)
  @IsNotEmpty()
  term: TermEnum;

  @ApiProperty({
    description: 'ID of the school',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({
    description:
      'ID of the user creating the schedule (for backward compatibility)',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
