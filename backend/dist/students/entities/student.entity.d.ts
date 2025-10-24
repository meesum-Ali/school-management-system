import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';
export declare class Student {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    studentId: string;
    currentClass: Promise<ClassEntity> | null;
    classId: string | null;
    schoolId: string;
    school: Promise<School>;
    userId?: string | null;
    user: Promise<User>;
    createdAt: Date;
    updatedAt: Date;
}
