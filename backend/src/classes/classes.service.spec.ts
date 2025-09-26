import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassesService } from './classes.service';
import { Student } from '../students/entities/student.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { School } from '../schools/entities/school.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';

// Mock repositories
const mockClassRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
});

const mockSubjectRepository = () => ({
    findBy: jest.fn(),
    findOne: jest.fn(),
  });

const mockUsersService = () => ({
    findOneEntity: jest.fn(),
});

const mockSchool = new School();
mockSchool.id = 'school-1';
mockSchool.name = 'Test School';

const mockTeacherUser = new User();
mockTeacherUser.id = 'teacher-user-1';
mockTeacherUser.roles = [UserRole.TEACHER];

const mockTeacher = new Teacher();
mockTeacher.id = 'teacher-1';
mockTeacher.userId = mockTeacherUser.id;
mockTeacher.schoolId = mockSchool.id;
mockTeacher.employeeId = 'EMP-1';
mockTeacher.hireDate = new Date();

const mockStudent1 = new Student();
mockStudent1.id = 'student-1';
const mockStudent2 = new Student();
mockStudent2.id = 'student-2';

const mockSubject1 = new SubjectEntity();
mockSubject1.id = 'subject-1';
const mockSubject2 = new SubjectEntity();
mockSubject2.id = 'subject-2';

let mockClassEntity: ClassEntity;

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepository: jest.Mocked<Repository<ClassEntity>>;
  let subjectRepository: jest.Mocked<Repository<SubjectEntity>>;

  beforeEach(async () => {
    mockClassEntity = new ClassEntity();
    mockClassEntity.id = 'class-1';
    mockClassEntity.name = 'Grade 10';
    mockClassEntity.level = '10';
    mockClassEntity.schoolId = 'school-1';
    mockClassEntity.school = Promise.resolve(mockSchool);
    mockClassEntity.homeroomTeacherId = mockTeacher.id;
    mockClassEntity.homeroomTeacher = Promise.resolve(mockTeacher);
    mockClassEntity.students = Promise.resolve([mockStudent1]);
    mockClassEntity.subjects = Promise.resolve([mockSubject1]);
    mockClassEntity.createdAt = new Date();
    mockClassEntity.updatedAt = new Date();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(ClassEntity), useFactory: mockClassRepository },
        { provide: getRepositoryToken(SubjectEntity), useFactory: mockSubjectRepository },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classRepository = module.get(getRepositoryToken(ClassEntity));
    subjectRepository = module.get(getRepositoryToken(SubjectEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateClassDto = { name: 'Grade 11', level: '11' };

    it('should create a class successfully', async () => {
      classRepository.findOne.mockResolvedValueOnce(null);
      const createdEntity = { ...mockClassEntity, ...createDto, subjects: Promise.resolve([]) };
      classRepository.create.mockReturnValue(createdEntity);
      classRepository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto, 'school-1');

      expect(classRepository.create).toHaveBeenCalledWith({
        ...createDto,
        schoolId: 'school-1',
      });
      expect(result.name).toEqual('Grade 11');
    });
  });

  describe('update', () => {
    const updateDto: UpdateClassDto = { name: 'Grade 10 Advanced' };

    it('should update a class successfully', async () => {
        classRepository.findOne
          .mockResolvedValueOnce(mockClassEntity)
          .mockResolvedValueOnce(mockClassEntity);
        const updatedEntity = { ...mockClassEntity, ...updateDto };
        classRepository.save.mockResolvedValue(updatedEntity);
        classRepository.findOne.mockResolvedValueOnce(updatedEntity);

        const result = await service.update('class-1', updateDto, 'school-1');

        expect(result.name).toEqual('Grade 10 Advanced');
      });
  });

  describe('assignSubject', () => {
    it('should assign a subject to a class', async () => {
        classRepository.findOne.mockResolvedValue(mockClassEntity);
        subjectRepository.findBy.mockResolvedValueOnce([mockSubject2]);
        subjectRepository.findOne.mockResolvedValue(mockSubject2);
        mockClassEntity.subjects = Promise.resolve([]);

        await service.assignSubject('class-1', 'subject-2', 'school-1');

        expect(classRepository.save).toHaveBeenCalled();
      });
  });

  describe('removeSubjectFromClass', () => {
    it('should remove a subject from a class', async () => {
        classRepository.findOne.mockResolvedValue(mockClassEntity);
        subjectRepository.findBy.mockResolvedValueOnce([mockSubject1]);
        subjectRepository.findOne.mockResolvedValue(mockSubject1);

        await service.removeSubjectFromClass('class-1', 'subject-1', 'school-1');

        expect(classRepository.save).toHaveBeenCalled();
      });
  });
});