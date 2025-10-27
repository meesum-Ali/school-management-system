import { StudentId } from './student-id.vo';
import { InvalidStudentIdException } from '../exceptions/invalid-student-id.exception';

describe('StudentId Value Object', () => {
  describe('create', () => {
    it('should create a valid student ID from UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const studentId = StudentId.create(uuid);

      expect(studentId).toBeDefined();
      expect(studentId.getValue()).toBe(uuid);
    });

    it('should create a valid student ID from custom format', () => {
      const customId = 'STU-2023-12345';
      const studentId = StudentId.create(customId);

      expect(studentId.getValue()).toBe(customId);
    });

    it('should trim whitespace', () => {
      const studentId = StudentId.create('  STU-2023-12345  ');

      expect(studentId.getValue()).toBe('STU-2023-12345');
    });

    it('should throw InvalidStudentIdException for empty string', () => {
      expect(() => StudentId.create('')).toThrow(InvalidStudentIdException);
      expect(() => StudentId.create('')).toThrow('cannot be empty');
    });

    it('should throw InvalidStudentIdException for whitespace only', () => {
      expect(() => StudentId.create('   ')).toThrow(InvalidStudentIdException);
    });

    it('should throw InvalidStudentIdException for ID that is too short', () => {
      expect(() => StudentId.create('ab')).toThrow(InvalidStudentIdException);
      expect(() => StudentId.create('ab')).toThrow('at least 3 characters');
    });

    it('should throw InvalidStudentIdException for ID that is too long', () => {
      const longId = 'a'.repeat(101);
      expect(() => StudentId.create(longId)).toThrow(InvalidStudentIdException);
      expect(() => StudentId.create(longId)).toThrow(
        /must not exceed 100 characters/,
      );
    });

    it('should accept minimum length ID', () => {
      const studentId = StudentId.create('abc');
      expect(studentId.getValue()).toBe('abc');
    });

    it('should accept maximum length ID', () => {
      const maxId = 'a'.repeat(100);
      const studentId = StudentId.create(maxId);
      expect(studentId.getValue()).toBe(maxId);
    });
  });

  describe('generate', () => {
    it('should generate a new UUID student ID', () => {
      const studentId = StudentId.generate();

      expect(studentId).toBeDefined();
      expect(studentId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should generate unique IDs', () => {
      const id1 = StudentId.generate();
      const id2 = StudentId.generate();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same student ID values', () => {
      const id1 = StudentId.create('STU-2023-12345');
      const id2 = StudentId.create('STU-2023-12345');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different student IDs', () => {
      const id1 = StudentId.create('STU-2023-12345');
      const id2 = StudentId.create('STU-2023-67890');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle null/undefined gracefully', () => {
      const id = StudentId.create('STU-2023-12345');

      expect(id.equals(null as any)).toBe(false);
      expect(id.equals(undefined as any)).toBe(false);
    });
  });

  describe('isUUID', () => {
    it('should return true for UUID format', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const studentId = StudentId.create(uuid);

      expect(studentId.isUUID()).toBe(true);
    });

    it('should return false for custom format', () => {
      const studentId = StudentId.create('STU-2023-12345');

      expect(studentId.isUUID()).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const studentId = StudentId.create('STU-2023-12345');

      expect(() => {
        (studentId as any).value = 'hacked-id';
      }).toThrow();
    });
  });
});
