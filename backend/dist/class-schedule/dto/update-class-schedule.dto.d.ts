import { CreateClassScheduleDto } from './create-class-schedule.dto';
import { DayOfWeek, TermEnum } from '../entities/class-schedule.entity';
declare const UpdateClassScheduleDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateClassScheduleDto>>;
export declare class UpdateClassScheduleDto extends UpdateClassScheduleDto_base {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    roomNumber?: string;
    academicYear?: string;
    term?: TermEnum;
    schoolId?: string;
    userId?: string;
}
export {};
