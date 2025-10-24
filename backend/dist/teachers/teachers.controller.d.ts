import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    create(createTeacherDto: CreateTeacherDto, req: any): Promise<import("./entities/teacher.entity").Teacher>;
    findAll(req: any): Promise<import("./entities/teacher.entity").Teacher[]>;
    findOne(id: string, req: any): Promise<import("./entities/teacher.entity").Teacher>;
    update(id: string, updateTeacherDto: UpdateTeacherDto, req: any): Promise<import("./entities/teacher.entity").Teacher>;
    remove(id: string, req: any): Promise<void>;
}
