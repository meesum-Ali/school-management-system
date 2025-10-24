import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
export declare class ClassEntity {
    id: string;
    name: string;
    level: string;
    homeroomTeacherId?: string | null;
    homeroomTeacher: Promise<Teacher> | null;
    subjects: Promise<SubjectEntity[]>;
    students: Promise<Student[]>;
    schedules: Promise<ClassSchedule[]>;
    schoolId: string;
    school: Promise<School>;
    createdAt: Date;
    updatedAt: Date;
}
