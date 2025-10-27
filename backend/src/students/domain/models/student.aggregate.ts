import { StudentId, Email, DateOfBirth } from '../value-objects';
import {
  InvalidStudentException,
  StudentAlreadyEnrolledException,
  StudentNotEnrolledException,
} from '../exceptions';
import {
  DomainEvent,
  StudentCreatedEvent,
  StudentEnrolledEvent,
  StudentUnenrolledEvent,
} from '../events';

export interface CreateStudentProps {
  id: StudentId;
  firstName: string;
  lastName: string;
  email: Email;
  dateOfBirth: DateOfBirth;
  schoolId: string;
  phoneNumber?: string;
  address?: string;
  classId?: string | null;
}

export interface UpdateStudentProfileProps {
  firstName?: string;
  lastName?: string;
  email?: Email;
  phoneNumber?: string;
  address?: string;
}

export class Student {
  private readonly id: StudentId;
  private firstName: string;
  private lastName: string;
  private email: Email;
  private readonly dateOfBirth: DateOfBirth;
  private readonly schoolId: string;
  private phoneNumber?: string;
  private address?: string;
  private classId: string | null;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: CreateStudentProps) {
    this.id = props.id;
    this.firstName = this.validateAndTrimName(props.firstName, 'First name');
    this.lastName = this.validateAndTrimName(props.lastName, 'Last name');
    this.email = props.email;
    this.dateOfBirth = props.dateOfBirth;
    this.schoolId = this.validateSchoolId(props.schoolId);
    this.phoneNumber = props.phoneNumber;
    this.address = props.address;
    this.classId = props.classId || null;
  }

  public static create(props: CreateStudentProps): Student {
    const student = new Student(props);

    student.addDomainEvent(
      new StudentCreatedEvent(
        student.id.getValue(),
        student.email.getValue(),
        student.schoolId,
      ),
    );

    return student;
  }

  public enroll(classId: string): void {
    if (!classId || classId.trim() === '') {
      throw new InvalidStudentException('Class ID cannot be empty');
    }

    if (this.classId !== null) {
      throw new StudentAlreadyEnrolledException(
        this.id.getValue(),
        this.classId,
      );
    }

    this.classId = classId;

    this.addDomainEvent(
      new StudentEnrolledEvent(this.id.getValue(), classId, new Date()),
    );
  }

  public unenroll(): void {
    if (this.classId === null) {
      throw new StudentNotEnrolledException(this.id.getValue());
    }

    const previousClassId = this.classId;
    this.classId = null;

    this.addDomainEvent(
      new StudentUnenrolledEvent(
        this.id.getValue(),
        previousClassId,
        new Date(),
      ),
    );
  }

  public updateProfile(updates: UpdateStudentProfileProps): void {
    if (updates.firstName !== undefined) {
      this.firstName = this.validateAndTrimName(
        updates.firstName,
        'First name',
      );
    }

    if (updates.lastName !== undefined) {
      this.lastName = this.validateAndTrimName(updates.lastName, 'Last name');
    }

    if (updates.email !== undefined) {
      this.email = updates.email;
    }

    if (updates.phoneNumber !== undefined) {
      this.phoneNumber = updates.phoneNumber;
    }

    if (updates.address !== undefined) {
      this.address = updates.address;
    }
  }

  private validateAndTrimName(name: string, fieldName: string): string {
    const trimmed = name.trim();

    if (trimmed === '') {
      throw new InvalidStudentException(`${fieldName} cannot be empty`);
    }

    if (trimmed.length < 2) {
      throw new InvalidStudentException(
        `${fieldName} must be at least 2 characters long`,
      );
    }

    if (trimmed.length > 50) {
      throw new InvalidStudentException(
        `${fieldName} must be maximum 50 characters long`,
      );
    }

    return trimmed;
  }

  private validateSchoolId(schoolId: string): string {
    if (!schoolId || schoolId.trim() === '') {
      throw new InvalidStudentException('School ID cannot be empty');
    }
    return schoolId;
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // Getters
  public getId(): StudentId {
    return this.id;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getDateOfBirth(): DateOfBirth {
    return this.dateOfBirth;
  }

  public getSchoolId(): string {
    return this.schoolId;
  }

  public getPhoneNumber(): string | undefined {
    return this.phoneNumber;
  }

  public getAddress(): string | undefined {
    return this.address;
  }

  public getClassId(): string | null {
    return this.classId;
  }

  public isEnrolled(): boolean {
    return this.classId !== null;
  }

  public getAge(): number {
    return this.dateOfBirth.getAge();
  }

  public isMinor(): boolean {
    return this.dateOfBirth.isMinor();
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
