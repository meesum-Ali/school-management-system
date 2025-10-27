import { Student as StudentEntity } from '../../entities/student.entity';
import { Student } from '../../domain/models';
import { StudentId, Email, DateOfBirth } from '../../domain/value-objects';

/**
 * Mapper: Domain Student Aggregate ↔ TypeORM Student Entity
 *
 * This mapper handles the translation between the rich domain model
 * and the flat persistence schema.
 */
export class StudentSchemaMapper {
  /**
   * Map from Domain Aggregate to TypeORM Entity
   * @param aggregate The domain Student aggregate
   * @returns TypeORM Student entity ready for persistence
   */
  static toPersistence(aggregate: Student): StudentEntity {
    const entity = new StudentEntity();

    // Map ID (handle both UUID and custom formats)
    const idValue = aggregate.getId().getValue();
    if (aggregate.getId().isUUID()) {
      entity.id = idValue;
      entity.studentId = idValue; // Use same value for studentId
    } else {
      // For custom IDs, we need to handle differently
      // In production, you might want to maintain a separate mapping table
      entity.studentId = idValue;
      // If entity.id is not set, TypeORM will generate a new UUID
    }

    // Map scalar fields
    entity.firstName = aggregate.getFirstName();
    entity.lastName = aggregate.getLastName();
    entity.email = aggregate.getEmail().getValue();
    entity.dateOfBirth = aggregate.getDateOfBirth().getValue();
    entity.schoolId = aggregate.getSchoolId();

    // Map optional fields (phoneNumber and address)
    // Note: These fields exist in domain but not in current entity schema
    // They will be added to the entity schema in a future migration
    // For now, we acknowledge their existence without using them
    // const phoneNumber = aggregate.getPhoneNumber();
    // const address = aggregate.getAddress();

    // Map enrollment
    entity.classId = aggregate.getClassId();

    return entity;
  }

  /**
   * Map from TypeORM Entity to Domain Aggregate
   * @param entity The TypeORM Student entity
   * @returns Domain Student aggregate
   */
  static toDomain(entity: StudentEntity): Student {
    // Reconstruct value objects
    const studentId = StudentId.create(entity.studentId);
    const email = Email.create(entity.email);
    const dateOfBirth = DateOfBirth.create(entity.dateOfBirth);

    // Reconstruct aggregate
    // Note: We're using create() which will emit a creation event
    // In a real scenario, you might want a separate reconstitute() method
    // that doesn't emit events when loading from DB
    const student = Student.create({
      id: studentId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email,
      dateOfBirth,
      schoolId: entity.schoolId,
      phoneNumber: undefined, // Not in schema yet
      address: undefined, // Not in schema yet
      classId: entity.classId,
    });

    // Clear domain events since this is reconstitution, not creation
    student.clearDomainEvents();

    return student;
  }

  /**
   * Map a collection of entities to domain aggregates
   * @param entities Array of TypeORM entities
   * @returns Array of domain aggregates
   */
  static toDomainMany(entities: StudentEntity[]): Student[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
