import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

const mockUserRepository = () => ({
  create: jest.fn(), // Note: user entity now handles new User() and hashing via @BeforeInsert
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  const mockUserEntity = new User();
  mockUserEntity.id = 'some-uuid';
  mockUserEntity.username = 'testuser';
  mockUserEntity.email = 'test@example.com';
  mockUserEntity.password = 'hashedPassword'; // Assume it's already hashed for retrieval
  mockUserEntity.firstName = 'Test';
  mockUserEntity.lastName = 'User';
  mockUserEntity.isActive = true;
  mockUserEntity.roles = [UserRole.STUDENT];
  mockUserEntity.createdAt = new Date();
  mockUserEntity.updatedAt = new Date();

  const userDto = new UserDto({
    id: mockUserEntity.id,
    username: mockUserEntity.username,
    email: mockUserEntity.email,
    firstName: mockUserEntity.firstName,
    lastName: mockUserEntity.lastName,
    isActive: mockUserEntity.isActive,
    roles: mockUserEntity.roles,
    createdAt: mockUserEntity.createdAt,
    updatedAt: mockUserEntity.updatedAt,
  });

  beforeEach(async () => {
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
      repository.findOne.mockResolvedValue(null); // No existing user
      // The actual User entity instance is created within the service method now.
      // The save method will receive an instance of User.
      // We need to mock what save returns after @BeforeInsert hashing.
      const savedUserEntity = {
        ...new User(),
        ...createUserDto,
        id: 'new-uuid',
        password: 'hashedPasswordFromSave',
      };
      delete savedUserEntity.password; // password not in UserDto

      repository.save.mockImplementation(async (user: User) => {
        // Simulate @BeforeInsert hashing if not relying on it directly in test
        // For this test, we assume User entity's @BeforeInsert handles hashing.
        // The password passed to save would be the plain one, then hashed.
        return { ...user, id: 'new-uuid', password: 'hashedPasswordFromSave' };
      });

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });
      expect(repository.save).toHaveBeenCalled();
      const savedArg = repository.save.mock.calls[0][0] as User;
      expect(savedArg.username).toEqual(createUserDto.username);
      expect(savedArg.password).toEqual(createUserDto.password); // Plain password sent to save, @BeforeInsert hashes it

      expect(result.username).toEqual(createUserDto.username);
      expect(result.email).toEqual(createUserDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if username already exists', async () => {
      repository.findOne.mockResolvedValue({
        ...mockUserEntity,
        username: createUserDto.username,
      });
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findOne.mockResolvedValue({
        ...mockUserEntity,
        email: createUserDto.email,
      });
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException on save if username constraint violated (race condition)', async () => {
      repository.findOne.mockResolvedValue(null);
      const queryFailedError = new QueryFailedError('query', [], {
        code: '23505',
        message: 'users_username_key',
      } as any);
      repository.save.mockRejectedValue(queryFailedError);
      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Username already exists.'),
      );
    });

    it('should throw ConflictException on save if email constraint violated (race condition)', async () => {
      repository.findOne.mockResolvedValue(null);
      const queryFailedError = new QueryFailedError('query', [], {
        code: '23505',
        message: 'users_email_key',
      } as any);
      repository.save.mockRejectedValue(queryFailedError);
      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists.'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of user dtos', async () => {
      repository.find.mockResolvedValue([mockUserEntity]);
      const result = await service.findAll();
      expect(result).toEqual([userDto]);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user dto if found', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity);
      const result = await service.findOne('some-uuid');
      expect(result).toEqual(userDto);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneEntity', () => {
    it('should return a user entity if found', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity);
      const result = await service.findOneEntity('some-uuid');
      expect(result).toEqual(mockUserEntity); // Full entity
    });
    it('should return null if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      const result = await service.findOneEntity('bad-uuid');
      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user entity (including password) if found', async () => {
      repository.findOne.mockResolvedValue(mockUserEntity);
      const result = await service.findOneByUsername('testuser');
      expect(result).toEqual(mockUserEntity);
      expect(result.password).toBeDefined();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      email: 'updated@example.com',
    };

    it('should update and return a user dto if found', async () => {
      repository.findOne.mockResolvedValue(null); // No conflict with new username/email
      repository.preload.mockResolvedValue({
        ...mockUserEntity,
        ...updateUserDto,
      });
      repository.save.mockResolvedValue({
        ...mockUserEntity,
        ...updateUserDto,
      });

      const result = await service.update('some-uuid', updateUserDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id: 'some-uuid',
        ...updateUserDto,
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockUserEntity,
        ...updateUserDto,
      });
      expect(result.firstName).toEqual('Updated');
      expect(result.email).toEqual('updated@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should hash password if provided in update', async () => {
      const passwordUpdateDto: UpdateUserDto = { password: 'newPassword123' };
      const preloadedUser = { ...mockUserEntity };
      repository.preload.mockResolvedValue(preloadedUser);
      repository.save.mockImplementation(async (user: User) => {
        // Password should be hashed by service before save if it's being updated
        return { ...user, password: 'hashedNewPassword' };
      });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedNewPassword');

      await service.update('some-uuid', passwordUpdateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(repository.save).toHaveBeenCalled();
      const savedUser = repository.save.mock.calls[0][0] as User;
      expect(savedUser.password).toEqual('hashedNewPassword');
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      repository.preload.mockResolvedValue(null);
      await expect(service.update('bad-uuid', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if updated username already exists for another user', async () => {
      repository.findOne.mockResolvedValue({
        ...mockUserEntity,
        id: 'another-uuid',
      }); // username exists on another user
      await expect(
        service.update('some-uuid', { username: 'testuser' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if updated email already exists for another user', async () => {
      repository.findOne.mockResolvedValue({
        ...mockUserEntity,
        id: 'another-uuid',
      }); // email exists on another user
      await expect(
        service.update('some-uuid', { email: 'test@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully (hard delete)', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity); // User exists
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('some-uuid');
      expect(repository.delete).toHaveBeenCalledWith('some-uuid');
    });

    it('should throw NotFoundException if user to remove is not found initially', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if delete operation affects 0 rows', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity); // User exists
      repository.delete.mockResolvedValue({ affected: 0 }); // But delete returns 0 affected
      await expect(service.remove('some-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('comparePassword', () => {
    it('should call bcrypt.compare with plain password and hashed password', async () => {
      await service.comparePassword('plain', 'hashed');
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
    });
    it('should return false if no hashed password provided', async () => {
      const result = await service.comparePassword('plain', undefined);
      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});
