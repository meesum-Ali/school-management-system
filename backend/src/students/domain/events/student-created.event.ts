import { DomainEvent } from './domain-event.base';

/**
 * Domain Event: Student Created
 * Emitted when a new student is created in the system
 */
export class StudentCreatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly email: string,
    public readonly schoolId: string,
  ) {
    super('StudentCreated');
  }
}
