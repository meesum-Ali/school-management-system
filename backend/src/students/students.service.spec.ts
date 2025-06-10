import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

const mockStudentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: MockRepository<Student>;

  const mockStudent: Student = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('2000-01-01'),
    email: 'john.doe@example.com',
    studentId: 'S12345',
  };

  const mockCreateStudentDto: CreateStudentDto = {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('2000-01-01'),
    email: 'john.doe@example.com',
    studentId: 'S12345',
  };

  const mockUpdateStudentDto: UpdateStudentDto = {
    firstName: 'Johnny',
  };

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
    it('should create and return a student', async () => {
      repository.create.mockReturnValue(mockStudent);
      repository.save.mockResolvedValue(mockStudent);

      const result = await service.create(mockCreateStudentDto);
      expect(repository.create).toHaveBeenCalledWith(mockCreateStudentDto);
      expect(repository.save).toHaveBeenCalledWith(mockStudent);
      expect(result).toEqual(mockStudent);
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      repository.find.mockResolvedValue([mockStudent]);
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockStudent]);
    });
  });

  describe('findOne', () => {
    it('should return a student if found', async () => {
      repository.findOneBy.mockResolvedValue(mockStudent);
      const result = await service.findOne(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return a student if found', async () => {
      repository.preload.mockResolvedValue(mockStudent); // mock preload
      repository.save.mockResolvedValue({ ...mockStudent, ...mockUpdateStudentDto });

      const result = await service.update(1, mockUpdateStudentDto);
      expect(repository.preload).toHaveBeenCalledWith({ id: 1, ...mockUpdateStudentDto });
      expect(repository.save).toHaveBeenCalledWith(mockStudent);
      expect(result).toEqual({ ...mockStudent, ...mockUpdateStudentDto });
    });

    it('should throw NotFoundException if student to update is not found', async () => {
      repository.preload.mockResolvedValue(null);
      await expect(service.update(1, mockUpdateStudentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a student successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if student to remove is not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
