import { DateOfBirth } from './date-of-birth.vo';
import { InvalidDateOfBirthException } from '../exceptions/invalid-date-of-birth.exception';

describe('DateOfBirth Value Object', () => {
  describe('create', () => {
    it('should create a valid date of birth from string', () => {
      const dob = DateOfBirth.create('2005-01-15');

      expect(dob).toBeDefined();
      expect(dob.getValue()).toBeInstanceOf(Date);
    });

    it('should create a valid date of birth from Date object', () => {
      const date = new Date('2005-01-15');
      const dob = DateOfBirth.create(date);

      expect(dob).toBeDefined();
      expect(dob.getValue()).toBeInstanceOf(Date);
    });

    it('should throw InvalidDateOfBirthException for empty string', () => {
      expect(() => DateOfBirth.create('')).toThrow(InvalidDateOfBirthException);
    });

    it('should throw InvalidDateOfBirthException for invalid date format', () => {
      expect(() => DateOfBirth.create('invalid-date')).toThrow(
        InvalidDateOfBirthException,
      );
      expect(() => DateOfBirth.create('invalid-date')).toThrow('Invalid date');
    });

    it('should throw InvalidDateOfBirthException for future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(() => DateOfBirth.create(futureDate)).toThrow(
        InvalidDateOfBirthException,
      );
      expect(() => DateOfBirth.create(futureDate)).toThrow(
        'cannot be in the future',
      );
    });

    it('should accept today as valid date of birth', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dob = DateOfBirth.create(today);
      expect(dob).toBeDefined();
    });

    it('should throw InvalidDateOfBirthException if person is too old', () => {
      const tooOld = new Date();
      tooOld.setFullYear(tooOld.getFullYear() - 151); // 151 years old

      expect(() => DateOfBirth.create(tooOld)).toThrow(
        InvalidDateOfBirthException,
      );
      expect(() => DateOfBirth.create(tooOld)).toThrow('maximum age');
    });

    it('should accept maximum valid age (150 years)', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 150);

      const dob = DateOfBirth.create(date);
      expect(dob).toBeDefined();
    });
  });

  describe('getAge', () => {
    it('should calculate correct age', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 18;
      const dob = DateOfBirth.create(new Date(birthYear, 0, 1)); // January 1st

      const age = dob.getAge();
      expect(age).toBeGreaterThanOrEqual(17);
      expect(age).toBeLessThanOrEqual(18);
    });

    it('should return 0 for newborn (today)', () => {
      const today = new Date();
      const dob = DateOfBirth.create(today);

      expect(dob.getAge()).toBe(0);
    });

    it('should calculate age correctly for leap year birthdays', () => {
      const leapYearBirth = new Date('2000-02-29');
      const dob = DateOfBirth.create(leapYearBirth);

      const expectedAge = new Date().getFullYear() - 2000;
      const actualAge = dob.getAge();

      // Age should be expectedAge or expectedAge-1 depending on current date
      expect(actualAge).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(actualAge).toBeLessThanOrEqual(expectedAge);
    });
  });

  describe('isMinor', () => {
    it('should return true for person under 18', () => {
      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

      const dob = DateOfBirth.create(fifteenYearsAgo);
      expect(dob.isMinor()).toBe(true);
    });

    it('should return false for person 18 or older', () => {
      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

      const dob = DateOfBirth.create(twentyYearsAgo);
      expect(dob.isMinor()).toBe(false);
    });

    it('should return true for person exactly 17 years old', () => {
      const seventeenYearsAgo = new Date();
      seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

      const dob = DateOfBirth.create(seventeenYearsAgo);
      expect(dob.isMinor()).toBe(true);
    });
  });

  describe('isSchoolAge', () => {
    it('should return true for typical school age (5-18)', () => {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const dob = DateOfBirth.create(tenYearsAgo);
      expect(dob.isSchoolAge()).toBe(true);
    });

    it('should return false for too young (under 5)', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      const dob = DateOfBirth.create(threeYearsAgo);
      expect(dob.isSchoolAge()).toBe(false);
    });

    it('should return false for too old (over 18)', () => {
      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

      const dob = DateOfBirth.create(twentyYearsAgo);
      expect(dob.isSchoolAge()).toBe(false);
    });
  });

  describe('toISOString', () => {
    it('should return ISO 8601 date string', () => {
      const dob = DateOfBirth.create('2005-01-15');
      const isoString = dob.toISOString();

      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('equals', () => {
    it('should return true for same date', () => {
      const dob1 = DateOfBirth.create('2005-01-15');
      const dob2 = DateOfBirth.create('2005-01-15');

      expect(dob1.equals(dob2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const dob1 = DateOfBirth.create('2005-01-15');
      const dob2 = DateOfBirth.create('2006-01-15');

      expect(dob1.equals(dob2)).toBe(false);
    });

    it('should handle null/undefined gracefully', () => {
      const dob = DateOfBirth.create('2005-01-15');

      expect(dob.equals(null as any)).toBe(false);
      expect(dob.equals(undefined as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const dob = DateOfBirth.create('2005-01-15');

      expect(() => {
        (dob as any).value = new Date();
      }).toThrow();
    });
  });
});
