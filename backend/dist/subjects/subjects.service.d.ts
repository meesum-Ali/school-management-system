import { Repository } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassBasicDto } from '../classes/dto/class-basic.dto';
export declare class SubjectsService {
    private subjectsRepository;
    constructor(subjectsRepository: Repository<SubjectEntity>);
    private mapSubjectToSubjectDto;
    private mapClassToBasicDto;
    create(createSubjectDto: CreateSubjectDto, schoolId: string): Promise<SubjectDto>;
    findAll(schoolId: string): Promise<SubjectDto[]>;
    findOne(id: string, schoolId: string): Promise<SubjectDto>;
    update(id: string, updateSubjectDto: UpdateSubjectDto, schoolId: string): Promise<SubjectDto>;
    remove(id: string, schoolId: string): Promise<void>;
    listClassesForSubject(subjectId: string, schoolId: string): Promise<ClassBasicDto[]>;
}
