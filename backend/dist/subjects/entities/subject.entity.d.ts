import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';
export declare class SubjectEntity {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    school: Promise<School>;
    classes: Promise<ClassEntity[]>;
    classSchedules: Promise<ClassSchedule[]>;
}
