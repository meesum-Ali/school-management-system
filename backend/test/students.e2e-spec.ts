import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateStudentDto } from '../src/students/dto/create-student.dto';
import { UpdateStudentDto } from '../src/students/dto/update-student.dto';
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service'; // For creating test users
// No direct student repository interaction needed for most e2e tests focusing on controller logic

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let studentRoleToken: string; // Using STUDENT role as a generic non-admin role
  let createdStudentByAdminId: string;

  const studentPassword = 'Password123!';
  let testCounter = 0;
  const generateUniqueSuffix = () => `${Date.now()}${testCounter++}`;

  const createAndLoginUser = async (roles: UserRole[]): Promise<string> => {
    const uniqueSuffix = generateUniqueSuffix();
    const username = `test_student_ctrl_${roles.join('_')}_${uniqueSuffix}`;
    const email = `${username}@example.com`;

    await usersService.create({ // Use UsersService for direct creation
      username, email, password: studentPassword, roles, isActive: true,
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    adminToken = await createAndLoginUser([UserRole.ADMIN]);
    studentRoleToken = await createAndLoginUser([UserRole.STUDENT]); // User with STUDENT role
  });

  afterAll(async () => {
    await app.close();
  });

  const createSampleStudentDto = (): CreateStudentDto => {
    const uniqueSuffix = generateUniqueSuffix();
    return {
      firstName: 'Test',
      lastName: 'Student',
      dateOfBirth: new Date('2003-05-10'),
      email: `student.e2e.${uniqueSuffix}@example.com`,
      studentId: `S_E2E_${uniqueSuffix}`,
    };
  };

  describe('POST /students (Create Student)', () => {
    const studentDto = createSampleStudentDto();

    it('should (ADMIN) create a new student', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentDto)
        .expect(HttpStatus.CREATED);
      expect(response.body.email).toEqual(studentDto.email);
      createdStudentByAdminId = response.body.id; // Save for other tests
    });

    it('should (STUDENT role) fail to create a student (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${studentRoleToken}`)
        .send(studentDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should (No Auth) fail to create a student (401 Unauthorized)', async () => {
        await request(app.getHttpServer())
          .post('/students')
          .send(studentDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

    it('should (ADMIN) return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Bad' }) // Missing other required fields
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /students (Find All Students)', () => {
    it('should (ADMIN) return an array of students', async () => {
      // Ensure at least one student created by admin exists
      if (!createdStudentByAdminId) {
        const student = await request(app.getHttpServer()).post('/students').set('Authorization', `Bearer ${adminToken}`).send(createSampleStudentDto());
        createdStudentByAdminId = student.body.id;
      }
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should (STUDENT role) fail to get all students (403 Forbidden)', async () => {
        await request(app.getHttpServer())
          .get('/students')
          .set('Authorization', `Bearer ${studentRoleToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });
  });

  describe('GET /students/:id (Find One Student)', () => {
    it('should (ADMIN) return a specific student by ID', async () => {
      if (!createdStudentByAdminId) throw new Error('createdStudentByAdminId is needed');
      const response = await request(app.getHttpServer())
        .get(`/students/${createdStudentByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.id).toEqual(createdStudentByAdminId);
    });

    it('should (STUDENT role) fail to get a student by ID (403 Forbidden)', async () => {
        if (!createdStudentByAdminId) throw new Error('createdStudentByAdminId is needed');
        await request(app.getHttpServer())
          .get(`/students/${createdStudentByAdminId}`)
          .set('Authorization', `Bearer ${studentRoleToken}`)
          .expect(HttpStatus.FORBIDDEN);
    });

    it('should (ADMIN) return 404 for a non-existent student ID', async () => {
        const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
        await request(app.getHttpServer())
          .get(`/students/${nonExistentUuid}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  describe('PATCH /students/:id (Update Student)', () => {
    const updateDto: UpdateStudentDto = { firstName: 'UpdatedStudentName' };

    it('should (ADMIN) update an existing student', async () => {
      if (!createdStudentByAdminId) throw new Error('createdStudentByAdminId is needed');
      const response = await request(app.getHttpServer())
        .patch(`/students/${createdStudentByAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(response.body.firstName).toEqual(updateDto.firstName);
    });

    it('should (STUDENT role) fail to update a student (403 Forbidden)', async () => {
        if (!createdStudentByAdminId) throw new Error('createdStudentByAdminId is needed');
        await request(app.getHttpServer())
          .patch(`/students/${createdStudentByAdminId}`)
          .set('Authorization', `Bearer ${studentRoleToken}`)
          .send(updateDto)
          .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /students/:id (Delete Student)', () => {
    let studentIdToDelete: string;

    beforeEach(async () => { // Create a fresh student for each delete test variant
        const dto = createSampleStudentDto();
        const response = await request(app.getHttpServer())
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`) // Admin creates the student
            .send(dto);
        studentIdToDelete = response.body.id;
    });

    it('should (ADMIN) delete an existing student', async () => {
      await request(app.getHttpServer())
        .delete(`/students/${studentIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer()) // Verify
        .get(`/students/${studentIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should (STUDENT role) fail to delete a student (403 Forbidden)', async () => {
        await request(app.getHttpServer())
          .delete(`/students/${studentIdToDelete}`)
          .set('Authorization', `Bearer ${studentRoleToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });
  });
});
