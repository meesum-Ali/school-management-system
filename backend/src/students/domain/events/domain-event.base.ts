/**
 * Base Domain Event
 * All domain events extend from this base class
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.occurredOn = new Date();
    this.eventType = eventType;
  }
}
