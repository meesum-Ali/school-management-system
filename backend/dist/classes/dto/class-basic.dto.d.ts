export declare class ClassBasicDto {
    id: string;
    name: string;
    level: string;
    homeroomTeacherId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    constructor(partial: Partial<ClassBasicDto>);
}
