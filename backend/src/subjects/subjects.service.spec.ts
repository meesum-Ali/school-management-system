import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectEntity } from './entities/subject.entity';
import { ClassEntity } from '../classes/entities/class.entity'; // Import ClassEntity
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassDto } from '../classes/dto/class.dto'; // Import ClassDto

const mockSubjectRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

// No need to mock ClassRepository if SubjectsService doesn't directly use it

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('SubjectsService', () => {
  let service: SubjectsService;
  let subjectRepository: MockRepository<SubjectEntity>;

  const mockClassId1 = 'class-uuid-1';
  const mockClass1 = new ClassEntity();
  mockClass1.id = mockClassId1;
  mockClass1.name = 'Class A';

  const baseMockSubjectEntity = new SubjectEntity();
  baseMockSubjectEntity.id = 'subject-uuid-1';
  baseMockSubjectEntity.name = 'Mathematics';
  baseMockSubjectEntity.code = 'MATH101';
  baseMockSubjectEntity.description = 'Core mathematics subject';
  baseMockSubjectEntity.classes = [mockClass1]; // Initialize with one class
  baseMockSubjectEntity.createdAt = new Date();
  baseMockSubjectEntity.updatedAt = new Date();

  const mockSubjectDto = new SubjectDto({
    ...baseMockSubjectEntity,
    classes: baseMockSubjectEntity.classes.map(c => new ClassDto(c)),
  });


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(SubjectEntity),
          useFactory: mockSubjectRepository,
        },
        // No need to provide ClassRepository mock if not directly injected in SubjectsService
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    subjectRepository = module.get<MockRepository<SubjectEntity>>(getRepositoryToken(SubjectEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubjectDto = {
      name: 'Physics',
      code: 'PHY101',
      description: 'Fundamental physics',
    };
    const createdEntity = { ...new SubjectEntity(), ...createDto, id: 'subject-uuid-2', createdAt: new Date(), updatedAt: new Date() };
    const createdDtoResult = new SubjectDto({ ...createdEntity });

    it('should create and return a subject DTO if name and code are unique', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdEntity);
      repository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: [{ name: createDto.name }, { code: createDto.code }] });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdDtoResult);
    });

    it('should create and return a subject DTO if only name is provided and unique', async () => {
        const createDtoNoCode: CreateSubjectDto = { name: 'Chemistry', description: 'Intro to Chem' };
        const createdEntityNoCode = { ...new SubjectEntity(), ...createDtoNoCode, id: 'subject-uuid-3' };
        const createdDtoResultNoCode = new SubjectDto({ ...createdEntityNoCode });

        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(createdEntityNoCode);
        repository.save.mockResolvedValue(createdEntityNoCode);

        const result = await service.create(createDtoNoCode);
        expect(repository.findOne).toHaveBeenCalledWith({ where: [{ name: createDtoNoCode.name }] }); // Only name in where clause
        expect(result.name).toEqual(createDtoNoCode.name);
    });


    it('should throw ConflictException if subject name already exists', async () => {
      repository.findOne.mockResolvedValue({ ...baseMockSubjectEntity, name: createDto.name });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if subject code already exists', async () => {
      repository.findOne.mockResolvedValue({ ...baseMockSubjectEntity, code: createDto.code });
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on save if name constraint violated (race condition)', async () => {
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(createdEntity);
        const queryFailedError = new QueryFailedError('query', [], { code: '23505', message: 'subjects_name_key' } as any);
        repository.save.mockRejectedValue(queryFailedError);
        await expect(service.create(createDto)).rejects.toThrow(new ConflictException(`Subject with name "${createDto.name}" already exists.`));
    });
  });

  describe('findAll', () => {
    it('should return an array of subject DTOs', async () => {
      repository.find.mockResolvedValue([baseMockSubjectEntity]);
      const result = await service.findAll();
      expect(result).toEqual([mockSubjectDto]);
    });
  });

  describe('findOne', () => {
    it('should return a subject DTO if found', async () => {
      repository.findOneBy.mockResolvedValue(baseMockSubjectEntity);
      const result = await service.findOne('subject-uuid-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'subject-uuid-1' });
      expect(result).toEqual(mockSubjectDto);
    });

    it('should throw NotFoundException if subject not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSubjectDto = { name: 'Advanced Mathematics' };
    const preloadedEntity = { ...baseMockSubjectEntity, ...updateDto };
    const updatedEntity = { ...preloadedEntity, updatedAt: new Date() };
    const updatedDtoResult = new SubjectDto({ ...updatedEntity });

    it('should update and return a subject DTO if found and name/code are unique', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.preload.mockResolvedValue(preloadedEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('subject-uuid-1', updateDto);
      expect(repository.preload).toHaveBeenCalledWith(expect.objectContaining({ id: 'subject-uuid-1', name: updateDto.name }));
      expect(repository.save).toHaveBeenCalledWith(preloadedEntity);
      expect(result).toEqual(updatedDtoResult);
    });

    it('should throw ConflictException if updated name already exists for another subject', async () => {
      const conflictingUpdateDto: UpdateSubjectDto = { name: 'Existing Subject Name' };
      repository.findOne.mockResolvedValue({ ...new SubjectEntity(), id: 'other-subject-uuid', name: 'Existing Subject Name' });
      await expect(service.update('subject-uuid-1', conflictingUpdateDto)).rejects.toThrow(ConflictException);
    });

    it('should allow clearing code and description to null', async () => {
        const updateToNullDto: UpdateSubjectDto = { code: null, description: null };
        const preloadedWithNulls = { ...baseMockSubjectEntity, code: null, description: null };
        repository.preload.mockResolvedValue(preloadedWithNulls);
        repository.save.mockResolvedValue(preloadedWithNulls);

        const result = await service.update('subject-uuid-1', updateToNullDto);
        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ code: null, description: null }));
        expect(result.code).toBeNull();
        expect(result.description).toBeNull();
    });

    it('should throw NotFoundException if subject to update is not found by preload', async () => {
      repository.preload.mockResolvedValue(null);
      await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a subject successfully', async () => {
      repository.findOneBy.mockResolvedValue(baseMockSubjectEntity);
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('subject-uuid-1');
      expect(repository.delete).toHaveBeenCalledWith('subject-uuid-1');
    });

    it('should throw NotFoundException if subject to remove is not found initially', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
