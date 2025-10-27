import { DomainEvent } from './domain-event.base';

/**
 * Domain Event: Student Enrolled
 * Emitted when a student is enrolled in a class
 */
export class StudentEnrolledEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly classId: string,
    public readonly enrolledAt: Date,
  ) {
    super('StudentEnrolled');
  }
}
