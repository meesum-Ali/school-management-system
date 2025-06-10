import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateStudentDto } from '../src/students/dto/create-student.dto';
import { UpdateStudentDto } from '../src/students/dto/update-student.dto';
import { StudentDto } from '../src/students/dto/student.dto'; // For response checking
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../src/students/student.entity';


describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let studentRepository: Repository<Student>;
  let createdStudentId: string; // Changed to string for UUID
  let studentCounter = 0;

  const generateUniqueSuffix = () => {
    studentCounter++;
    return `${Date.now()}${studentCounter}`;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Using global pipe as defined in main.ts or controller-level pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    studentRepository = moduleFixture.get<Repository<Student>>(getRepositoryToken(Student));
  });

  afterAll(async () => {
    // Consider cleaning up test data more selectively if needed
    // if (createdStudentId) {
    //   await studentRepository.delete(createdStudentId).catch(() => {});
    // }
    await app.close();
  });

  // Helper to create a student directly for setup if needed for some tests
  // (though most tests should go through the API)
  const createTestStudentViaApi = async (dto: CreateStudentDto) => {
    const response = await request(app.getHttpServer()).post('/students').send(dto);
    return response.body as StudentDto;
  };


  describe('POST /students', () => {
    it('should create a new student and return student data', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const createStudentDto: CreateStudentDto = {
        firstName: 'Test',
        lastName: 'Student',
        dateOfBirth: new Date('2002-03-03'),
        email: `test.student.${uniqueSuffix}@example.com`,
        studentId: `S${uniqueSuffix}`,
      };

      const response = await request(app.getHttpServer())
        .post('/students')
        .send(createStudentDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      createdStudentId = response.body.id; // Save for later tests
      expect(response.body.firstName).toEqual(createStudentDto.firstName);
      expect(response.body.email).toEqual(createStudentDto.email);
      expect(response.body.studentId).toEqual(createStudentDto.studentId);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data (e.g., missing required field)', async () => {
      const invalidDto: Partial<CreateStudentDto> = { email: 'onlyemail@example.com' };
      await request(app.getHttpServer())
        .post('/students')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 409 Conflict if studentId already exists', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const dto: CreateStudentDto = {
        firstName: 'Conflict', lastName: 'Student', dateOfBirth: new Date('2000-01-01'),
        email: `conflict1_${uniqueSuffix}@example.com`, studentId: `S_CONFLICT_${uniqueSuffix}`
      };
      await createTestStudentViaApi(dto); // Create first student

      const dto2: CreateStudentDto = { ...dto, email: `conflict2_${uniqueSuffix}@example.com` }; // Same studentId, different email
      await request(app.getHttpServer())
        .post('/students')
        .send(dto2)
        .expect(HttpStatus.CONFLICT);
    });

    it('should return 409 Conflict if email already exists', async () => {
      const uniqueSuffix = generateUniqueSuffix();
      const dto: CreateStudentDto = {
        firstName: 'Conflict', lastName: 'Student', dateOfBirth: new Date('2000-01-01'),
        email: `conflict_email_${uniqueSuffix}@example.com`, studentId: `S_EMAIL_C1_${uniqueSuffix}`
      };
      await createTestStudentViaApi(dto); // Create first student

      const dto2: CreateStudentDto = { ...dto, studentId: `S_EMAIL_C2_${uniqueSuffix}` }; // Same email, different studentId
      await request(app.getHttpServer())
        .post('/students')
        .send(dto2)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /students', () => {
    it('should return an array of students', async () => {
      // Ensure at least one student exists from previous test
      if (!createdStudentId) {
        const uniqueSuffix = generateUniqueSuffix();
        const student = await createTestStudentViaApi({
            firstName: 'Getter', lastName: 'Student', dateOfBirth: new Date('2000-01-01'),
            email: `getter.${uniqueSuffix}@example.com`, studentId: `S_GETTER_${uniqueSuffix}`
        });
        createdStudentId = student.id;
      }

      const response = await request(app.getHttpServer())
        .get('/students')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const found = response.body.find((s: StudentDto) => s.id === createdStudentId);
      expect(found).toBeDefined();
    });
  });

  describe('GET /students/:id', () => {
    it('should return a specific student by ID', async () => {
      if (!createdStudentId) throw new Error('createdStudentId is not set for GET /students/:id test');
      const response = await request(app.getHttpServer())
        .get(`/students/${createdStudentId}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdStudentId);
      expect(response.body.firstName).toBeDefined(); // Check other fields as needed
    });

    it('should return 404 for a non-existent student ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/students/${nonExistentUuid}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for an invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/students/invalid-uuid-format')
        .expect(HttpStatus.BAD_REQUEST); // Assuming ParseUUIDPipe is used
    });
  });

  describe('PATCH /students/:id', () => {
    it('should update an existing student', async () => {
      if (!createdStudentId) throw new Error('createdStudentId is not set for PATCH /students/:id test');
      const updateDto: UpdateStudentDto = { firstName: 'UpdatedFirstName' };

      const response = await request(app.getHttpServer())
        .patch(`/students/${createdStudentId}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdStudentId);
      expect(response.body.firstName).toEqual(updateDto.firstName);
    });

    it('should return 404 for updating a non-existent student ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .patch(`/students/${nonExistentUuid}`)
        .send({ firstName: 'GhostUpdate' })
        .expect(HttpStatus.NOT_FOUND);
    });

     it('should return 409 if trying to update email to one that already exists for another student', async () => {
        const uniqueSuffix1 = generateUniqueSuffix();
        const student1 = await createTestStudentViaApi({
            firstName: 'S1', lastName: 'LN1', dateOfBirth: new Date(),
            email: `s1.${uniqueSuffix1}@example.com`, studentId: `S1ID${uniqueSuffix1}`
        });
        const uniqueSuffix2 = generateUniqueSuffix();
        const student2 = await createTestStudentViaApi({
            firstName: 'S2', lastName: 'LN2', dateOfBirth: new Date(),
            email: `s2.${uniqueSuffix2}@example.com`, studentId: `S2ID${uniqueSuffix2}`
        });

        await request(app.getHttpServer())
            .patch(`/students/${student2.id}`)
            .send({ email: student1.email }) // Try to update student2's email to student1's email
            .expect(HttpStatus.CONFLICT);
    });
  });

  describe('DELETE /students/:id', () => {
    it('should delete an existing student', async () => {
      // Create a student specifically for this test
      const uniqueSuffix = generateUniqueSuffix();
      const studentToDelete = await createTestStudentViaApi({
        firstName: 'ToDelete', lastName: 'Student', dateOfBirth: new Date('2000-01-01'),
        email: `todelete.${uniqueSuffix}@example.com`, studentId: `S_DEL_${uniqueSuffix}`
      });

      await request(app.getHttpServer())
        .delete(`/students/${studentToDelete.id}`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify student is deleted
      await request(app.getHttpServer())
        .get(`/students/${studentToDelete.id}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 for deleting a non-existent student ID', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .delete(`/students/${nonExistentUuid}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
