import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto';
import { StudentDto } from '../students/dto/student.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    private getSchoolIdFromRequest;
    create(createClassDto: CreateClassDto, req: any): Promise<ClassDto>;
    findAll(req: any): Promise<ClassDto[]>;
    findOne(id: string, req: any): Promise<ClassDto>;
    update(id: string, updateClassDto: UpdateClassDto, req: any): Promise<ClassDto>;
    remove(id: string, req: any): Promise<void>;
    assignSubjectToClass(classId: string, subjectId: string, req: any): Promise<SubjectDto>;
    removeSubjectFromClass(classId: string, subjectId: string, req: any): Promise<ClassDto>;
    listSubjectsForClass(classId: string, req: any): Promise<SubjectDto[]>;
    listStudentsInClass(classId: string, req: any): Promise<StudentDto[]>;
}
