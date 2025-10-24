import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';
import { AssignClassDto } from './dto/assign-class.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    private getSchoolIdFromRequest;
    create(createStudentDto: CreateStudentDto, req: any): Promise<StudentDto>;
    findAll(req: any): Promise<StudentDto[]>;
    findOne(id: string, req: any): Promise<StudentDto>;
    update(id: string, updateStudentDto: UpdateStudentDto, req: any): Promise<StudentDto>;
    remove(id: string, req: any): Promise<void>;
    assignClass(studentId: string, assignClassDto: AssignClassDto, req: any): Promise<StudentDto>;
}
