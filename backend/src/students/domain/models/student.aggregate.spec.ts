import { Student } from './student.aggregate';
import { StudentId, Email, DateOfBirth } from '../value-objects';
import {
  InvalidStudentException,
  StudentAlreadyEnrolledException,
  StudentNotEnrolledException,
} from '../exceptions';
import {
  StudentCreatedEvent,
  StudentEnrolledEvent,
  StudentUnenrolledEvent,
} from '../events';

describe('Student Aggregate', () => {
  describe('create', () => {
    it('should create a valid student', () => {
      const student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });

      expect(student).toBeDefined();
      expect(student.getFirstName()).toBe('John');
      expect(student.getLastName()).toBe('Doe');
      expect(student.getFullName()).toBe('John Doe');
    });

    it('should emit StudentCreatedEvent on creation', () => {
      const student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });

      const events = student.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(StudentCreatedEvent);
    });

    it('should throw InvalidStudentException for empty first name', () => {
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: '',
          lastName: 'Doe',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: 'school-1',
        }),
      ).toThrow(InvalidStudentException);
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: '',
          lastName: 'Doe',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: 'school-1',
        }),
      ).toThrow('First name cannot be empty');
    });

    it('should throw InvalidStudentException for empty last name', () => {
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: 'John',
          lastName: '',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: 'school-1',
        }),
      ).toThrow(InvalidStudentException);
    });

    it('should throw InvalidStudentException for first name too short', () => {
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: 'J',
          lastName: 'Doe',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: 'school-1',
        }),
      ).toThrow(/at least 2 characters/);
    });

    it('should throw InvalidStudentException for first name too long', () => {
      const longName = 'a'.repeat(51);
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: longName,
          lastName: 'Doe',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: 'school-1',
        }),
      ).toThrow(/maximum 50 characters/);
    });

    it('should trim whitespace from names', () => {
      const student = Student.create({
        id: StudentId.generate(),
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });

      expect(student.getFirstName()).toBe('John');
      expect(student.getLastName()).toBe('Doe');
    });

    it('should throw InvalidStudentException for empty school ID', () => {
      expect(() =>
        Student.create({
          id: StudentId.generate(),
          firstName: 'John',
          lastName: 'Doe',
          email: Email.create('john.doe@example.com'),
          dateOfBirth: DateOfBirth.create('2005-01-15'),
          schoolId: '',
        }),
      ).toThrow(/School ID cannot be empty/);
    });
  });

  describe('enroll', () => {
    let student: Student;

    beforeEach(() => {
      student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });
      student.clearDomainEvents(); // Clear creation event
    });

    it('should enroll student in a class', () => {
      student.enroll('class-1');

      expect(student.isEnrolled()).toBe(true);
      expect(student.getClassId()).toBe('class-1');
    });

    it('should emit StudentEnrolledEvent', () => {
      student.enroll('class-1');

      const events = student.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(StudentEnrolledEvent);
      expect((events[0] as StudentEnrolledEvent).classId).toBe('class-1');
    });

    it('should throw StudentAlreadyEnrolledException if already enrolled', () => {
      student.enroll('class-1');

      expect(() => student.enroll('class-2')).toThrow(
        StudentAlreadyEnrolledException,
      );
    });

    it('should throw InvalidStudentException for empty class ID', () => {
      expect(() => student.enroll('')).toThrow(/Class ID cannot be empty/);
    });
  });

  describe('unenroll', () => {
    let student: Student;

    beforeEach(() => {
      student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });
      student.clearDomainEvents();
    });

    it('should unenroll student from class', () => {
      student.enroll('class-1');
      student.clearDomainEvents();

      student.unenroll();

      expect(student.isEnrolled()).toBe(false);
      expect(student.getClassId()).toBeNull();
    });

    it('should emit StudentUnenrolledEvent', () => {
      student.enroll('class-1');
      const previousClassId = student.getClassId();
      student.clearDomainEvents();

      student.unenroll();

      const events = student.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(StudentUnenrolledEvent);
      expect((events[0] as StudentUnenrolledEvent).classId).toBe(
        previousClassId,
      );
    });

    it('should throw StudentNotEnrolledException if not enrolled', () => {
      expect(() => student.unenroll()).toThrow(StudentNotEnrolledException);
    });
  });

  describe('updateProfile', () => {
    let student: Student;

    beforeEach(() => {
      student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });
    });

    it('should update first name', () => {
      student.updateProfile({ firstName: 'Jane' });

      expect(student.getFirstName()).toBe('Jane');
    });

    it('should update last name', () => {
      student.updateProfile({ lastName: 'Smith' });

      expect(student.getLastName()).toBe('Smith');
    });

    it('should update email', () => {
      const newEmail = Email.create('jane.smith@example.com');
      student.updateProfile({ email: newEmail });

      expect(student.getEmail().equals(newEmail)).toBe(true);
    });

    it('should validate first name when updating', () => {
      expect(() => student.updateProfile({ firstName: 'J' })).toThrow(
        /at least 2 characters/,
      );
    });
  });

  describe('getters', () => {
    let student: Student;
    const studentId = StudentId.generate();
    const email = Email.create('john.doe@example.com');
    const dob = DateOfBirth.create('2005-01-15');

    beforeEach(() => {
      student = Student.create({
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        email,
        dateOfBirth: dob,
        schoolId: 'school-1',
      });
    });

    it('should return student ID', () => {
      expect(student.getId().equals(studentId)).toBe(true);
    });

    it('should return email', () => {
      expect(student.getEmail().equals(email)).toBe(true);
    });

    it('should return date of birth', () => {
      expect(student.getDateOfBirth().equals(dob)).toBe(true);
    });

    it('should return school ID', () => {
      expect(student.getSchoolId()).toBe('school-1');
    });

    it('should return full name', () => {
      expect(student.getFullName()).toBe('John Doe');
    });

    it('should return age', () => {
      const age = student.getAge();
      expect(age).toBeGreaterThanOrEqual(19);
      expect(age).toBeLessThanOrEqual(20);
    });

    it('should return isMinor status', () => {
      const age = student.getAge();
      expect(student.isMinor()).toBe(age < 18);
    });
  });

  describe('domain events', () => {
    it('should collect multiple domain events', () => {
      const student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });

      student.enroll('class-1');

      const events = student.getDomainEvents();
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(StudentCreatedEvent);
      expect(events[1]).toBeInstanceOf(StudentEnrolledEvent);
    });

    it('should clear domain events', () => {
      const student = Student.create({
        id: StudentId.generate(),
        firstName: 'John',
        lastName: 'Doe',
        email: Email.create('john.doe@example.com'),
        dateOfBirth: DateOfBirth.create('2005-01-15'),
        schoolId: 'school-1',
      });

      expect(student.getDomainEvents()).toHaveLength(1);

      student.clearDomainEvents();

      expect(student.getDomainEvents()).toHaveLength(0);
    });
  });
});
