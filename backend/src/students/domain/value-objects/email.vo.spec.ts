import { Email } from './email.vo';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('john.doe@example.com');

      expect(email).toBeDefined();
      expect(email.getValue()).toBe('john.doe@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('John.Doe@EXAMPLE.COM');

      expect(email.getValue()).toBe('john.doe@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  john.doe@example.com  ');

      expect(email.getValue()).toBe('john.doe@example.com');
    });

    it('should throw InvalidEmailException for empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailException);
      expect(() => Email.create('')).toThrow('cannot be empty');
    });

    it('should throw InvalidEmailException for whitespace only', () => {
      expect(() => Email.create('   ')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for missing @', () => {
      expect(() => Email.create('invalid.email.com')).toThrow(
        InvalidEmailException,
      );
      expect(() => Email.create('invalid.email.com')).toThrow('must contain @');
    });

    it('should throw InvalidEmailException for missing domain', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for missing local part', () => {
      expect(() => Email.create('@example.com')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for invalid format', () => {
      expect(() => Email.create('not..valid@example.com')).toThrow(
        InvalidEmailException,
      );
    });

    it('should throw InvalidEmailException for spaces in email', () => {
      expect(() => Email.create('john doe@example.com')).toThrow(
        InvalidEmailException,
      );
    });

    it('should accept valid email with plus sign', () => {
      const email = Email.create('john+test@example.com');
      expect(email.getValue()).toBe('john+test@example.com');
    });

    it('should accept valid email with subdomain', () => {
      const email = Email.create('john@mail.example.com');
      expect(email.getValue()).toBe('john@mail.example.com');
    });

    it('should accept valid email with hyphen', () => {
      const email = Email.create('john-doe@example.com');
      expect(email.getValue()).toBe('john-doe@example.com');
    });

    it('should accept valid email with numbers', () => {
      const email = Email.create('john123@example.com');
      expect(email.getValue()).toBe('john123@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same email values', () => {
      const email1 = Email.create('john@example.com');
      const email2 = Email.create('john@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email with different casing', () => {
      const email1 = Email.create('john@example.com');
      const email2 = Email.create('JOHN@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('john@example.com');
      const email2 = Email.create('jane@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('getDomain', () => {
    it('should return the domain part of email', () => {
      const email = Email.create('john@example.com');

      expect(email.getDomain()).toBe('example.com');
    });

    it('should return subdomain correctly', () => {
      const email = Email.create('john@mail.example.com');

      expect(email.getDomain()).toBe('mail.example.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return the local part of email', () => {
      const email = Email.create('john.doe@example.com');

      expect(email.getLocalPart()).toBe('john.doe');
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const email = Email.create('john@example.com');

      // Attempt to modify (should not work in strict mode)
      expect(() => {
        (email as any).value = 'hacked@example.com';
      }).toThrow();
    });
  });
});
