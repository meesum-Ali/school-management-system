import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassDto } from '../classes/dto/class.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    private getSchoolIdFromRequest;
    create(createSubjectDto: CreateSubjectDto, req: any): Promise<SubjectDto>;
    findAll(req: any): Promise<SubjectDto[]>;
    findOne(id: string, req: any): Promise<SubjectDto>;
    update(id: string, updateSubjectDto: UpdateSubjectDto, req: any): Promise<SubjectDto>;
    remove(id: string, req: any): Promise<void>;
    listClassesForSubject(subjectId: string, req: any): Promise<ClassDto[]>;
}
