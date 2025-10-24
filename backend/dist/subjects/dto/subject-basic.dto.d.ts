export declare class SubjectBasicDto {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    constructor(partial: Partial<SubjectBasicDto>);
}
