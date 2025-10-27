import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { School } from '../schools/entities/school.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { ClassesService } from '../classes/classes.service';

// Mock the TypeORM repository
const mockRepository = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
});

const mockClassesService = () => ({
  findOne: jest.fn(),
});

const mockSchool = new School();
mockSchool.id = 'school-1';
mockSchool.name = 'Test School';

// Base mock for a Student entity
let baseMockStudentEntity: Student;
let mockClassEntity: ClassEntity;

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepository: jest.Mocked<Repository<Student>>;
  let classesService: jest.Mocked<any>;

  beforeEach(async () => {
    baseMockStudentEntity = new Student();
    baseMockStudentEntity.id = 'student-1';
    baseMockStudentEntity.studentId = 'S001';
    baseMockStudentEntity.firstName = 'John';
    baseMockStudentEntity.lastName = 'Doe';
    baseMockStudentEntity.email = 'john.doe@example.com';
    baseMockStudentEntity.dateOfBirth = new Date('2005-01-01');
    baseMockStudentEntity.schoolId = 'school-1';
    baseMockStudentEntity.school = Promise.resolve(mockSchool);
    baseMockStudentEntity.createdAt = new Date();
    baseMockStudentEntity.updatedAt = new Date();
    baseMockStudentEntity.classId = null;
    baseMockStudentEntity.currentClass = null;

    mockClassEntity = new ClassEntity();
    mockClassEntity.id = 'class-1';
    mockClassEntity.name = 'Grade 10';
    mockClassEntity.schoolId = 'school-1';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useFactory: mockRepository,
        },
        {
          provide: ClassesService,
          useFactory: mockClassesService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepository = module.get(getRepositoryToken(Student));
    classesService = module.get(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateStudentDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      dateOfBirth: new Date('2006-02-02'),
      studentId: 'S002',
    };

    it('should create a student successfully', async () => {
      const createdStudent = {
        ...baseMockStudentEntity,
        ...createDto,
        id: 'student-2',
      };
      studentRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createdStudent);
      studentRepository.create.mockReturnValue(createdStudent);
      studentRepository.save.mockResolvedValue(createdStudent);

      const result = await service.create(createDto, 'school-1');

      expect(studentRepository.create).toHaveBeenCalledWith({
        ...createDto,
        schoolId: 'school-1',
      });
      expect(studentRepository.save).toHaveBeenCalledWith(createdStudent);
      expect(result.firstName).toEqual('Jane');
    });

    it('should throw ConflictException if email already exists', async () => {
      const uniqueViolation = new QueryFailedError('', [], new Error());
      (uniqueViolation as any).code = '23505';
      (uniqueViolation as any).message =
        'duplicate key value violates unique constraint on email';
      const createdStudent = {
        ...baseMockStudentEntity,
        ...createDto,
        id: 'student-2',
      };
      studentRepository.findOne.mockResolvedValue(null);
      studentRepository.create.mockReturnValue(createdStudent);
      studentRepository.save.mockRejectedValue(uniqueViolation);
      await expect(service.create(createDto, 'school-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      studentRepository.find.mockResolvedValue([baseMockStudentEntity]);
      const result = await service.findAll('school-1');
      expect(studentRepository.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        relations: ['currentClass'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(baseMockStudentEntity.id);
    });
  });

  describe('findOne', () => {
    it('should return a single student DTO if found', async () => {
      studentRepository.findOne.mockResolvedValueOnce(baseMockStudentEntity);
      const result = await service.findOne('student-1', 'school-1');
      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-1', schoolId: 'school-1' },
        relations: ['currentClass'],
      });
      expect(result.id).toEqual('student-1');
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateStudentDto = { firstName: 'Johnny' };

    it('should update a student successfully', async () => {
      const existingStudent = { ...baseMockStudentEntity };
      const updatedStudent = { ...existingStudent, ...updateDto };
      studentRepository.findOne.mockResolvedValueOnce(existingStudent);
      studentRepository.save.mockResolvedValue(updatedStudent);

      const result = await service.update('student-1', updateDto, 'school-1');

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-1', schoolId: 'school-1' },
        relations: ['currentClass'],
      });
      expect(studentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Johnny' }),
      );
      expect(result.firstName).toEqual('Johnny');
    });

    it('should throw ConflictException if updated email or studentId exists for another student', async () => {
      const updateDtoWithConflict: UpdateStudentDto = {
        email: 'another@example.com',
      };
      const uniqueViolation = new QueryFailedError('', [], new Error());
      (uniqueViolation as any).code = '23505';
      (uniqueViolation as any).message =
        'duplicate key value violates unique constraint on email';
      studentRepository.findOne
        .mockResolvedValueOnce(baseMockStudentEntity)
        .mockResolvedValueOnce(null);
      studentRepository.save.mockRejectedValue(uniqueViolation);

      await expect(
        service.update('student-1', updateDtoWithConflict, 'school-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a student successfully', async () => {
      studentRepository.findOneBy.mockResolvedValue(baseMockStudentEntity);
      studentRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('student-1', 'school-1');
      expect(studentRepository.findOneBy).toHaveBeenCalledWith({
        id: 'student-1',
        schoolId: 'school-1',
      });
      expect(studentRepository.delete).toHaveBeenCalledWith({
        id: 'student-1',
        schoolId: 'school-1',
      });
    });

    it('should throw NotFoundException if student to remove is not found', async () => {
      studentRepository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.remove('non-existent', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignStudentToClass', () => {
    it('should assign a student to a class', async () => {
      studentRepository.findOneBy.mockResolvedValue(baseMockStudentEntity);
      classesService.findOne.mockResolvedValue({
        id: 'class-1',
        name: 'Grade 10',
      });
      studentRepository.save.mockResolvedValue(baseMockStudentEntity);
      studentRepository.findOne.mockResolvedValue(baseMockStudentEntity);

      await service.assignStudentToClass('student-1', 'class-1', 'school-1');

      expect(studentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ classId: 'class-1' }),
      );
    });
  });
});
