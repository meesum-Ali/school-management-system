import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';
import { Student } from '../students/entities/student.entity'; // Import Student
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto';
import { StudentDto } from '../students/dto/student.dto'; // Import StudentDto

const mockClassRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const mockSubjectRepository = () => ({ // Mock for SubjectEntity
    findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepository: MockRepository<ClassEntity>;
  let subjectRepository: MockRepository<SubjectEntity>; // Keep if service methods use it for subjects

  const mockTeacherId = 'teacher-uuid-1';
  const mockSubjectId1 = 'subject-uuid-1';
  const mockSubjectId2 = 'subject-uuid-2';

  const mockSubject1 = new SubjectEntity();
  mockSubject1.id = mockSubjectId1;
  mockSubject1.name = 'Math';
  mockSubject1.code = 'MTH101';

  const mockSubject2 = new SubjectEntity();
  mockSubject2.id = mockSubjectId2;
  mockSubject2.name = 'Science';
  mockSubject2.code = 'SCI101';

  // Mock Student Data
  const mockStudentClass = { id: 'class-for-student-uuid', name: 'Student Class Name' } as ClassEntity; // Simplified mock for nested currentClass

  const mockStudent1 = new Student();
  mockStudent1.id = 'student-uuid-1';
  mockStudent1.firstName = 'Alice';
  mockStudent1.lastName = 'Smith';
  mockStudent1.email = 'alice@example.com';
  mockStudent1.studentId = 'S001';
  mockStudent1.dateOfBirth = new Date('2005-01-01');
  mockStudent1.createdAt = new Date();
  mockStudent1.updatedAt = new Date();
  mockStudent1.classId = mockStudentClass.id; // Student is in mockStudentClass
  mockStudent1.currentClass = mockStudentClass;

  const mockStudent2 = new Student();
  mockStudent2.id = 'student-uuid-2';
  mockStudent2.firstName = 'Bob';
  mockStudent2.lastName = 'Johnson';
  mockStudent2.email = 'bob@example.com';
  mockStudent2.studentId = 'S002';
  mockStudent2.dateOfBirth = new Date('2006-02-02');
  mockStudent2.createdAt = new Date();
  mockStudent2.updatedAt = new Date();
  mockStudent2.classId = null; // Student not assigned to a class
  mockStudent2.currentClass = null;

  const mockStudent1Dto = new StudentDto({
    ...mockStudent1,
    currentClassName: mockStudent1.currentClass ? mockStudent1.currentClass.name : null,
  });
  const mockStudent2Dto = new StudentDto({
    ...mockStudent2,
    currentClassName: null,
  });


  const baseMockClassEntity = new ClassEntity();
  baseMockClassEntity.id = 'class-uuid-1';
  baseMockClassEntity.name = 'Mathematics 101';
  baseMockClassEntity.level = 'Grade 10';
  baseMockClassEntity.homeroomTeacherId = mockTeacherId;
  baseMockClassEntity.subjects = [mockSubject1];
  baseMockClassEntity.students = []; // Initialize with empty students
  baseMockClassEntity.createdAt = new Date();
  baseMockClassEntity.updatedAt = new Date();

  const mockClassDto = new ClassDto({
    ...baseMockClassEntity,
    subjects: baseMockClassEntity.subjects.map(s => new SubjectDto(s)),
    students: [], // Initialize with empty students DTO array
  });


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(ClassEntity),
          useFactory: mockClassRepository,
        },
        { // Add SubjectRepository provider
          provide: getRepositoryToken(SubjectEntity),
          useFactory: mockSubjectRepository,
        }
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classRepository = module.get<MockRepository<ClassEntity>>(getRepositoryToken(ClassEntity));
    subjectRepository = module.get<MockRepository<SubjectEntity>>(getRepositoryToken(SubjectEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateClassDto = {
      name: 'Physics 202',
      level: 'Grade 11',
      homeroomTeacherId: 'teacher-uuid-2',
    };
    const createdEntity = { ...new ClassEntity(), ...createDto, id: 'class-uuid-2', createdAt: new Date(), updatedAt: new Date() };
    const createdDtoResult = new ClassDto({ ...createdEntity });

    it('should create and return a class DTO if name is unique', async () => {
      classRepository.findOne.mockResolvedValue(null);
      classRepository.create.mockReturnValue(createdEntity);
      classRepository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(classRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(classRepository.create).toHaveBeenCalledWith(createDto);
      expect(classRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdDtoResult);
    });

    it('should throw ConflictException if class name already exists', async () => {
      classRepository.findOne.mockResolvedValue(baseMockClassEntity); // Simulate name conflict
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on save if name constraint violated (race condition)', async () => {
        classRepository.findOne.mockResolvedValue(null);
        classRepository.create.mockReturnValue(createdEntity);
        // Simulate a QueryFailedError for unique constraint violation
        const queryFailedError = new QueryFailedError('query', [], { code: '23505', message: 'classes_name_key' } as any);
        classRepository.save.mockRejectedValue(queryFailedError);
        await expect(service.create(createDto)).rejects.toThrow(new ConflictException(`Class with name "${createDto.name}" already exists.`));
    });
  });

  describe('findAll', () => {
    it('should return an array of class DTOs', async () => {
      classRepository.find.mockResolvedValue([baseMockClassEntity]);
      const result = await service.findAll();
      // Students are not loaded in findAll by default, so students array in DTO should be undefined or empty based on mapClassToClassDto
      expect(result[0].id).toEqual(mockClassDto.id);
      expect(result[0].students).toBeUndefined(); // Or expect(result[0].students).toEqual([]);
    });
  });

  describe('findOne', () => { // Tests for the service method findOne
    it('should return a class DTO with subjects and no students if none are enrolled', async () => {
      const classWithoutStudents = { ...baseMockClassEntity, students: [] };
      classRepository.findOne.mockResolvedValue(classWithoutStudents);

      const result = await service.findOne('class-uuid-1');

      expect(classRepository.findOne).toHaveBeenCalledWith({ where: { id: 'class-uuid-1' }, relations: ['subjects', 'students', 'students.currentClass'] });
      expect(result.id).toEqual(baseMockClassEntity.id);
      expect(result.subjects.length).toEqual(baseMockClassEntity.subjects.length);
      expect(result.students).toEqual([]);
    });

    it('should return a class DTO with subjects and enrolled students (mapped to StudentDto)', async () => {
      const classWithStudents = { ...baseMockClassEntity, students: [mockStudent1, mockStudent2] };
      classRepository.findOne.mockResolvedValue(classWithStudents);

      const result = await service.findOne('class-uuid-1');

      expect(classRepository.findOne).toHaveBeenCalledWith({ where: { id: 'class-uuid-1' }, relations: ['subjects', 'students', 'students.currentClass'] });
      expect(result.id).toEqual(baseMockClassEntity.id);
      expect(result.students.length).toEqual(2);
      expect(result.students).toContainEqual(mockStudent1Dto);
      expect(result.students).toContainEqual(mockStudent2Dto);
      expect(result.students.find(s => s.id === mockStudent1.id).currentClassName).toEqual(mockStudentClass.name);
      expect(result.students.find(s => s.id === mockStudent2.id).currentClassName).toBeNull();
    });

    it('should throw NotFoundException if class not found', async () => {
      classRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateClassDto = { name: 'Advanced Mathematics 101' };
    const preloadedEntity = { ...baseMockClassEntity, ...updateDto, students: [] }; // Assume students are not directly updated here
    const updatedEntity = { ...preloadedEntity, updatedAt: new Date() };
    const updatedDtoResult = new ClassDto({ ...updatedEntity, students: [] });


    it('should update and return a class DTO if found and name is unique', async () => {
      classRepository.findOne.mockResolvedValue(null); // No name conflict
      classRepository.preload.mockResolvedValue(preloadedEntity);
      classRepository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('class-uuid-1', updateDto);
      expect(classRepository.preload).toHaveBeenCalledWith({ id: 'class-uuid-1', ...updateDto });
      expect(classRepository.save).toHaveBeenCalledWith(preloadedEntity);
      expect(result.name).toEqual(updatedDtoResult.name);
      // Students are not part of update DTO, so they should be handled based on what preload/save does
      // The mapClassToClassDto will map them if present on updatedEntity
    });
    // ... other update tests for conflict, not found, etc.
  });

  describe('remove', () => {
    it('should remove a class successfully', async () => {
      classRepository.findOneBy.mockResolvedValue(baseMockClassEntity);
      classRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('class-uuid-1');
      expect(classRepository.delete).toHaveBeenCalledWith('class-uuid-1');
    });
    // ... other remove tests
  });

  // New tests for listStudentsInClass
  describe('listStudentsInClass', () => {
    const classId = 'test-class-id';

    it('should return an array of StudentDto for students enrolled in the class', async () => {
      const mockClassWithStudents = {
        id: classId,
        name: 'Class With Students',
        students: [mockStudent1, mockStudent2], // mockStudent1 is in a class, mockStudent2 is not
        // other properties...
      } as ClassEntity;
      classRepository.findOne.mockResolvedValue(mockClassWithStudents);

      const result = await service.listStudentsInClass(classId);

      expect(classRepository.findOne).toHaveBeenCalledWith({
        where: { id: classId },
        relations: ['students', 'students.currentClass'],
      });
      expect(result.length).toBe(2);
      expect(result).toContainEqual(mockStudent1Dto);
      expect(result).toContainEqual(mockStudent2Dto);
      expect(result.find(s => s.id === mockStudent1.id).currentClassName).toEqual(mockStudentClass.name);
      expect(result.find(s => s.id === mockStudent2.id).currentClassName).toBeNull();
    });

    it('should return an empty array if the class has no students', async () => {
      const mockClassWithoutStudents = {
        id: classId,
        name: 'Class Without Students',
        students: [],
        // other properties...
      } as ClassEntity;
      classRepository.findOne.mockResolvedValue(mockClassWithoutStudents);

      const result = await service.listStudentsInClass(classId);
      expect(result).toEqual([]);
    });

    it('should also return an empty array if class.students is null', async () => {
        const mockClassWithNullStudents = {
          id: classId,
          name: 'Class With Null Students',
          students: null, // Test this edge case
        } as ClassEntity;
        classRepository.findOne.mockResolvedValue(mockClassWithNullStudents);

        const result = await service.listStudentsInClass(classId);
        expect(result).toEqual([]); // Service logic handles null students and returns []
      });

    it('should throw NotFoundException if the class is not found', async () => {
      classRepository.findOne.mockResolvedValue(null);
      await expect(service.listStudentsInClass('non-existent-class-id')).rejects.toThrow(NotFoundException);
    });
  });
});
