import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersService {
    private readonly teacherRepository;
    constructor(teacherRepository: Repository<Teacher>);
    create(createTeacherDto: CreateTeacherDto): Promise<Teacher>;
    findAll(schoolId: string): Promise<Teacher[]>;
    findOne(id: string, schoolId: string): Promise<Teacher>;
    update(id: string, schoolId: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher>;
    remove(id: string, schoolId: string): Promise<void>;
}
