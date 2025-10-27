import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student as StudentEntity } from '../../entities/student.entity';
import { IStudentRepository } from '../../domain/repositories';
import { Student } from '../../domain/models';
import { StudentId, Email } from '../../domain/value-objects';
import { StudentSchemaMapper } from '../mappers/student-schema.mapper';

/**
 * TypeORM Adapter implementing the IStudentRepository interface
 *
 * This adapter translates domain repository operations into TypeORM queries
 * and uses the mapper to convert between domain and persistence models.
 */
@Injectable()
export class StudentRepositoryAdapter implements IStudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentEntityRepository: Repository<StudentEntity>,
  ) {}

  async save(student: Student): Promise<Student> {
    // Convert domain aggregate to entity
    const entity = StudentSchemaMapper.toPersistence(student);

    // Save to database
    const savedEntity = await this.studentEntityRepository.save(entity);

    // Convert back to domain aggregate
    return StudentSchemaMapper.toDomain(savedEntity);
  }

  async findById(id: StudentId, schoolId: string): Promise<Student | null> {
    const entity = await this.studentEntityRepository.findOne({
      where: {
        studentId: id.getValue(),
        schoolId,
      },
    });

    return entity ? StudentSchemaMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email, schoolId: string): Promise<Student | null> {
    const entity = await this.studentEntityRepository.findOne({
      where: {
        email: email.getValue(),
        schoolId,
      },
    });

    return entity ? StudentSchemaMapper.toDomain(entity) : null;
  }

  async findBySchool(
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<Student[]> {
    const query = this.studentEntityRepository
      .createQueryBuilder('student')
      .where('student.schoolId = :schoolId', { schoolId })
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC');

    // Apply pagination if provided
    if (page !== undefined && limit !== undefined) {
      query.skip((page - 1) * limit).take(limit);
    }

    const entities = await query.getMany();
    return StudentSchemaMapper.toDomainMany(entities);
  }

  async findByClass(classId: string, schoolId: string): Promise<Student[]> {
    const entities = await this.studentEntityRepository.find({
      where: {
        classId,
        schoolId,
      },
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
      },
    });

    return StudentSchemaMapper.toDomainMany(entities);
  }

  async count(schoolId: string): Promise<number> {
    return this.studentEntityRepository.count({
      where: { schoolId },
    });
  }

  async delete(id: StudentId, schoolId: string): Promise<boolean> {
    const result = await this.studentEntityRepository.delete({
      studentId: id.getValue(),
      schoolId,
    });

    return result.affected !== undefined && result.affected > 0;
  }

  async exists(id: StudentId, schoolId: string): Promise<boolean> {
    const count = await this.studentEntityRepository.count({
      where: {
        studentId: id.getValue(),
        schoolId,
      },
    });

    return count > 0;
  }

  async emailExists(
    email: Email,
    schoolId: string,
    excludeId?: StudentId,
  ): Promise<boolean> {
    const query = this.studentEntityRepository
      .createQueryBuilder('student')
      .where('student.email = :email', { email: email.getValue() })
      .andWhere('student.schoolId = :schoolId', { schoolId });

    // Exclude specific student ID if provided (for updates)
    if (excludeId) {
      query.andWhere('student.studentId != :excludeId', {
        excludeId: excludeId.getValue(),
      });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
