import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity'; // Import SubjectEntity
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto'; // Import SubjectDto

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
  let subjectRepository: MockRepository<SubjectEntity>;

  const mockTeacherId = 'teacher-uuid-1';
  const mockSubjectId1 = 'subject-uuid-1';
  const mockSubjectId2 = 'subject-uuid-2';

  const mockSubject1 = new SubjectEntity();
  mockSubject1.id = mockSubjectId1;
  mockSubject1.name = 'Math';

  const mockSubject2 = new SubjectEntity();
  mockSubject2.id = mockSubjectId2;
  mockSubject2.name = 'Science';

  const baseMockClassEntity = new ClassEntity();
  baseMockClassEntity.id = 'class-uuid-1';
  baseMockClassEntity.name = 'Mathematics 101';
  baseMockClassEntity.level = 'Grade 10';
  baseMockClassEntity.homeroomTeacherId = mockTeacherId;
  baseMockClassEntity.subjects = [mockSubject1]; // Initialize with one subject
  baseMockClassEntity.createdAt = new Date();
  baseMockClassEntity.updatedAt = new Date();

  const mockClassDto = new ClassDto({
    ...baseMockClassEntity,
    subjects: baseMockClassEntity.subjects.map(s => new SubjectDto(s))
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
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdEntity);
      repository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdDtoResult);
    });

    it('should throw ConflictException if class name already exists', async () => {
      repository.findOne.mockResolvedValue(baseMockClassEntity); // Simulate name conflict
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on save if name constraint violated (race condition)', async () => {
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(createdEntity);
        // Simulate a QueryFailedError for unique constraint violation
        const queryFailedError = new QueryFailedError('query', [], { code: '23505', message: 'classes_name_key' } as any);
        repository.save.mockRejectedValue(queryFailedError);
        await expect(service.create(createDto)).rejects.toThrow(new ConflictException(`Class with name "${createDto.name}" already exists.`));
    });
  });

  describe('findAll', () => {
    it('should return an array of class DTOs', async () => {
      repository.find.mockResolvedValue([baseMockClassEntity]);
      const result = await service.findAll();
      expect(result).toEqual([mockClassDto]);
    });
  });

  describe('findOne', () => {
    it('should return a class DTO if found', async () => {
      repository.findOneBy.mockResolvedValue(baseMockClassEntity);
      const result = await service.findOne('class-uuid-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'class-uuid-1' });
      expect(result).toEqual(mockClassDto);
    });

    it('should throw NotFoundException if class not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateClassDto = { name: 'Advanced Mathematics 101' };
    const preloadedEntity = { ...baseMockClassEntity, ...updateDto };
    const updatedEntity = { ...preloadedEntity, updatedAt: new Date() };
    const updatedDtoResult = new ClassDto({ ...updatedEntity });

    it('should update and return a class DTO if found and name is unique', async () => {
      repository.findOne.mockResolvedValue(null); // No name conflict
      repository.preload.mockResolvedValue(preloadedEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('class-uuid-1', updateDto);
      expect(repository.preload).toHaveBeenCalledWith({ id: 'class-uuid-1', ...updateDto });
      expect(repository.save).toHaveBeenCalledWith(preloadedEntity);
      expect(result).toEqual(updatedDtoResult);
    });

    it('should throw ConflictException if updated name already exists for another class', async () => {
      const conflictingUpdateDto: UpdateClassDto = { name: 'Existing Class Name' };
      repository.findOne.mockResolvedValue({ ...new ClassEntity(), id: 'other-class-uuid', name: 'Existing Class Name' });
      await expect(service.update('class-uuid-1', conflictingUpdateDto)).rejects.toThrow(ConflictException);
    });

    it('should allow clearing homeroomTeacherId', async () => {
        const updateToNullDto: UpdateClassDto = { homeroomTeacherId: null };
        const preloadedWithNullTeacher = { ...baseMockClassEntity, homeroomTeacherId: null };
        repository.preload.mockResolvedValue(preloadedWithNullTeacher);
        repository.save.mockResolvedValue(preloadedWithNullTeacher);

        const result = await service.update('class-uuid-1', updateToNullDto);
        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ homeroomTeacherId: null }));
        expect(result.homeroomTeacherId).toBeNull();
    });


    it('should throw NotFoundException if class to update is not found by preload', async () => {
      repository.preload.mockResolvedValue(null);
      await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a class successfully', async () => {
      repository.findOneBy.mockResolvedValue(baseMockClassEntity);
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('class-uuid-1');
      expect(repository.delete).toHaveBeenCalledWith('class-uuid-1');
    });

    it('should throw NotFoundException if class to remove is not found initially', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if delete affects 0 rows', async () => {
        repository.findOneBy.mockResolvedValue(baseMockClassEntity);
        repository.delete.mockResolvedValue({ affected: 0 });
        await expect(service.remove('class-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
