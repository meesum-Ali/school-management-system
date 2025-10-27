import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateStudentDto } from '../src/students/dto/create-student.dto';
import { UpdateStudentDto } from '../src/students/dto/update-student.dto';
import { AssignClassDto } from '../src/students/dto/assign-class.dto'; // Import AssignClassDto
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service';

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let studentRoleToken: string;
  let createdStudentId: string; // Renamed for clarity, will hold various student IDs for tests
  let testClassId1: string;
  let testClassId2: string;

  const studentPassword = 'Password123!';
  let testCounter = 0; // For unique suffixes
  const generateUniqueSuffix = () => `${Date.now()}${testCounter++}`;

  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_student_ctrl_${roles.join('_')}_${uniqueSuffix}`;
    const email = `${username}@example.com`;

    await usersService.create({
      // Use UsersService for direct creation
      username,
      email,
      password: studentPassword,
      roles,
      isActive: true,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: studentPassword });
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
    studentRoleToken = await createAndLoginUser([UserRole.STUDENT]);

    // Create shared classes for tests
    const classDto1 = {
      name: `E2E Test Class ${generateUniqueSuffix()}`,
      level: 'Grade 1',
    };
    const classDto2 = {
      name: `E2E Test Class ${generateUniqueSuffix()}`,
      level: 'Grade 2',
    };

    const classRes1 = await request(app.getHttpServer())
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(classDto1);
    testClassId1 = classRes1.body.id;

    const classRes2 = await request(app.getHttpServer())
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(classDto2);
    testClassId2 = classRes2.body.id;
  });

  afterAll(async () => {
    // Clean up created classes
    if (testClassId1) {
      await request(app.getHttpServer())
        .delete(`/classes/${testClassId1}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    if (testClassId2) {
      await request(app.getHttpServer())
        .delete(`/classes/${testClassId2}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    // Student cleanup will be handled by individual tests or a broader strategy if needed
    await app.close();
  });

  const createSampleStudentDto = (
    classId: string | null = null,
  ): CreateStudentDto => {
    const uniqueSuffix = generateUniqueSuffix();
    const dto: CreateStudentDto = {
      firstName: 'Test',
      lastName: 'Student',
      dateOfBirth: new Date('2003-05-10'),
      email: `student.e2e.${uniqueSuffix}@example.com`,
      studentId: `S_E2E_${uniqueSuffix}`,
    };
    if (classId !== undefined) {
      // Allow explicit null for classId
      dto.classId = classId;
    }
    return dto;
  };

  // To store student IDs created in tests for cleanup
  const studentIdsCreated: string[] = [];

  afterEach(async () => {
    // Clean up students created during tests
    for (const studentId of studentIdsCreated) {
      await request(app.getHttpServer())
        .delete(`/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch((err) =>
          console.error(
            `Cleanup failed for student ${studentId}: ${err.message}`,
          ),
        ); // Log errors but don't fail tests
    }
    studentIdsCreated.length = 0; // Clear the array
  });

  describe('POST /students (Create Student with Class Assignment)', () => {
    it('should (ADMIN) create a student with a valid classId', async () => {
      const studentDto = createSampleStudentDto(testClassId1);
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.email).toEqual(studentDto.email);
      expect(response.body.classId).toEqual(testClassId1);
      expect(response.body.currentClassName).toBeDefined(); // Assuming class name is populated
      studentIdsCreated.push(response.body.id);
    });

    it('should (ADMIN) create a student with classId: null', async () => {
      const studentDto = createSampleStudentDto(null);
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.classId).toBeNull();
      expect(response.body.currentClassName).toBeNull();
      studentIdsCreated.push(response.body.id);
    });

    it('should (ADMIN) create a student without classId property', async () => {
      const studentDto = createSampleStudentDto(); // No classId property
      delete studentDto.classId; // Ensure it's not on the DTO
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.classId).toBeNull();
      expect(response.body.currentClassName).toBeNull();
      studentIdsCreated.push(response.body.id);
    });

    it('should (ADMIN) fail to create a student with an invalid/non-existent classId (404)', async () => {
      const nonExistentClassId = '123e4567-e89b-12d3-a456-426614174abc';
      const studentDto = createSampleStudentDto(nonExistentClassId);
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto)
        .expect(HttpStatus.NOT_FOUND);
    });
    // Basic auth and validation tests from original spec should be kept if relevant
    // For example:
    it('should (ADMIN) fail with 400 for invalid student data (e.g. missing required fields)', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Bad', classId: testClassId1 }) // Missing other required fields
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /students (Find All Students - basic test, ensure no regressions)', () => {
    it('should (ADMIN) return an array of students', async () => {
      // Create a student first to ensure list is not empty
      const studentDto = createSampleStudentDto();
      const studentRes = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      studentIdsCreated.push(studentRes.body.id);

      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /students/:id (Find One Student - with class details)', () => {
    it('should (ADMIN) return a student with class details if assigned', async () => {
      const studentDto = createSampleStudentDto(testClassId1);
      const studentRes = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      studentIdsCreated.push(studentRes.body.id);
      const studentId = studentRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.id).toEqual(studentId);
      expect(response.body.classId).toEqual(testClassId1);
      expect(response.body.currentClassName).toBeDefined();
    });
  });

  describe('PATCH /students/:id (Update Student with Class Assignment)', () => {
    let studentToUpdateId: string;

    beforeEach(async () => {
      // Create a student before each PATCH test
      const studentDto = createSampleStudentDto();
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      studentToUpdateId = res.body.id;
      studentIdsCreated.push(studentToUpdateId);
    });

    it('should (ADMIN) update student to assign to a valid class', async () => {
      const updateDto: UpdateStudentDto = { classId: testClassId1 };
      const response = await request(app.getHttpServer())
        .patch(`/students/${studentToUpdateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(response.body.classId).toEqual(testClassId1);
      expect(response.body.currentClassName).toBeDefined();
    });

    it('should (ADMIN) fail to update student with an invalid classId (404)', async () => {
      const nonExistentClassId = '123e4567-e89b-12d3-a456-426614174abc';
      const updateDto: UpdateStudentDto = { classId: nonExistentClassId };
      await request(app.getHttpServer())
        .patch(`/students/${studentToUpdateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (ADMIN) update student to unassign from class (classId: null)', async () => {
      // First assign to a class
      await request(app.getHttpServer())
        .patch(`/students/${studentToUpdateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ classId: testClassId1 });

      const updateDto: UpdateStudentDto = { classId: null };
      const response = await request(app.getHttpServer())
        .patch(`/students/${studentToUpdateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(response.body.classId).toBeNull();
      expect(response.body.currentClassName).toBeNull();
    });
  });

  describe('PATCH /students/:studentId/assign-class (Assign/Unassign Class)', () => {
    let studentForAssignTestId: string;

    beforeEach(async () => {
      const studentDto = createSampleStudentDto();
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      studentForAssignTestId = res.body.id;
      studentIdsCreated.push(studentForAssignTestId);
    });

    it('should (ADMIN) assign student to a class', async () => {
      const assignDto: AssignClassDto = { classId: testClassId1 };
      const response = await request(app.getHttpServer())
        .patch(`/students/${studentForAssignTestId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignDto)
        .expect(HttpStatus.OK);
      expect(response.body.classId).toEqual(testClassId1);
      expect(response.body.currentClassName).toBeDefined();
    });

    it('should (ADMIN) unassign student from a class', async () => {
      // First assign
      await request(app.getHttpServer())
        .patch(`/students/${studentForAssignTestId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ classId: testClassId1 });

      const assignDto: AssignClassDto = { classId: null };
      const response = await request(app.getHttpServer())
        .patch(`/students/${studentForAssignTestId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignDto)
        .expect(HttpStatus.OK);
      expect(response.body.classId).toBeNull();
      expect(response.body.currentClassName).toBeNull();
    });

    it('should (ADMIN) fail for non-existent studentId (404)', async () => {
      const nonExistentStudentId = '123e4567-e89b-12d3-a456-426614174abc';
      const assignDto: AssignClassDto = { classId: testClassId1 };
      await request(app.getHttpServer())
        .patch(`/students/${nonExistentStudentId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (ADMIN) fail for non-existent classId when assigning (404)', async () => {
      const nonExistentClassId = '123e4567-e89b-12d3-a456-426614174def';
      const assignDto: AssignClassDto = { classId: nonExistentClassId };
      await request(app.getHttpServer())
        .patch(`/students/${studentForAssignTestId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (ADMIN) fail with 400 for invalid classId UUID format', async () => {
      const assignDto: AssignClassDto = { classId: 'not-a-uuid' as any };
      await request(app.getHttpServer())
        .patch(`/students/${studentForAssignTestId}/assign-class`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignDto)
        .expect(HttpStatus.BAD_REQUEST); // Assuming ParseUUIDPipe or class-validator IsUUID handles this
    });
  });

  // Keep original delete tests, but ensure they handle their own student creation if needed
  // or use a student created specifically for them.
  describe('DELETE /students/:id (Delete Student - basic test)', () => {
    let studentIdToDeleteForDeleteTest: string;

    beforeEach(async () => {
      const dto = createSampleStudentDto();
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto);
      studentIdToDeleteForDeleteTest = response.body.id;
      // This student is NOT added to studentIdsCreated for automatic cleanup, as this test cleans it up.
    });

    it('should (ADMIN) delete an existing student', async () => {
      await request(app.getHttpServer())
        .delete(`/students/${studentIdToDeleteForDeleteTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/students/${studentIdToDeleteForDeleteTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // Original auth tests for general endpoints (can be kept or refactored if covered by new specific tests)
  // Example:
  describe('General Auth tests for /students endpoints', () => {
    let tempStudentId: string;
    beforeAll(async () => {
      const studentDto = createSampleStudentDto();
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      tempStudentId = res.body.id;
      studentIdsCreated.push(tempStudentId); // Add to cleanup
    });

    it('POST /students should (STUDENT role) fail (403)', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .send(createSampleStudentDto())
        .expect(HttpStatus.FORBIDDEN);
    });
    it('GET /students should (STUDENT role) fail (403)', async () => {
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('GET /students/:id should (STUDENT role) fail (403)', async () => {
      await request(app.getHttpServer())
        .get(`/students/${tempStudentId}`)
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('PATCH /students/:id should (STUDENT role) fail (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/students/${tempStudentId}`)
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .send({ firstName: 'Any' })
        .expect(HttpStatus.FORBIDDEN);
    });
    it('PATCH /students/:studentId/assign-class should (STUDENT role) fail (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/students/${tempStudentId}/assign-class`)
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .send({ classId: testClassId1 })
        .expect(HttpStatus.FORBIDDEN);
    });
    it('DELETE /students/:id should (STUDENT role) fail (403)', async () => {
      // Create a dedicated student for this delete test to avoid interference if tempStudentId was already deleted by admin tests.
      const studentDto = createSampleStudentDto();
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto);
      const specificStudentIdForDelete = res.body.id;
      studentIdsCreated.push(specificStudentIdForDelete); // Ensure it's cleaned up

      await request(app.getHttpServer())
        .delete(`/students/${specificStudentIdForDelete}`)
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
