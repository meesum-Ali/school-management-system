import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';

// Mock the repository
const mockStudentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(), // For conflict checks
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: MockRepository<Student>;

  // Using a base mock student entity for tests
  const baseMockStudentEntity = new Student();
  baseMockStudentEntity.id = 'test-uuid';
  baseMockStudentEntity.firstName = 'John';
  baseMockStudentEntity.lastName = 'Doe';
  baseMockStudentEntity.dateOfBirth = new Date('2000-01-01');
  baseMockStudentEntity.email = 'john.doe@example.com';
  baseMockStudentEntity.studentId = 'S12345';
  baseMockStudentEntity.createdAt = new Date();
  baseMockStudentEntity.updatedAt = new Date();

  // Corresponding DTO
  const mockStudentDto = new StudentDto({ ...baseMockStudentEntity });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useFactory: mockStudentRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get<MockRepository<Student>>(getRepositoryToken(Student));
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
    const createdEntity = { ...new Student(), ...createDto, id: 'new-uuid', createdAt: new Date(), updatedAt: new Date() };
    const createdDto = new StudentDto({ ...createdEntity });

    it('should create and return a student DTO if studentId and email are unique', async () => {
      repository.findOne.mockResolvedValue(null); // No existing student with same studentId or email
      repository.create.mockReturnValue(createdEntity); // Mock what repository.create returns
      repository.save.mockResolvedValue(createdEntity);   // Mock what repository.save returns

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: [{ studentId: createDto.studentId }, { email: createDto.email }] });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdDto);
    });

    it('should throw ConflictException if studentId already exists', async () => {
      repository.findOne.mockResolvedValue({ ...baseMockStudentEntity, studentId: createDto.studentId });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findOne.mockResolvedValue({ ...baseMockStudentEntity, email: createDto.email });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on save if studentId constraint violated (race condition)', async () => {
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(createdEntity);
        const queryFailedError = new QueryFailedError('query', [], { code: '23505', message: 'students_studentId_key' } as any); // Adjust constraint name
        repository.save.mockRejectedValue(queryFailedError);
        await expect(service.create(createDto)).rejects.toThrow(new ConflictException(`Student ID "${createDto.studentId}" already exists.`));
    });
  });

  describe('findAll', () => {
    it('should return an array of student DTOs', async () => {
      repository.find.mockResolvedValue([baseMockStudentEntity]);
      const result = await service.findAll();
      expect(result).toEqual([mockStudentDto]);
    });
  });

  describe('findOne', () => {
    it('should return a student DTO if found', async () => {
      repository.findOneBy.mockResolvedValue(baseMockStudentEntity);
      const result = await service.findOne('test-uuid');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'test-uuid' });
      expect(result).toEqual(mockStudentDto);
    });

    it('should throw NotFoundException if student not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateStudentDto = { firstName: 'Johnny' };
    const preloadedEntity = { ...baseMockStudentEntity, ...updateDto }; // Entity after preload
    const updatedEntity = { ...preloadedEntity, updatedAt: new Date() }; // Entity after save
    const updatedDto = new StudentDto({ ...updatedEntity });


    it('should update and return a student DTO if found', async () => {
      repository.findOne.mockResolvedValue(null); // No conflict with studentId/email if they were being updated
      repository.preload.mockResolvedValue(preloadedEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('test-uuid', updateDto);

      expect(repository.preload).toHaveBeenCalledWith({ id: 'test-uuid', ...updateDto });
      expect(repository.save).toHaveBeenCalledWith(preloadedEntity);
      expect(result).toEqual(updatedDto);
    });

    it('should throw ConflictException if updated studentId already exists for another student', async () => {
        const conflictingUpdateDto: UpdateStudentDto = { studentId: 'S-Other' };
        repository.findOne.mockResolvedValue({ ...baseMockStudentEntity, id: 'other-uuid', studentId: 'S-Other' }); // studentId exists on another student
        await expect(service.update('test-uuid', conflictingUpdateDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if student to update is not found by preload', async () => {
      repository.preload.mockResolvedValue(null);
      await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a student successfully', async () => {
      repository.findOneBy.mockResolvedValue(baseMockStudentEntity); // Mock that student exists
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('test-uuid');
      expect(repository.delete).toHaveBeenCalledWith('test-uuid');
    });

    it('should throw NotFoundException if student to remove is not found initially', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if delete operation affects 0 rows', async () => {
      repository.findOneBy.mockResolvedValue(baseMockStudentEntity); // Student found
      repository.delete.mockResolvedValue({ affected: 0 }); // ...but delete has no effect
      await expect(service.remove('test-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
