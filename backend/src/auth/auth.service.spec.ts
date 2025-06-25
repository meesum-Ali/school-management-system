import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, ValidatedUser } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

// Mock User entity methods if they were more complex, but here comparePassword is simple
// jest.mock('../users/entities/user.entity');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByUsername: jest.fn(),
    findOneEntity: jest.fn(), // Used by login to get fresh roles
    // comparePassword is on the entity instance, findOneByUsername returns the instance
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data (without password) if validation is successful', async () => {
      const username = 'testuser';
      const password = 'password123';
      const mockUserEntity = new User();
      mockUserEntity.id = 'uuid1';
      mockUserEntity.username = username;
      mockUserEntity.password = 'hashedPassword'; // Assume this is the stored hash
      mockUserEntity.roles = [UserRole.STUDENT];
      mockUserEntity.comparePassword = jest.fn().mockResolvedValue(true); // Mock method on instance

      mockUsersService.findOneByUsername.mockResolvedValue(mockUserEntity);

      const result = await authService.validateUser(username, password);

      expect(usersService.findOneByUsername).toHaveBeenCalledWith(username);
      expect(mockUserEntity.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toEqual({
        id: mockUserEntity.id,
        username: mockUserEntity.username,
        roles: mockUserEntity.roles,
        // other fields from User entity minus password and methods
        email: mockUserEntity.email,
        firstName: mockUserEntity.firstName,
        lastName: mockUserEntity.lastName,
        isActive: mockUserEntity.isActive,
        createdAt: mockUserEntity.createdAt,
        updatedAt: mockUserEntity.updatedAt,
      });
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);
      const result = await authService.validateUser('unknownuser', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const mockUserEntity = new User();
      mockUserEntity.comparePassword = jest.fn().mockResolvedValue(false); // Mock method on instance
      mockUsersService.findOneByUsername.mockResolvedValue(mockUserEntity);

      const result = await authService.validateUser(username, password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access_token with correct payload including roles', async () => {
      const validatedUser: ValidatedUser = {
        id: 'uuid1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        roles: [UserRole.SCHOOL_ADMIN, UserRole.STUDENT],
        createdAt: new Date(),
        updatedAt: new Date(),
        school: null,
        studentProfile: null,
        teacherProfile: null,
      };
      // Mock findOneEntity to return the full user object with roles for payload creation
      const fullUserEntity = new User();
      Object.assign(fullUserEntity, validatedUser); // copy properties
      fullUserEntity.roles = [UserRole.SCHOOL_ADMIN, UserRole.STUDENT]; // Ensure roles are explicitly set

      mockUsersService.findOneEntity.mockResolvedValue(fullUserEntity);

      const mockToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(validatedUser);

      expect(usersService.findOneEntity).toHaveBeenCalledWith(validatedUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: validatedUser.username,
        sub: validatedUser.id,
        roles: [UserRole.SCHOOL_ADMIN, UserRole.STUDENT],
      });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw UnauthorizedException if user details cannot be fetched in login', async () => {
      const validatedUser: ValidatedUser = {
        id: 'uuid1',
        username: 'testuser',
        roles: [UserRole.STUDENT],
      } as ValidatedUser;
      mockUsersService.findOneEntity.mockResolvedValue(null); // Simulate user disappearing after validation

      await expect(authService.login(validatedUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateToken (direct call, if used)', () => {
    it('should sign a payload with username, id, and roles', () => {
      const userPayload = {
        username: 'directUser',
        id: 'uuid-direct',
        roles: [UserRole.TEACHER],
      };
      const mockToken = 'direct.mock.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = authService.generateToken(userPayload);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: userPayload.username,
        sub: userPayload.id,
        roles: userPayload.roles,
      });
      expect(result).toEqual(mockToken);
    });
  });
});
