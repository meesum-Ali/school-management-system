import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Not } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { TenantProvider } from '../core/tenant/tenant.provider';
import { REQUEST } from '@nestjs/core';
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
        repository.findOne.mockResolvedValue(null);
        const newUser = new User();
        Object.assign(newUser, createUserDto, {
          id: 'new-uuid',
          schoolId: 'school-1',
          password: 'hashedPassword',
        });
        repository.create.mockReturnValue(newUser);
        repository.save.mockResolvedValue(newUser);

        const result = await service.create(createUserDto);

        expect(result).toBeInstanceOf(UserDto);
        expect(result.username).toEqual(createUserDto.username);
        expect(result).not.toHaveProperty('password');
      });

    it('should throw ConflictException if username already exists', async () => {
      repository.findOne.mockResolvedValue(mockUserEntity);
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of user dtos for the current tenant', async () => {
      repository.find.mockResolvedValue([mockUserEntity]);
      const result = await service.findAll('school-1');
      expect(repository.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
      });
      expect(result).toEqual([new UserDto(mockUserEntity)]);
      expect(result[0].schoolId).toEqual('school-1');
    });
  });

  describe('findOne', () => {
    it('should return a user dto if found in the current tenant', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity);
      const result = await service.findOne('some-uuid', 'school-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'some-uuid'
      });
      expect(result).toEqual(new UserDto(mockUserEntity));
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
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
    const adminUser = { ...mockUserEntity, roles: [UserRole.SCHOOL_ADMIN] };

    beforeEach(() => {
      // Mock the initial lookup in the update method
      repository.findOneBy.mockResolvedValue(mockUserEntity);
    });

    it('should update and return a user dto if found', async () => {
        const updatedUser = { ...mockUserEntity, ...updateUserDto };
        repository.findOne.mockResolvedValue(null);
        repository.save.mockResolvedValue(updatedUser);

        const result = await service.update('some-uuid', updateUserDto, 'school-1');

        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updateUserDto));
        expect(result).toBeInstanceOf(UserDto);
        expect(result.firstName).toEqual('Updated');
      });

    it('should throw NotFoundException if user to update is not found', async () => {
      repository.findOneBy.mockResolvedValue(null); // Override findOneBy for this test
      await expect(
        service.update('bad-uuid', updateUserDto, 'school-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated username already exists for another user', async () => {
      const anotherUser = { ...mockUserEntity, id: 'another-uuid' };
      repository.findOne.mockResolvedValue(anotherUser);
      await expect(
        service.update('some-uuid', { username: 'testuser' }, 'school-1'),
      ).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          username: 'testuser',
          schoolId: 'school-1',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity);
      repository.delete.mockResolvedValue({ affected: 1, raw: '' });
      await service.remove('some-uuid', 'school-1');
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'some-uuid'
      });
      expect(repository.delete).toHaveBeenCalledWith('some-uuid');
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('bad-uuid', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});