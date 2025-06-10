import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Main AppModule
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { UserRole } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let createdUserId: string;
  let userCounter = 0; // To ensure unique emails/usernames for each test run

  const generateUniqueSuffix = () => {
    userCounter++;
    return `${Date.now()}${userCounter}`;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // AppModule should import UsersModule
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    // Clean up created users after all tests in this suite
    if (createdUserId) {
      // It's better to clean up all test users, perhaps by a common prefix or flag
      // For simplicity, just cleaning the last created one if ID exists
      // await userRepository.delete(createdUserId).catch(() => {}); // Ignore errors if already deleted
    }
    // A more robust cleanup would involve deleting all users created by tests.
    // Example: await userRepository.delete({ email: Like('e2e-user-%') });
    await app.close();
  });

  // Clean before each test that creates a user to avoid conflicts from previous runs
  // This is very basic; real test suites need more sophisticated data management.
  beforeEach(async () => {
    // Clear users table or specific test users. For simplicity, let's not do it here
    // to avoid accidental data loss on a real DB. Test DBs are better.
  });


  describe('POST /users', () => {
    it('should create a new user and return user data (excluding password)', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const createUserDto: CreateUserDto = {
        username: `e2e_user_${uniqueSuffix}`,
        email: `e2e_user_${uniqueSuffix}@example.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.USER],
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      createdUserId = response.body.id; // Save for subsequent tests
      expect(response.body.username).toEqual(createUserDto.username);
      expect(response.body.email).toEqual(createUserDto.email);
      expect(response.body.roles).toEqual([UserRole.USER]);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 400 for invalid data (e.g., missing required field)', async () => {
      const createUserDto: Partial<CreateUserDto> = { email: 'test@example.com' }; // Missing username, password
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid email format', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const createUserDto: CreateUserDto = {
        username: `e2e_user_invalid_email_${uniqueSuffix}`,
        email: `invalid-email`,
        password: 'Password123!',
      };
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 409 Conflict if username already exists', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const initialUserDto: CreateUserDto = {
        username: `conflict_user_${uniqueSuffix}`,
        email: `conflict_email_${uniqueSuffix}@example.com`,
        password: 'Password123!',
      };
      // Create user first
      await request(app.getHttpServer()).post('/users').send(initialUserDto).expect(HttpStatus.CREATED);
      // Attempt to create again
      await request(app.getHttpServer()).post('/users').send(initialUserDto).expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /users', () => {
    it('should return an array of users (excluding passwords)', async () => {
      // Ensure at least one user exists (the one created in POST test or create one here)
      if (!createdUserId) {
        const uniqueSuffix = generateUniqueSuffix();
        const res = await request(app.getHttpServer()).post('/users').send({
            username: `e2e_get_all_${uniqueSuffix}`,
            email: `e2e_get_all_${uniqueSuffix}@example.com`,
            password: 'Password123!',
        });
        createdUserId = res.body.id;
      }

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const userInList = response.body.find((u: any) => u.id === createdUserId);
      expect(userInList).toBeDefined();
      expect(userInList.password).toBeUndefined();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user by ID (excluding password)', async () => {
       if (!createdUserId) throw new Error('createdUserId is not set for GET /users/:id test');
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdUserId);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 404 for a non-existent user ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000'; // Random valid UUID format
      await request(app.getHttpServer())
        .get(`/users/${nonExistentUuid}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for an invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update an existing user and return updated data (excluding password)', async () => {
      if (!createdUserId) throw new Error('createdUserId is not set for PATCH /users/:id test');
      const uniqueSuffix = generateUniqueSuffix();
      const updateUserDto: UpdateUserDto = {
          firstName: 'UpdatedFirstName',
          email: `updated_${uniqueSuffix}@example.com`
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdUserId);
      expect(response.body.firstName).toEqual(updateUserDto.firstName);
      expect(response.body.email).toEqual(updateUserDto.email);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 404 for updating a non-existent user ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .patch(`/users/${nonExistentUuid}`)
        .send({ firstName: 'GhostUpdate' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid update data (e.g. invalid email)', async () => {
        if (!createdUserId) throw new Error('createdUserId is not set for PATCH /users/:id invalid data test');
        await request(app.getHttpServer())
            .patch(`/users/${createdUserId}`)
            .send({ email: 'not-an-email' })
            .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete an existing user', async () => {
      // Create a user specifically for this test to avoid issues with createdUserId shared state
      const uniqueSuffix = generateUniqueSuffix();
      const userToDeleteDto: CreateUserDto = {
        username: `e2e_delete_${uniqueSuffix}`,
        email: `e2e_delete_${uniqueSuffix}@example.com`,
        password: 'Password123!',
      };
      const res = await request(app.getHttpServer()).post('/users').send(userToDeleteDto);
      const userIdToDelete = res.body.id;

      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .expect(HttpStatus.NO_CONTENT); // Or OK if you return a message

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${userIdToDelete}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 for deleting a non-existent user ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .delete(`/users/${nonExistentUuid}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
