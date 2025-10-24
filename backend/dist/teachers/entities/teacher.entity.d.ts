import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';
export declare class Teacher {
    id: string;
    employeeId: string;
    hireDate: Date;
    qualification?: string;
    specialization?: string;
    userId?: string | null;
    homeroomClasses: Promise<ClassEntity[]>;
    classSchedules: Promise<ClassSchedule[]>;
    schoolId: string;
    school: Promise<School>;
    user: Promise<User>;
    createdAt: Date;
    updatedAt: Date;
}
