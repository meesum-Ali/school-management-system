import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateClassDto } from '../src/classes/dto/create-class.dto';
import { UpdateClassDto } from '../src/classes/dto/update-class.dto';
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service'; // For creating test users

describe('ClassesController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let nonAdminToken: string; // e.g., STUDENT role user
  let createdClassByAdminId: string;

  const testUserPassword = 'Password123!';
  let e2eTestCounter = 0;
  const generateUniqueSuffix = () => `${Date.now()}${e2eTestCounter++}`;

  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_class_ctrl_${roles.join('_')}_${uniqueSuffix}`;
    const email = `${username}@example.com`;

    await usersService.create({
      username, email, password: testUserPassword, roles, isActive: true,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: testUserPassword });
    return loginResponse.body.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    adminToken = await createAndLoginUser([UserRole.ADMIN]);
    nonAdminToken = await createAndLoginUser([UserRole.STUDENT]);
  });

  afterAll(async () => {
    await app.close();
  });

  const createSampleClassDto = (): CreateClassDto => {
    const uniqueSuffix = generateUniqueSuffix();
    return {
      name: `Class ${uniqueSuffix}`,
      level: `Grade ${1 + (e2eTestCounter % 5)}`, // Just to vary level
      homeroomTeacherId: null, // Or a valid teacher UUID if tests depend on it
    };
  };

  describe('POST /classes (Create Class)', () => {
    const classDto = createSampleClassDto();

    it('should (ADMIN) create a new class', async () => {
      const response = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.name).toEqual(classDto.name);
      createdClassByAdminId = response.body.id;
    });

    it('should (Non-ADMIN) fail to create a class (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send(classDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to create a class (401 Unauthorized)', async () => {
        await request(app.getHttpServer())
          .post('/classes')
          .send(classDto)
          .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should (ADMIN) return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' }) // Too short, missing level
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /classes (Find All Classes)', () => {
    it('should (ADMIN) return an array of classes', async () => {
      if (!createdClassByAdminId) { // Ensure at least one class exists
        const dto = createSampleClassDto();
        const res = await request(app.getHttpServer()).post('/classes').set('Authorization', `Bearer ${adminToken}`).send(dto);
        createdClassByAdminId = res.body.id;
      }
      const response = await request(app.getHttpServer())
        .get('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should (Non-ADMIN) fail to get all classes (403 Forbidden)', async () => {
        await request(app.getHttpServer())
          .get('/classes')
          .set('Authorization', `Bearer ${nonAdminToken}`)
          .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /classes/:id (Find One Class)', () => {
    it('should (ADMIN) return a specific class by ID', async () => {
      if (!createdClassByAdminId) throw new Error('createdClassByAdminId is needed for test');
      const response = await request(app.getHttpServer())
        .get(`/classes/${createdClassByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.id).toEqual(createdClassByAdminId);
    });

    it('should (Non-ADMIN) fail to get a class by ID (403 Forbidden)', async () => {
        if (!createdClassByAdminId) throw new Error('createdClassByAdminId is needed for test');
        await request(app.getHttpServer())
          .get(`/classes/${createdClassByAdminId}`)
          .set('Authorization', `Bearer ${nonAdminToken}`)
          .expect(HttpStatus.FORBIDDEN);
    });

    it('should (ADMIN) return 404 for a non-existent class ID', async () => {
        const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
        await request(app.getHttpServer())
          .get(`/classes/${nonExistentUuid}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /classes/:id (Update Class)', () => {
    const updateDto: UpdateClassDto = { name: 'Updated Class Name E2E' };

    it('should (ADMIN) update an existing class', async () => {
      if (!createdClassByAdminId) throw new Error('createdClassByAdminId is needed for test');
      const response = await request(app.getHttpServer())
        .patch(`/classes/${createdClassByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(response.body.name).toEqual(updateDto.name);
    });

    it('should (Non-ADMIN) fail to update a class (403 Forbidden)', async () => {
        if (!createdClassByAdminId) throw new Error('createdClassByAdminId is needed for test');
        await request(app.getHttpServer())
          .patch(`/classes/${createdClassByAdminId}`)
          .set('Authorization', `Bearer ${nonAdminToken}`)
          .send(updateDto)
          .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /classes/:id (Delete Class)', () => {
    let classIdToDelete: string;

    beforeEach(async () => {
        const dto = createSampleClassDto();
        const response = await request(app.getHttpServer())
            .post('/classes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(dto);
        classIdToDelete = response.body.id;
    });

    it('should (ADMIN) delete an existing class', async () => {
      await request(app.getHttpServer())
        .delete(`/classes/${classIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/classes/${classIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (Non-ADMIN) fail to delete a class (403 Forbidden)', async () => {
        await request(app.getHttpServer())
          .delete(`/classes/${classIdToDelete}`)
          .set('Authorization', `Bearer ${nonAdminToken}`)
          .expect(HttpStatus.FORBIDDEN);
    });
  });
});
