import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Main AppModule
import { CreateStudentDto } from '../src/students/dto/create-student.dto';
import { UpdateStudentDto } from '../src/students/dto/update-student.dto';
import { Student } from '../src/students/student.entity'; // Import Student entity if needed for type checking

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let createdStudentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Using the main AppModule which should include StudentsModule
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply ValidationPipe globally for e2e tests to match main.ts behavior if it were applied there
    // or rely on controller-level pipe if that's the setup.
    // For this case, StudentsController has its own ValidationPipe.
    // app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validStudentDto: CreateStudentDto = {
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '2000-01-15', // Use string for DTO
    email: `test.user.${Date.now()}@example.com`, // Ensure unique email
    studentId: `S${Date.now()}`, // Ensure unique studentId
  };

  describe('POST /students', () => {
    it('should create a new student', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .send(validStudentDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      createdStudentId = response.body.id; // Save for later tests
      expect(response.body.firstName).toEqual(validStudentDto.firstName);
      expect(response.body.email).toEqual(validStudentDto.email);
    });

    it('should return 400 for invalid data (e.g., missing required field)', async () => {
      const invalidDto = { ...validStudentDto, firstName: undefined };
      await request(app.getHttpServer())
        .post('/students')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /students', () => {
    it('should return an array of students', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Check if the created student is in the list
      const found = response.body.find((s: Student) => s.id === createdStudentId);
      expect(found).toBeDefined();
    });
  });

  describe('GET /students/:id', () => {
    it('should return a specific student', async () => {
      const response = await request(app.getHttpServer())
        .get(`/students/${createdStudentId}`)
        .expect(200);

      expect(response.body.id).toEqual(createdStudentId);
      expect(response.body.firstName).toEqual(validStudentDto.firstName);
    });

    it('should return 404 for a non-existent student', async () => {
      await request(app.getHttpServer())
        .get('/students/999999') // Assuming this ID won't exist
        .expect(404);
    });
  });

  describe('PATCH /students/:id', () => {
    const updateDto: UpdateStudentDto = { firstName: 'UpdatedName' };

    it('should update an existing student', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/students/${createdStudentId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toEqual(createdStudentId);
      expect(response.body.firstName).toEqual(updateDto.firstName);
    });

    it('should return 400 for invalid update data (e.g. wrong type)', async () => {
      await request(app.getHttpServer())
        .patch(`/students/${createdStudentId}`)
        .send({ email: 123 }) // email should be a string
        .expect(400);
    });

    it('should return 404 for a non-existent student', async () => {
      await request(app.getHttpServer())
        .patch('/students/999999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /students/:id', () => {
    it('should delete an existing student', async () => {
      await request(app.getHttpServer())
        .delete(`/students/${createdStudentId}`)
        .expect(200); // Or 204 if the endpoint returns no content

      // Verify student is deleted
      await request(app.getHttpServer())
        .get(`/students/${createdStudentId}`)
        .expect(404);
    });

    it('should return 404 for a non-existent student', async () => {
      await request(app.getHttpServer())
        .delete('/students/999999')
        .expect(404);
    });
  });
});
