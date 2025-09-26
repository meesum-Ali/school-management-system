import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { SubjectsService } from './subjects.service';
import { SubjectEntity } from './entities/subject.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TenantProvider } from '../core/tenant/tenant.provider';
import { School } from '../schools/entities/school.entity';
import { ClassSchedule } from '../class-schedule/entities/class-schedule.entity';

const mockSubjectRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repository: MockRepository<SubjectEntity>;

  const mockSchool = new School();
  mockSchool.id = 'school-uuid-1';

  let baseMockSubjectEntity: SubjectEntity;

  beforeEach(async () => {
    baseMockSubjectEntity = new SubjectEntity();
    baseMockSubjectEntity.id = 'subject-uuid-1';
    baseMockSubjectEntity.name = 'Mathematics';
    baseMockSubjectEntity.code = 'MTH101';
    baseMockSubjectEntity.description = 'Basic mathematics';
    baseMockSubjectEntity.createdAt = new Date();
    baseMockSubjectEntity.updatedAt = new Date();
    baseMockSubjectEntity.schoolId = mockSchool.id;
    baseMockSubjectEntity.school = Promise.resolve(mockSchool);
    baseMockSubjectEntity.classes = Promise.resolve([]);
    baseMockSubjectEntity.classSchedules = Promise.resolve([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(SubjectEntity),
          useFactory: mockSubjectRepository,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    repository = module.get<MockRepository<SubjectEntity>>(
      getRepositoryToken(SubjectEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubjectDto = { name: 'Science', code: 'SCI101' };
    const createdEntity = { ...baseMockSubjectEntity, ...createDto, id: 'new-uuid', classes: Promise.resolve([]) };

    it('should create and return a subject DTO if name and code are unique', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdEntity);
      repository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto, 'school-uuid-1');
      expect(repository.create).toHaveBeenCalledWith({ ...createDto, schoolId: 'school-uuid-1' });
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result.name).toEqual(createDto.name);
    });
  });

  describe('findAll', () => {
    it('should return an array of subject DTOs', async () => {
        repository.find.mockResolvedValue([baseMockSubjectEntity]);
        const result = await service.findAll('school-uuid-1');
        expect(result[0].name).toEqual(baseMockSubjectEntity.name);
      });
  });

  describe('findOne', () => {
    it('should return a subject DTO with classes if found', async () => {
      const subjectWithClasses = { ...baseMockSubjectEntity, classes: Promise.resolve([new ClassEntity()]) };
      repository.findOne.mockResolvedValue(subjectWithClasses);
      const result = await service.findOne('subject-uuid-1', 'school-uuid-1');
      expect(result.classes.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSubjectDto = { name: 'Advanced Mathematics' };
    const updatedEntity = { ...baseMockSubjectEntity, ...updateDto };

    it('should update and return a subject DTO if found', async () => {
        repository.findOneBy.mockResolvedValue(baseMockSubjectEntity);
        repository.findOne.mockResolvedValue(null); // for conflict check
        repository.save.mockResolvedValue(updatedEntity);
        repository.findOne.mockResolvedValue(updatedEntity); // for the final fetch
        const result = await service.update('subject-uuid-1', updateDto, 'school-uuid-1');
        expect(result.name).toEqual(updateDto.name);
      });
  });

  describe('remove', () => {
    it('should remove a subject successfully', async () => {
        repository.findOneBy.mockResolvedValue(baseMockSubjectEntity);
        repository.delete.mockResolvedValue({ affected: 1, raw: {} });
        await expect(service.remove('subject-uuid-1', 'school-uuid-1')).resolves.toBeUndefined();
      });
  });

  describe('listClassesForSubject', () => {
      it('should list classes for a subject', async () => {
          repository.findOne.mockResolvedValue(baseMockSubjectEntity);
          const result = await service.listClassesForSubject('subject-uuid-1', 'school-uuid-1');
          expect(result).toBeDefined();
      });
  });
});