import { Repository } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectBasicDto } from '../subjects/dto/subject-basic.dto';
import { StudentDto } from '../students/dto/student.dto';
import { UsersService } from '../users/users.service';
export declare class ClassesService {
    private classesRepository;
    private subjectsRepository;
    private usersService;
    private readonly logger;
    constructor(classesRepository: Repository<ClassEntity>, subjectsRepository: Repository<SubjectEntity>, usersService: UsersService);
    private mapClassToClassDto;
    private mapSubjectToBasicDto;
    create(createClassDto: CreateClassDto, schoolId: string): Promise<ClassDto>;
    listClasses(schoolId: string): Promise<ClassDto[]>;
    findAll(schoolId: string): Promise<ClassDto[]>;
    findOne(id: string, schoolId: string): Promise<ClassDto>;
    update(id: string, updateClassDto: UpdateClassDto, schoolId: string): Promise<ClassDto>;
    remove(id: string, schoolId: string): Promise<void>;
    assignSubject(classId: string, subjectId: string, schoolId: string): Promise<SubjectBasicDto>;
    removeSubjectFromClass(classId: string, subjectId: string, schoolId: string): Promise<ClassDto>;
    listSubjectsForClass(classId: string, schoolId: string): Promise<SubjectBasicDto[]>;
    listStudentsInClass(classId: string, schoolId: string): Promise<StudentDto[]>;
}
