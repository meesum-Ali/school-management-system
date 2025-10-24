export declare class StudentDto {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    studentId: string;
    classId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    currentClassName?: string | null;
    schoolId: string;
}
export declare class CreateStudentDto {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    studentId: string;
    classId?: string | null;
}
export declare class UpdateStudentDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    email?: string;
    studentId?: string;
    classId?: string | null;
}
