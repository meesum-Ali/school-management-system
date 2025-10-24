import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    SCHOOL_ADMIN = "SCHOOL_ADMIN",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT",
    PARENT = "PARENT"
}
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    roles: UserRole[];
    schoolId?: string | null;
    school: Promise<School> | null;
    studentProfile: Promise<Student>;
    teacherProfile: Promise<Teacher>;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    comparePassword(attempt: string): Promise<boolean>;
}
