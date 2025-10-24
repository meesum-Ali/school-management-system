import { DayOfWeek, TermEnum } from '../entities/class-schedule.entity';
export declare class CreateClassScheduleDto {
    classId: string;
    subjectId: string;
    teacherId?: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    academicYear: string;
    term: TermEnum;
    schoolId: string;
    userId?: string;
}
