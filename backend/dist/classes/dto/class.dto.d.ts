import { StudentDto } from '../../students/dto/student.dto';
import { SubjectBasicDto } from '../../subjects/dto/subject-basic.dto';
export declare class ClassDto {
    id: string;
    name: string;
    level: string;
    homeroomTeacherId?: string | null;
    subjects?: SubjectBasicDto[];
    students?: StudentDto[];
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    constructor(partial: Partial<ClassDto>);
}
