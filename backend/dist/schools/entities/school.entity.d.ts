import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';
export declare class School {
    id: string;
    name: string;
    domain?: string;
    address?: string;
    adminUserId?: string;
    users: Promise<User[]>;
    students: Promise<Student[]>;
    classes: Promise<ClassEntity[]>;
    subjects: Promise<SubjectEntity[]>;
    teachers: Promise<Teacher[]>;
    classSchedules: Promise<ClassSchedule[]>;
    createdAt: Date;
    updatedAt: Date;
}
