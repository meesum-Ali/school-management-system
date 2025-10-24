import { Repository } from 'typeorm';
import { ClassSchedule } from './entities/class-schedule.entity';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { ClassesService } from '../classes/classes.service';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';
export declare class ClassScheduleService {
    private readonly classScheduleRepository;
    private readonly classesService;
    private readonly teachersService;
    private readonly subjectsService;
    constructor(classScheduleRepository: Repository<ClassSchedule>, classesService: ClassesService, teachersService: TeachersService, subjectsService: SubjectsService);
    create(createClassScheduleDto: CreateClassScheduleDto): Promise<ClassSchedule>;
    findAll(schoolId: string): Promise<ClassSchedule[]>;
    findOne(id: string, schoolId: string): Promise<ClassSchedule>;
    update(id: string, schoolId: string, updateClassScheduleDto: UpdateClassScheduleDto): Promise<ClassSchedule>;
    remove(id: string, schoolId: string): Promise<void>;
    findByClass(classId: string, schoolId: string): Promise<ClassSchedule[]>;
    findByTeacher(teacherId: string, schoolId: string): Promise<ClassSchedule[]>;
    private checkForSchedulingConflicts;
}
