import { ClassBasicDto } from '../../classes/dto/class-basic.dto';
export declare class SubjectDto {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
    classes?: ClassBasicDto[];
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    constructor(partial: Partial<SubjectDto>);
}
