import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service'; // For creating test users directly

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let studentToken: string;
  let createdUserByAdminId: string; // Store ID of user created by admin for later tests

  const userPassword = 'Password123!';
  let userCounter = 0;
  const generateUniqueSuffix = () => `${Date.now()}${userCounter++}`;

  // Helper function to create a user and get a token
  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_${roles.join('_')}_${uniqueSuffix}`;
    const email = `${username}@example.com`;

    // Use UsersService to create user directly to ensure roles are set
    // Bypassing POST /users for test user setup as POST /users itself requires ADMIN
    await usersService.create({
      username,
      email,
      password: userPassword,
      roles,
      isActive: true,
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: userPassword })
      .expect(HttpStatus.OK);
    return loginResponse.body.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);

    // Create an admin user and a student user for testing
    adminToken = await createAndLoginUser([UserRole.ADMIN]);
    studentToken = await createAndLoginUser([UserRole.STUDENT]);
  });

  afterAll(async () => {
    // Consider more robust cleanup if needed, e.g., deleting all users created by tests
    await app.close();
  });

  describe('POST /users (Create User)', () => {
    const uniqueSuffix = generateUniqueSuffix();
    const createUserDto: CreateUserDto = {
      username: `new_user_${uniqueSuffix}`,
      email: `new_user_${uniqueSuffix}@example.com`,
      password: userPassword,
      firstName: 'New',
      lastName: 'User',
      roles: [UserRole.TEACHER],
    };

    it('should (ADMIN) create a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.username).toEqual(createUserDto.username);
      expect(response.body.roles).toContain(UserRole.TEACHER);
      expect(response.body.password).toBeUndefined();
      createdUserByAdminId = response.body.id; // Save for findOne test
    });

    it('should (STUDENT) fail to create a user (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to create a user (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should (ADMIN) return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'onlyemail.com' }) // Missing username, password, invalid email
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /users (Find All Users)', () => {
    it('should (ADMIN) return an array of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2); // Admin and Student users at least
    });

    it('should (STUDENT) fail to get all users (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to get all users (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /users/:id (Find One User)', () => {
    it('should (ADMIN) return a specific user by ID', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for GET /users/:id test',
        );
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.id).toEqual(createdUserByAdminId);
    });

    it('should (STUDENT) fail to get a user by ID (403 Forbidden)', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for GET /users/:id (student) test',
        );
      await request(app.getHttpServer())
        .get(`/users/${createdUserByAdminId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to get a user by ID (401 Unauthorized)', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for GET /users/:id (no auth) test',
        );
      await request(app.getHttpServer())
        .get(`/users/${createdUserByAdminId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should (ADMIN) return 404 for a non-existent user ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/users/${nonExistentUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /users/:id (Update User)', () => {
    const updateUserDto: UpdateUserDto = { firstName: 'UpdatedByAdmin' };

    it('should (ADMIN) update an existing user', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for PATCH /users/:id test',
        );
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);
      expect(response.body.firstName).toEqual(updateUserDto.firstName);
    });

    it('should (STUDENT) fail to update a user (403 Forbidden)', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for PATCH /users/:id (student) test',
        );
      await request(app.getHttpServer())
        .patch(`/users/${createdUserByAdminId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to update a user (401 Unauthorized)', async () => {
      if (!createdUserByAdminId)
        throw new Error(
          'createdUserByAdminId is not set for PATCH /users/:id (no auth) test',
        );
      await request(app.getHttpServer())
        .patch(`/users/${createdUserByAdminId}`)
        .send(updateUserDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /users/:id (Delete User)', () => {
    let userIdToDelete: string;

    beforeEach(async () => {
      // Create a fresh user for each delete test variant
      const uniqueSuffix = generateUniqueSuffix();
      const tempUser = await usersService.create({
        username: `to_delete_${uniqueSuffix}`,
        email: `to_delete_${uniqueSuffix}@example.com`,
        password: userPassword,
        roles: [UserRole.STUDENT],
      });
      userIdToDelete = tempUser.id;
    });

    afterEach(async () => {
      // Clean up the user if not deleted by the test itself
      if (userIdToDelete) {
        try {
          await usersService.remove(userIdToDelete);
        } catch {
          /* ignore if already deleted */
        }
      }
    });

    it('should (ADMIN) delete an existing user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify user is deleted by trying to fetch (admin should get 404)
      await request(app.getHttpServer())
        .get(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
      userIdToDelete = null; // Mark as deleted for afterEach
    });

    it('should (STUDENT) fail to delete a user (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to delete a user (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
