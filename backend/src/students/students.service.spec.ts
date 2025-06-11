import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { ClassEntity } from '../../classes/entities/class.entity'; // Import ClassEntity
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';

// Mock Student repository
const mockStudentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(), // Used for conflict checks and by service.findOne
  findOneBy: jest.fn(), // Used by service.findOne (older) and some internal checks
  preload: jest.fn(),
  delete: jest.fn(),
});

// Mock Class repository
const mockClassRepository = () => ({
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepository: MockRepository<Student>;
  let classRepository: MockRepository<ClassEntity>;

  const mockClassId = 'class-uuid-123';
  const mockClassName = 'Test Class 101';

  const mockClassEntity = new ClassEntity();
  mockClassEntity.id = mockClassId;
  mockClassEntity.name = mockClassName;
  // ... other class properties if needed

  const baseMockStudentEntity = new Student();
  baseMockStudentEntity.id = 'student-uuid-456';
  baseMockStudentEntity.firstName = 'John';
  baseMockStudentEntity.lastName = 'Doe';
  baseMockStudentEntity.dateOfBirth = new Date('2000-01-01');
  baseMockStudentEntity.email = 'john.doe@example.com';
  baseMockStudentEntity.studentId = 'S12345';
  baseMockStudentEntity.createdAt = new Date();
  baseMockStudentEntity.updatedAt = new Date();
  baseMockStudentEntity.classId = null;
  baseMockStudentEntity.currentClass = null;

  const mockStudentDto = new StudentDto({
    ...baseMockStudentEntity,
    currentClassName: null,
  });


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useFactory: mockStudentRepository,
        },
        { // Add ClassRepository mock
          provide: getRepositoryToken(ClassEntity),
          useFactory: mockClassRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepository = module.get<MockRepository<Student>>(getRepositoryToken(Student));
    classRepository = module.get<MockRepository<ClassEntity>>(getRepositoryToken(ClassEntity));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateStudentDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('2001-02-02'),
      email: 'jane.doe@example.com',
      studentId: 'S67890',
    };
    const createdEntity = { ...new Student(), ...createDto, id: 'new-uuid', createdAt: new Date(), updatedAt: new Date(), classId: null, currentClass: null };

    it('should create and return a student DTO if studentId and email are unique (no classId)', async () => {
      studentRepository.findOne.mockResolvedValue(null);
      studentRepository.create.mockReturnValue(createdEntity);
      studentRepository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(studentRepository.create).toHaveBeenCalledWith(createDto);
      expect(studentRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result.classId).toBeNull();
      expect(result.currentClassName).toBeNull();
    });

    it('should create a student and assign to class if valid classId is provided', async () => {
      const createDtoWithClass: CreateStudentDto = { ...createDto, classId: mockClassId };
      const entityWithClass = { ...createdEntity, classId: mockClassId, currentClass: mockClassEntity };

      studentRepository.findOne.mockResolvedValue(null); // No conflict for studentId/email
      classRepository.findOneBy.mockResolvedValue(mockClassEntity); // Class exists
      studentRepository.create.mockReturnValue({ ...createdEntity, classId: mockClassId }); // create DTO has classId
      studentRepository.save.mockResolvedValue(entityWithClass); // save returns entity with classId
      // Mock the findOne call that happens if classId is present (to load relation for DTO)
      studentRepository.findOne.mockResolvedValueOnce(null) // For conflict check
                             .mockResolvedValueOnce(entityWithClass); // For reloading with relation

      const result = await service.create(createDtoWithClass);

      expect(classRepository.findOneBy).toHaveBeenCalledWith({ id: mockClassId });
      expect(studentRepository.create).toHaveBeenCalledWith(createDtoWithClass);
      expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining({ classId: mockClassId }));
      expect(studentRepository.findOne).toHaveBeenCalledWith({ where: { id: entityWithClass.id }, relations: ['currentClass'] });
      expect(result.classId).toEqual(mockClassId);
      expect(result.currentClassName).toEqual(mockClassName);
    });

    it('should throw NotFoundException when creating a student with an invalid classId', async () => {
      const createDtoWithInvalidClass: CreateStudentDto = { ...createDto, classId: 'invalid-class-id' };
      studentRepository.findOne.mockResolvedValue(null); // No conflict for studentId/email
      classRepository.findOneBy.mockResolvedValue(null); // Class does NOT exist

      await expect(service.create(createDtoWithInvalidClass)).rejects.toThrow(
        new NotFoundException(`Class with ID "${createDtoWithInvalidClass.classId}" not found.`),
      );
      expect(classRepository.findOneBy).toHaveBeenCalledWith({ id: 'invalid-class-id' });
      expect(studentRepository.save).not.toHaveBeenCalled();
    });


    it('should throw ConflictException if studentId already exists', async () => {
      studentRepository.findOne.mockResolvedValue({ ...baseMockStudentEntity, studentId: createDto.studentId });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of student DTOs', async () => {
      studentRepository.find.mockResolvedValue([baseMockStudentEntity]);
      const result = await service.findAll();
      expect(result[0]).toEqual(expect.objectContaining(mockStudentDto));
    });
  });

  describe('findOne', () => {
    it('should return StudentDto with classId and currentClassName if student is enrolled', async () => {
      const studentWithClass = { ...baseMockStudentEntity, classId: mockClassId, currentClass: mockClassEntity };
      studentRepository.findOne.mockResolvedValue(studentWithClass); // findOne now used for relations

      const result = await service.findOne(baseMockStudentEntity.id);

      expect(studentRepository.findOne).toHaveBeenCalledWith({ where: { id: baseMockStudentEntity.id }, relations: ['currentClass'] });
      expect(result.classId).toEqual(mockClassId);
      expect(result.currentClassName).toEqual(mockClassName);
    });

    it('should return StudentDto with null classId and currentClassName if student is not enrolled', async () => {
      studentRepository.findOne.mockResolvedValue(baseMockStudentEntity); // currentClass is null

      const result = await service.findOne(baseMockStudentEntity.id);

      expect(studentRepository.findOne).toHaveBeenCalledWith({ where: { id: baseMockStudentEntity.id }, relations: ['currentClass'] });
      expect(result.classId).toBeNull();
      expect(result.currentClassName).toBeNull();
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const studentIdToUpdate = baseMockStudentEntity.id;

    it('should update student and assign to a new class if valid classId is provided', async () => {
      const updateDto: UpdateStudentDto = { classId: mockClassId, firstName: "UpdatedName" };
      const preloadedStudent = { ...baseMockStudentEntity, firstName: "UpdatedName" }; // Does not have classId yet from preload
      const studentAfterClassCheck = { ...preloadedStudent, classId: mockClassId }; // classId added after check
      const savedStudent = { ...studentAfterClassCheck, currentClass: mockClassEntity }; // saved entity has relation

      studentRepository.findOne.mockResolvedValue(null); // For conflict check if email/studentId were changing
      classRepository.findOneBy.mockResolvedValue(mockClassEntity); // Class exists
      studentRepository.preload.mockResolvedValue(preloadedStudent);
      studentRepository.save.mockResolvedValue(savedStudent);
       // Mock the findOne call that happens due to service.update calling service.findOne internally at the end (if save is successful and DTO is mapped)
      // This is not ideal, service.update should map itself or use the already loaded relation if save returns it
      // For now, let's assume service.update returns the DTO from savedStudent directly.
      // The service code was: return this.mapStudentToStudentDto(updatedStudent);
      // So, if updatedStudent from save has currentClass, it's fine.

      const result = await service.update(studentIdToUpdate, updateDto);

      expect(classRepository.findOneBy).toHaveBeenCalledWith({ id: mockClassId });
      expect(studentRepository.preload).toHaveBeenCalledWith({ id: studentIdToUpdate, ...updateDto });
      expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: studentIdToUpdate, classId: mockClassId, firstName: "UpdatedName" }));
      expect(result.classId).toEqual(mockClassId);
      expect(result.currentClassName).toEqual(mockClassName); // Depends on mapStudentToStudentDto and if save returns relation
    });

    it('should throw NotFoundException when updating a student with an invalid classId', async () => {
      const updateDto: UpdateStudentDto = { classId: 'invalid-class-id' };
      classRepository.findOneBy.mockResolvedValue(null); // Class does NOT exist

      await expect(service.update(studentIdToUpdate, updateDto)).rejects.toThrow(
         new NotFoundException(`Class with ID "${updateDto.classId}" not found.`),
      );
      expect(classRepository.findOneBy).toHaveBeenCalledWith({ id: 'invalid-class-id' });
      expect(studentRepository.preload).not.toHaveBeenCalled(); // Preload check is after classId check
      expect(studentRepository.save).not.toHaveBeenCalled();
    });

    it('should update student and unassign from class if classId is null', async () => {
      const updateDto: UpdateStudentDto = { classId: null };
      const studentWithExistingClass = { ...baseMockStudentEntity, classId: 'some-old-class-id', currentClass: new ClassEntity() };
      const preloadedStudent = { ...studentWithExistingClass }; // after preload with classId: null
      const savedStudent = { ...preloadedStudent, classId: null, currentClass: null };

      studentRepository.preload.mockResolvedValue(preloadedStudent); // preload will apply {classId: null}
      studentRepository.save.mockResolvedValue(savedStudent);
      // classRepository.findOneBy should not be called if classId is null

      const result = await service.update(studentIdToUpdate, updateDto);

      expect(classRepository.findOneBy).not.toHaveBeenCalled();
      expect(studentRepository.preload).toHaveBeenCalledWith({ id: studentIdToUpdate, ...updateDto });
      expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: studentIdToUpdate, classId: null }));
      expect(result.classId).toBeNull();
      expect(result.currentClassName).toBeNull();
    });

    it('should throw NotFoundException if student to update is not found by preload', async () => {
        const updateDto: UpdateStudentDto = { firstName: "New Name" };
        // Need to handle the classId check first if classId is in updateDto.
        // If updateDto.classId is undefined, then classId check is skipped.
        studentRepository.preload.mockResolvedValue(null);
        await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignStudentToClass', () => {
    const studentId = baseMockStudentEntity.id;

    it('should assign student to class and return updated StudentDto', async () => {
      const studentToAssign = { ...baseMockStudentEntity };
      const studentAssigned = { ...baseMockStudentEntity, classId: mockClassId, currentClass: mockClassEntity };

      studentRepository.findOneBy.mockResolvedValue(studentToAssign);
      classRepository.findOneBy.mockResolvedValue(mockClassEntity);
      studentRepository.save.mockResolvedValue(studentAssigned);
      // Mock the service.findOne call at the end of assignStudentToClass
      jest.spyOn(service, 'findOne').mockResolvedValue(new StudentDto(studentAssigned));


      const result = await service.assignStudentToClass(studentId, mockClassId);

      expect(studentRepository.findOneBy).toHaveBeenCalledWith({ id: studentId });
      expect(classRepository.findOneBy).toHaveBeenCalledWith({ id: mockClassId });
      expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: studentId, classId: mockClassId }));
      expect(service.findOne).toHaveBeenCalledWith(studentAssigned.id); // Check if findOne was called to map DTO
      expect(result.classId).toEqual(mockClassId);
      expect(result.currentClassName).toEqual(mockClassName);
    });

    it('should throw NotFoundException if student not found during assignment', async () => {
      studentRepository.findOneBy.mockResolvedValue(null);
      await expect(service.assignStudentToClass('non-existent-student', mockClassId)).rejects.toThrow(NotFoundException);
      expect(classRepository.findOneBy).not.toHaveBeenCalled();
      expect(studentRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if class not found during assignment', async () => {
      studentRepository.findOneBy.mockResolvedValue(baseMockStudentEntity);
      classRepository.findOneBy.mockResolvedValue(null); // Class not found

      await expect(service.assignStudentToClass(studentId, 'invalid-class-id')).rejects.toThrow(
        new NotFoundException(`Class with ID "invalid-class-id" not found`),
      );
      expect(studentRepository.save).not.toHaveBeenCalled();
    });

    it('should unassign student from class if classId is null and return updated StudentDto', async () => {
      const studentToUnassign = { ...baseMockStudentEntity, classId: mockClassId, currentClass: mockClassEntity }; // Initially in a class
      const studentUnassigned = { ...baseMockStudentEntity, classId: null, currentClass: null };

      studentRepository.findOneBy.mockResolvedValue(studentToUnassign);
      studentRepository.save.mockResolvedValue(studentUnassigned);
      jest.spyOn(service, 'findOne').mockResolvedValue(new StudentDto(studentUnassigned));

      const result = await service.assignStudentToClass(studentId, null);

      expect(studentRepository.findOneBy).toHaveBeenCalledWith({ id: studentId });
      expect(classRepository.findOneBy).not.toHaveBeenCalled(); // Not called for null classId
      expect(studentRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: studentId, classId: null }));
      expect(service.findOne).toHaveBeenCalledWith(studentUnassigned.id);
      expect(result.classId).toBeNull();
      expect(result.currentClassName).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a student successfully', async () => {
      studentRepository.findOneBy.mockResolvedValue(baseMockStudentEntity);
      studentRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('test-uuid');
      expect(studentRepository.delete).toHaveBeenCalledWith('test-uuid');
    });

    it('should throw NotFoundException if student to remove is not found initially', async () => {
      studentRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
