import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateClassDto } from '../src/classes/dto/create-class.dto';
import { UpdateClassDto } from '../src/classes/dto/update-class.dto';
import { StudentDto } from '../src/students/dto/student.dto'; // Import StudentDto
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service';

describe('ClassesController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let nonAdminToken: string;
  let testClassId: string; // Will hold ID of class created for tests in this suite
  let testStudentId1: string;
  let testStudentId2: string;
  let testStudentId_otherClass: string; // Student not in testClassId
  let otherTestClassId: string; // A class for testStudentId_otherClass

  const testUserPassword = 'Password123!';
  let e2eTestCounter = 0; // For unique suffixes
  const generateUniqueSuffix = () => `${Date.now()}${e2eTestCounter++}`;

  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_class_ctrl_${roles.join('_')}_${uniqueSuffix}`;
    const email = `${username}@example.com`;

    await usersService.create({
      username,
      email,
      password: testUserPassword,
      roles,
      isActive: true,
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    adminToken = await createAndLoginUser([UserRole.ADMIN]);
    nonAdminToken = await createAndLoginUser([UserRole.STUDENT]); // Assuming STUDENT role exists for non-admin tests
  });

  afterAll(async () => {
    // Clean up any globally created entities for this test suite
    if (testClassId)
      await request(app.getHttpServer())
        .delete(`/classes/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (otherTestClassId)
      await request(app.getHttpServer())
        .delete(`/classes/${otherTestClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testStudentId1)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testStudentId2)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testStudentId_otherClass)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId_otherClass}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});

    await app.close();
  });

  const createSampleClassDto = (suffix?: string): CreateClassDto => {
    const s = suffix || generateUniqueSuffix();
    return {
      name: `E2E Class ${s}`,
      level: `Grade ${1 + (parseInt(s.slice(-1), 10) % 5)}`,
      homeroomTeacherId: null,
    };
  };

  const createSampleStudentDto = (
    classId: string | null,
    suffix: string,
  ): any => {
    return {
      firstName: `StudentFN ${suffix}`,
      lastName: `StudentLN ${suffix}`,
      dateOfBirth: new Date('2004-07-12'),
      email: `student.e2e.${suffix}@example.com`,
      studentId: `S_E2E_${suffix}`,
      classId: classId, // Can be null
    };
  };

  // Setup a class and students for relevant tests
  beforeEach(async () => {
    // Reset IDs
    testClassId = null;
    testStudentId1 = null;
    testStudentId2 = null;
    testStudentId_otherClass = null;
    otherTestClassId = null;

    // Create a primary class for testing student lists
    const classDto = createSampleClassDto('main');
    const classRes = await request(app.getHttpServer())
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(classDto);
    testClassId = classRes.body.id;

    // Create another class for a student not in the main list
    const otherClassDto = createSampleClassDto('other');
    const otherClassRes = await request(app.getHttpServer())
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(otherClassDto);
    otherTestClassId = otherClassRes.body.id;

    // Create students: 2 for the main class, 1 for another class
    const studentDto1 = createSampleStudentDto(testClassId, `s1_clsmain`);
    const studentRes1 = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(studentDto1);
    testStudentId1 = studentRes1.body.id;

    const studentDto2 = createSampleStudentDto(testClassId, `s2_clsmain`);
    const studentRes2 = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(studentDto2);
    testStudentId2 = studentRes2.body.id;

    const studentDtoOther = createSampleStudentDto(
      otherTestClassId,
      `s3_clsother`,
    );
    const studentResOther = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(studentDtoOther);
    testStudentId_otherClass = studentResOther.body.id;
  });

  afterEach(async () => {
    // Clean up entities created in beforeEach
    if (testStudentId1)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testStudentId2)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testStudentId_otherClass)
      await request(app.getHttpServer())
        .delete(`/students/${testStudentId_otherClass}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (testClassId)
      await request(app.getHttpServer())
        .delete(`/classes/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    if (otherTestClassId)
      await request(app.getHttpServer())
        .delete(`/classes/${otherTestClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
  });

  describe('GET /classes/:classId/students (List Students in Class)', () => {
    it('should (ADMIN) list all students enrolled in a specific class', async () => {
      const response = await request(app.getHttpServer())
        .get(`/classes/${testClassId}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // s1 and s2 are in testClassId
      const studentIdsInResponse = response.body.map((s: StudentDto) => s.id);
      expect(studentIdsInResponse).toContain(testStudentId1);
      expect(studentIdsInResponse).toContain(testStudentId2);
      expect(studentIdsInResponse).not.toContain(testStudentId_otherClass);

      response.body.forEach((student: StudentDto) => {
        expect(student.classId).toEqual(testClassId);
        expect(student.currentClassName).toBeDefined(); // Assuming class name is populated
      });
    });

    it('should (ADMIN) return an empty array for a class with no students', async () => {
      const newClassDto = createSampleClassDto('empty');
      const newClassRes = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newClassDto);
      const newClassId = newClassRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/classes/${newClassId}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual([]);

      // Cleanup this new class
      await request(app.getHttpServer())
        .delete(`/classes/${newClassId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should (ADMIN) return 404 for a non-existent classId', async () => {
      const nonExistentClassId = '123e4567-e89b-12d3-a456-426614174abc';
      await request(app.getHttpServer())
        .get(`/classes/${nonExistentClassId}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (Non-ADMIN) fail to list students (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/classes/${testClassId}/students`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /classes/:id (Get Class Details - Verify Students List)', () => {
    it('should (ADMIN) return class details with populated students array', async () => {
      const response = await request(app.getHttpServer())
        .get(`/classes/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(testClassId);
      expect(Array.isArray(response.body.students)).toBe(true);
      expect(response.body.students.length).toBe(2);
      const studentIdsInResponse = response.body.students.map(
        (s: StudentDto) => s.id,
      );
      expect(studentIdsInResponse).toContain(testStudentId1);
      expect(studentIdsInResponse).toContain(testStudentId2);
      response.body.students.forEach((student: StudentDto) => {
        expect(student.classId).toEqual(testClassId);
        expect(student.currentClassName).toBeDefined();
      });
    });

    it('should (ADMIN) return class details with empty students array if no students are enrolled', async () => {
      const newClassDto = createSampleClassDto('empty_for_get');
      const newClassRes = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newClassDto);
      const newClassId = newClassRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/classes/${newClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.students).toEqual([]);

      await request(app.getHttpServer())
        .delete(`/classes/${newClassId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });

  // Keep original CRUD tests for classes, ensuring they don't conflict with new setup/teardown
  // Example: POST /classes (Create Class) - modified to use unique suffix and not interfere with global testClassId
  describe('POST /classes (Basic Create)', () => {
    it('should (ADMIN) create a new class with a unique name', async () => {
      const classDto = createSampleClassDto(
        `post_test_${generateUniqueSuffix()}`,
      );
      const response = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.name).toEqual(classDto.name);
      // Clean up this specific class
      await request(app.getHttpServer())
        .delete(`/classes/${response.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });
  // Other basic CRUD tests (GET all, PATCH, DELETE) should be similarly reviewed for isolation if they use shared IDs.
  // The beforeEach/afterEach for student/class creation related to enrollment tests should make those tests self-contained.
});
