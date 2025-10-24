import { ClassEntity } from '../../classes/entities/class.entity';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';
export declare enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
export declare enum TermEnum {
    FIRST_TERM = "FIRST_TERM",
    SECOND_TERM = "SECOND_TERM",
    THIRD_TERM = "THIRD_TERM"
}
export declare class ClassSchedule {
    id: string;
    class: Promise<ClassEntity>;
    classId: string;
    subject: Promise<SubjectEntity>;
    subjectId: string;
    teacher: Promise<Teacher>;
    teacherId?: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    academicYear: string;
    schoolId: string;
    school: Promise<School>;
    term: TermEnum;
    user?: Promise<User>;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
    validateTimeSlot(): void;
}
