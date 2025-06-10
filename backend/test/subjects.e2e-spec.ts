import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateSubjectDto } from '../src/subjects/dto/create-subject.dto';
import { UpdateSubjectDto } from '../src/subjects/dto/update-subject.dto';
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service';
import { ClassesService } from '../src/classes/classes.service'; // For creating a class to assign
import { CreateClassDto } from '../src/classes/dto/create-class.dto';

describe('SubjectsController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let classesService: ClassesService; // To create a class for relation tests
  let adminToken: string;
  let nonAdminToken: string;
  let createdSubjectId: string;
  let createdClassId: string; // For relation tests

  const testUserPassword = 'Password123!';
  let e2eTestCounter = 0;
  const generateUniqueSuffix = () => `${Date.now()}${e2eTestCounter++}`;

  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_subj_ctrl_${roles.join('_')}_${uniqueSuffix}`;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    usersService = moduleFixture.get<UsersService>(UsersService);
    classesService = moduleFixture.get<ClassesService>(ClassesService); // Get ClassesService
    adminToken = await createAndLoginUser([UserRole.ADMIN]);
    nonAdminToken = await createAndLoginUser([UserRole.STUDENT]);

    // Create a prerequisite class for relation tests
    const classDto: CreateClassDto = { name: `E2E Test Class ${generateUniqueSuffix()}`, level: 'E2E Grade' };
    const cls = await classesService.create(classDto);
    createdClassId = cls.id;
  });

  afterAll(async () => {
    // Clean up class if created
    if (createdClassId) {
        try { await classesService.remove(createdClassId); } catch (e) { /* ignore */ }
    }
    await app.close();
  });

  const createSampleSubjectDto = (): CreateSubjectDto => {
    const uniqueSuffix = generateUniqueSuffix();
    return {
      name: `E2E Subject ${uniqueSuffix}`,
      code: `SUB_E2E_${uniqueSuffix.substring(uniqueSuffix.length - 5)}`,
      description: `Description for E2E Subject ${uniqueSuffix}`,
    };
  };

  describe('POST /subjects (Create Subject)', () => {
    const subjectDto = createSampleSubjectDto();
    it('should (ADMIN) create a new subject', async () => {
      const response = await request(app.getHttpServer())
        .post('/subjects').set('Authorization', `Bearer ${adminToken}`).send(subjectDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.name).toEqual(subjectDto.name);
      expect(response.body.code).toEqual(subjectDto.code);
      createdSubjectId = response.body.id;
    });
    it('should (Non-ADMIN) fail (403 Forbidden)', async () => {
      await request(app.getHttpServer()).post('/subjects').set('Authorization', `Bearer ${nonAdminToken}`).send(subjectDto).expect(HttpStatus.FORBIDDEN);
    });
    it('should (No Auth) fail (401 Unauthorized)', async () => {
      await request(app.getHttpServer()).post('/subjects').send(subjectDto).expect(HttpStatus.UNAUTHORIZED);
    });
    it('should (ADMIN) fail for invalid data (400 Bad Request)', async () => {
      await request(app.getHttpServer()).post('/subjects').set('Authorization', `Bearer ${adminToken}`).send({ name: 'X' }).expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /subjects (Find All Subjects)', () => {
    it('should (ADMIN) return an array of subjects', async () => {
      if (!createdSubjectId) { // Ensure one exists
        const dto = createSampleSubjectDto();
        const res = await request(app.getHttpServer()).post('/subjects').set('Authorization', `Bearer ${adminToken}`).send(dto);
        createdSubjectId = res.body.id;
      }
      const response = await request(app.getHttpServer()).get('/subjects').set('Authorization', `Bearer ${adminToken}`).expect(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
    it('should (Non-ADMIN) fail (403 Forbidden)', async () => {
      await request(app.getHttpServer()).get('/subjects').set('Authorization', `Bearer ${nonAdminToken}`).expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /subjects/:id (Find One Subject)', () => {
    it('should (ADMIN) return a specific subject by ID (including classes relation)', async () => {
      if (!createdSubjectId) throw new Error('createdSubjectId is needed');
      const response = await request(app.getHttpServer()).get(`/subjects/${createdSubjectId}`).set('Authorization', `Bearer ${adminToken}`).expect(HttpStatus.OK);
      expect(response.body.id).toEqual(createdSubjectId);
      expect(response.body.classes).toBeDefined(); // Check if classes relation is loaded
    });
    it('should (Non-ADMIN) fail (403 Forbidden)', async () => {
      if (!createdSubjectId) throw new Error('createdSubjectId is needed');
      await request(app.getHttpServer()).get(`/subjects/${createdSubjectId}`).set('Authorization', `Bearer ${nonAdminToken}`).expect(HttpStatus.FORBIDDEN);
    });
    it('should (ADMIN) return 404 for non-existent ID', async () => {
      await request(app.getHttpServer()).get(`/subjects/123e4567-e89b-12d3-a456-426614174000`).set('Authorization', `Bearer ${adminToken}`).expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /subjects/:id (Update Subject)', () => {
    const updateDto: UpdateSubjectDto = { name: 'Updated E2E Subject Name' };
    it('should (ADMIN) update an existing subject', async () => {
      if (!createdSubjectId) throw new Error('createdSubjectId is needed');
      const response = await request(app.getHttpServer()).patch(`/subjects/${createdSubjectId}`).set('Authorization', `Bearer ${adminToken}`).send(updateDto).expect(HttpStatus.OK);
      expect(response.body.name).toEqual(updateDto.name);
    });
    it('should (Non-ADMIN) fail (403 Forbidden)', async () => {
      if (!createdSubjectId) throw new Error('createdSubjectId is needed');
      await request(app.getHttpServer()).patch(`/subjects/${createdSubjectId}`).set('Authorization', `Bearer ${nonAdminToken}`).send(updateDto).expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /subjects/:id (Delete Subject)', () => {
    let subjectIdToDeleteForDeleteTest: string;
    beforeEach(async () => {
        const dto = createSampleSubjectDto();
        const response = await request(app.getHttpServer()).post('/subjects').set('Authorization', `Bearer ${adminToken}`).send(dto);
        subjectIdToDeleteForDeleteTest = response.body.id;
    });
    it('should (ADMIN) delete an existing subject', async () => {
      await request(app.getHttpServer()).delete(`/subjects/${subjectIdToDeleteForDeleteTest}`).set('Authorization', `Bearer ${adminToken}`).expect(HttpStatus.NO_CONTENT);
      await request(app.getHttpServer()).get(`/subjects/${subjectIdToDeleteForDeleteTest}`).set('Authorization', `Bearer ${adminToken}`).expect(HttpStatus.NOT_FOUND);
    });
    it('should (Non-ADMIN) fail (403 Forbidden)', async () => {
      await request(app.getHttpServer()).delete(`/subjects/${subjectIdToDeleteForDeleteTest}`).set('Authorization', `Bearer ${nonAdminToken}`).expect(HttpStatus.FORBIDDEN);
    });
  });

  // Tests for Class-Subject Assignment Endpoints
  describe('Class-Subject Assignments', () => {
    let tempClassId: string;
    let tempSubjectId: string;

    beforeAll(async () => { // Use beforeAll for one-time setup for this describe block
      // Create a temporary class and subject for these specific tests
      const classDto = { name: `Temp Class ${generateUniqueSuffix()}`, level: 'Temp Level' };
      let res = await request(app.getHttpServer()).post('/classes').set('Authorization', `Bearer ${adminToken}`).send(classDto);
      tempClassId = res.body.id;

      const subjectDto = createSampleSubjectDto();
      res = await request(app.getHttpServer()).post('/subjects').set('Authorization', `Bearer ${adminToken}`).send(subjectDto);
      tempSubjectId = res.body.id;
    });

    it('POST /classes/:classId/subjects/:subjectId - should (ADMIN) assign subject to class', async () => {
      await request(app.getHttpServer())
        .post(`/classes/${tempClassId}/subjects/${tempSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK)
        .then(response => {
          expect(response.body.subjects.some((s: any) => s.id === tempSubjectId)).toBe(true);
        });
    });

    it('GET /classes/:classId/subjects - should (ADMIN) list subjects for a class', async () => {
        await request(app.getHttpServer())
          .get(`/classes/${tempClassId}/subjects`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(HttpStatus.OK)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((s: any) => s.id === tempSubjectId)).toBe(true);
          });
    });

    it('GET /subjects/:subjectId/classes - should (ADMIN) list classes for a subject', async () => {
        await request(app.getHttpServer())
          .get(`/subjects/${tempSubjectId}/classes`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(HttpStatus.OK)
          .then(response => {
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((c: any) => c.id === tempClassId)).toBe(true);
          });
    });

    it('DELETE /classes/:classId/subjects/:subjectId - should (ADMIN) remove subject from class', async () => {
      await request(app.getHttpServer())
        .delete(`/classes/${tempClassId}/subjects/${tempSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK)
        .then(response => {
          expect(response.body.subjects.some((s: any) => s.id === tempSubjectId)).toBe(false);
        });
    });
  });
});
