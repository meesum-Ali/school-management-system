import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';
export declare class StudentsService {
    private studentsRepository;
    private classesRepository;
    constructor(studentsRepository: Repository<Student>, classesRepository: Repository<ClassEntity>);
    private mapStudentToStudentDto;
    create(createStudentDto: CreateStudentDto, schoolId: string): Promise<StudentDto>;
    findAll(schoolId: string): Promise<StudentDto[]>;
    findOne(id: string, schoolId: string): Promise<StudentDto>;
    update(id: string, updateStudentDto: UpdateStudentDto, schoolId: string): Promise<StudentDto>;
    remove(id: string, schoolId: string): Promise<void>;
    assignStudentToClass(studentId: string, classId: string | null, schoolId: string): Promise<StudentDto>;
}
