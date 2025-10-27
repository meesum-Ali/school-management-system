import { DomainEvent } from './domain-event.base';

/**
 * Domain Event: Student Unenrolled
 * Emitted when a student is removed from a class
 */
export class StudentUnenrolledEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly classId: string,
    public readonly unenrolledAt: Date,
  ) {
    super('StudentUnenrolled');
  }
}
