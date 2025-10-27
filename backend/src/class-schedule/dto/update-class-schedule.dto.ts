import { PartialType } from '@nestjs/mapped-types';
import { CreateClassScheduleDto } from './create-class-schedule.dto';
import { IsString, IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, TermEnum } from '../entities/class-schedule.entity';

export class UpdateClassScheduleDto extends PartialType(
  CreateClassScheduleDto,
) {
  @ApiProperty({
    description: 'ID of the class',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiProperty({
    description: 'ID of the subject',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({
    description: 'ID of the teacher',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({
    description: 'Day of the week for the class',
    enum: DayOfWeek,
    enumName: 'DayOfWeek',
    required: false,
  })
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Start time of the class in HH:MM:SS format',
    example: '09:00:00',
    required: false,
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Invalid time format. Use HH:MM:SS or HH:MM',
  })
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'End time of the class in HH:MM:SS format',
    example: '10:30:00',
    required: false,
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Invalid time format. Use HH:MM:SS or HH:MM',
  })
  @IsOptional()
  endTime?: string;

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
    required: false,
  })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({
    description: 'Academic term',
    enum: TermEnum,
    enumName: 'TermEnum',
    required: false,
  })
  @IsEnum(TermEnum)
  @IsOptional()
  term?: TermEnum;

  @ApiProperty({
    description: 'ID of the school',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  schoolId?: string;

  @ApiProperty({
    description:
      'ID of the user updating the schedule (for backward compatibility)',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
