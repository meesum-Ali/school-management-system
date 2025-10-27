import { CreateStudentUseCase } from './create-student.use-case';
import { IStudentRepository } from '../../domain/repositories';
import { Student } from '../../domain/models';
import { InvalidStudentException } from '../../domain/exceptions';

describe('CreateStudentUseCase', () => {
  let useCase: CreateStudentUseCase;
  let mockRepository: jest.Mocked<IStudentRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findBySchool: jest.fn(),
      findByClass: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
    };

    useCase = new CreateStudentUseCase(mockRepository);
  });

  describe('execute', () => {
    const validDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '2005-01-15',
      schoolId: 'school-1',
      phoneNumber: '+1234567890',
      address: '123 Main St',
    };

    it('should create a new student successfully', async () => {
      mockRepository.emailExists.mockResolvedValue(false);
      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      const result = await useCase.execute(validDto);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.fullName).toBe('John Doe');
      expect(result.schoolId).toBe('school-1');
      expect(result.isEnrolled).toBe(false);
      expect(result.classId).toBeNull();
      expect(mockRepository.emailExists).toHaveBeenCalledWith(
        expect.any(Object),
        'school-1',
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Student));
    });

    it('should throw error if email already exists in school', async () => {
      mockRepository.emailExists.mockResolvedValue(true);

      await expect(useCase.execute(validDto)).rejects.toThrow(
        /Email already exists/,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should validate first name length', async () => {
      const invalidDto = { ...validDto, firstName: 'J' };
      mockRepository.emailExists.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        /at least 2 characters/,
      );
    });

    it('should validate last name length', async () => {
      const invalidDto = { ...validDto, lastName: 'D' };
      mockRepository.emailExists.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        /at least 2 characters/,
      );
    });

    it('should validate email format', async () => {
      const invalidDto = { ...validDto, email: 'invalid-email' };
      mockRepository.emailExists.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        /Email must contain @ symbol/,
      );
    });

    it('should validate date of birth', async () => {
      const invalidDto = { ...validDto, dateOfBirth: '2030-01-01' };
      mockRepository.emailExists.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        /Date of birth cannot be in the future/,
      );
    });

    it('should handle optional fields', async () => {
      const minimalDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '2005-01-15',
        schoolId: 'school-1',
      };

      mockRepository.emailExists.mockResolvedValue(false);
      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      const result = await useCase.execute(minimalDto);

      expect(result).toBeDefined();
      expect(result.phoneNumber).toBeUndefined();
      expect(result.address).toBeUndefined();
    });

    it('should return StudentResponseDto with all fields', async () => {
      mockRepository.emailExists.mockResolvedValue(false);
      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      const result = await useCase.execute(validDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('fullName');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('dateOfBirth');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('isMinor');
      expect(result).toHaveProperty('schoolId');
      expect(result).toHaveProperty('phoneNumber');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('classId');
      expect(result).toHaveProperty('isEnrolled');
    });

    it('should calculate age correctly', async () => {
      mockRepository.emailExists.mockResolvedValue(false);
      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      const result = await useCase.execute(validDto);

      expect(result.age).toBeGreaterThanOrEqual(19);
      expect(result.age).toBeLessThanOrEqual(20);
    });

    it('should determine minor status correctly', async () => {
      const adultDto = { ...validDto, dateOfBirth: '2000-01-01' };
      const minorDto = {
        ...validDto,
        email: 'minor@example.com',
        dateOfBirth: '2015-01-01',
      };

      mockRepository.emailExists.mockResolvedValue(false);
      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      const adultResult = await useCase.execute(adultDto);
      expect(adultResult.isMinor).toBe(false);

      const minorResult = await useCase.execute(minorDto);
      expect(minorResult.isMinor).toBe(true);
    });
  });
});
