import { CreateTeacherDto } from './create-teacher.dto';
declare const UpdateTeacherDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTeacherDto>>;
export declare class UpdateTeacherDto extends UpdateTeacherDto_base {
    employeeId?: string;
    hireDate?: Date;
    qualification?: string;
    specialization?: string;
}
export {};
