import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { School } from '../schools/entities/school.entity';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

const mockSchool = new School();
mockSchool.id = 'school-1';
mockSchool.name = 'Test School';

let mockUserEntity: User;

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(mockUserEntity),
  })),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    // Reset mockUserEntity before each test to ensure isolation
    mockUserEntity = new User();
    mockUserEntity.id = 'some-uuid';
    mockUserEntity.username = 'testuser';
    mockUserEntity.email = 'test@example.com';
    mockUserEntity.password = 'hashedPassword';
    mockUserEntity.firstName = 'Test';
    mockUserEntity.lastName = 'User';
    mockUserEntity.isActive = true;
    mockUserEntity.roles = [UserRole.STUDENT];
    mockUserEntity.schoolId = 'school-1';
    mockUserEntity.school = Promise.resolve(mockSchool);
    mockUserEntity.createdAt = new Date();
    mockUserEntity.updatedAt = new Date();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));

    (bcrypt.hash as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      roles: [UserRole.STUDENT],
    };

    it('should create and return a user dto if username and email are unique', async () => {
        repository.findOne.mockResolvedValueOnce(null);
        const newUser = new User();
        Object.assign(newUser, createUserDto, {
          id: 'new-uuid',
          schoolId: 'school-1',
          password: 'hashedPassword',
        });
        repository.create.mockReturnValue(newUser);
        repository.save.mockResolvedValue(newUser);

        const result = await service.create(createUserDto);

        expect(result).toMatchObject({
          username: createUserDto.username,
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          roles: createUserDto.roles,
        });
        expect((result as any).password).toBeUndefined();
      });

    it('should throw ConflictException if username already exists', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const uniqueViolation = new QueryFailedError('', [], new Error());
      (uniqueViolation as any).code = '23505';
      (uniqueViolation as any).message = 'duplicate key value violates unique constraint "users_username_key"';
      repository.save.mockRejectedValueOnce(uniqueViolation);
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of user dtos for the current tenant', async () => {
      repository.find.mockResolvedValueOnce([mockUserEntity]);
      const result = await service.findAll('school-1');
      expect(repository.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockUserEntity.id,
        username: mockUserEntity.username,
        email: mockUserEntity.email,
        firstName: mockUserEntity.firstName,
        lastName: mockUserEntity.lastName,
        isActive: mockUserEntity.isActive,
        roles: mockUserEntity.roles,
        schoolId: 'school-1',
      });
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user dto if found in the current tenant', async () => {
      repository.findOneBy.mockResolvedValueOnce(mockUserEntity);
      const result = await service.findOne('some-uuid', 'school-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'some-uuid'
      });
      expect(result).toMatchObject({
        id: mockUserEntity.id,
        username: mockUserEntity.username,
        email: mockUserEntity.email,
        firstName: mockUserEntity.firstName,
        lastName: mockUserEntity.lastName,
        isActive: mockUserEntity.isActive,
        roles: mockUserEntity.roles,
        schoolId: mockUserEntity.schoolId,
      });
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.findOne('bad-uuid', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      email: 'updated@example.com',
    };

    beforeEach(() => {
      // Mock the initial lookup in the update method
      repository.findOneBy.mockResolvedValue(mockUserEntity);
    });

    it('should update and return a user dto if found', async () => {
        const updatedUser = { ...mockUserEntity, ...updateUserDto };
        repository.findOne.mockResolvedValueOnce(null);
        repository.save.mockResolvedValue(updatedUser);

        const result = await service.update('some-uuid', updateUserDto, 'school-1');

        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updateUserDto));
        expect(result).toMatchObject({
          id: mockUserEntity.id,
          firstName: 'Updated',
          email: updateUserDto.email,
        });
      });

    it('should throw NotFoundException if user to update is not found', async () => {
      repository.findOneBy.mockResolvedValue(null); // Override findOneBy for this test
      await expect(
        service.update('bad-uuid', updateUserDto, 'school-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated username already exists for another user', async () => {
      const conflictingUser = { ...mockUserEntity, id: 'another-uuid', username: 'newusername' };
      repository.findOne.mockResolvedValueOnce(conflictingUser);
      await expect(
        service.update('some-uuid', { username: 'newusername' }, 'school-1'),
      ).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          username: 'newusername',
          schoolId: 'school-1',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      repository.findOneBy.mockResolvedValueOnce(mockUserEntity);
      repository.delete.mockResolvedValueOnce({ affected: 1, raw: '' });
      await service.remove('some-uuid', 'school-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'some-uuid'
      });
      expect(repository.delete).toHaveBeenCalledWith('some-uuid');
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.remove('bad-uuid', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});