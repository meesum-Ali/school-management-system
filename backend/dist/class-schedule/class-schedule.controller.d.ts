import { ClassScheduleService } from './class-schedule.service';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { ClassSchedule } from './entities/class-schedule.entity';
export declare class ClassScheduleController {
    private readonly classScheduleService;
    constructor(classScheduleService: ClassScheduleService);
    create(createClassScheduleDto: CreateClassScheduleDto, req: any): Promise<ClassSchedule>;
    findAll(req: any): Promise<ClassSchedule[]>;
    findByClass(classId: string, req: any): Promise<ClassSchedule[]>;
    findByTeacher(teacherId: string, req: any): Promise<ClassSchedule[]>;
    findOne(id: string, req: any): Promise<ClassSchedule>;
    update(id: string, updateClassScheduleDto: UpdateClassScheduleDto, req: any): Promise<ClassSchedule>;
    remove(id: string, req: any): Promise<void>;
}
