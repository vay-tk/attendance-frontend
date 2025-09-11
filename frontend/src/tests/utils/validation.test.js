import { describe, it, expect } from 'vitest';
import { validators } from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('email validator', () => {
    it('should validate correct email formats', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.in')).toBe(true);
      expect(validators.email('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validators.email('invalid-email')).toBe(false);
      expect(validators.email('@domain.com')).toBe(false);
      expect(validators.email('test@')).toBe(false);
      expect(validators.email('')).toBe(false);
    });
  });

  describe('password validator', () => {
    it('should validate strong passwords', () => {
      expect(validators.password('TestPass123!')).toBe(true);
      expect(validators.password('MySecure@Pass1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validators.password('weak')).toBe(false);
      expect(validators.password('nouppercaseornum!')).toBe(false);
      expect(validators.password('NOLOWERCASEORNUM!')).toBe(false);
      expect(validators.password('NoSpecialChar123')).toBe(false);
      expect(validators.password('NoNumber!')).toBe(false);
    });
  });

  describe('phone validator', () => {
    it('should validate Indian phone numbers', () => {
      expect(validators.phone('9876543210')).toBe(true);
      expect(validators.phone('8123456789')).toBe(true);
      expect(validators.phone('7999888777')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validators.phone('1234567890')).toBe(false); // starts with 1
      expect(validators.phone('987654321')).toBe(false);  // too short
      expect(validators.phone('98765432100')).toBe(false); // too long
      expect(validators.phone('abcdefghij')).toBe(false);  // not numeric
    });
  });

  describe('course code validator', () => {
    it('should validate correct course codes', () => {
      expect(validators.courseCode('CS101')).toBe(true);
      expect(validators.courseCode('EE201')).toBe(true);
      expect(validators.courseCode('ME301')).toBe(true);
    });

    it('should reject invalid course codes', () => {
      expect(validators.courseCode('C101')).toBe(false);   // too short
      expect(validators.courseCode('CSE101')).toBe(false); // too long
      expect(validators.courseCode('cs101')).toBe(false);  // lowercase
      expect(validators.courseCode('CS1A1')).toBe(false);  // letter in number
    });
  });

  describe('name validator', () => {
    it('should validate proper names', () => {
      expect(validators.name('John Doe')).toBe(true);
      expect(validators.name('Mary Jane Watson')).toBe(true);
      expect(validators.name('O Connor')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validators.name('')).toBe(false);
      expect(validators.name('A')).toBe(false);           // too short
      expect(validators.name('John123')).toBe(false);     // contains numbers
      expect(validators.name('John@Doe')).toBe(false);    // special characters
    });
  });

  describe('required validator', () => {
    it('should validate non-empty values', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required(0)).toBe(true);
      expect(validators.required(false)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required('   ')).toBe(false);
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });

  describe('file validator', () => {
    it('should validate correct file types and sizes', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validators.isValidFile(validFile)).toBe(true);
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(validators.isValidFile(invalidFile)).toBe(false);
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 25 * 1024 * 1024 }); // 25MB
      
      expect(validators.isValidFile(largeFile)).toBe(false);
    });
  });
});