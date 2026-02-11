import { Validator } from '../utils/ErrorHandler';

describe('Validator', () => {
  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = Validator.validatePassword('StrongP@ssw0rd');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short password', () => {
      const result = Validator.validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without lowercase', () => {
      const result = Validator.validatePassword('NOLOWER123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without uppercase', () => {
      const result = Validator.validatePassword('noupper123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without numbers', () => {
      const result = Validator.validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject empty password', () => {
      const result = Validator.validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('validateMasterPassword', () => {
    it('should validate strong master password', () => {
      const result = Validator.validateMasterPassword('StrongMasterP@ssw0rd');
      expect(result.valid).toBe(true);
    });

    it('should reject master password without special characters', () => {
      const result = Validator.validateMasterPassword('NoSpecialChars123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Master password must contain at least one special character');
    });

    it('should reject short master password', () => {
      const result = Validator.validateMasterPassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Master password must be at least 12 characters long');
    });
  });

  describe('validateDomain', () => {
    it('should validate correct domain', () => {
      const result = Validator.validateDomain('example.com');
      expect(result.valid).toBe(true);
    });

    it('should validate subdomain', () => {
      const result = Validator.validateDomain('sub.example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid domain', () => {
      const result = Validator.validateDomain('not a domain');
      expect(result.valid).toBe(false);
    });

    it('should reject empty domain', () => {
      const result = Validator.validateDomain('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct username', () => {
      const result = Validator.validateUsername('user123');
      expect(result.valid).toBe(true);
    });

    it('should reject empty username', () => {
      const result = Validator.validateUsername('');
      expect(result.valid).toBe(false);
    });

    it('should reject too long username', () => {
      const longUsername = 'a'.repeat(257);
      const result = Validator.validateUsername(longUsername);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URL', () => {
      const result = Validator.validateUrl('https://example.com/path');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = Validator.validateUrl('not-a-url');
      expect(result.valid).toBe(false);
    });

    it('should reject empty URL', () => {
      const result = Validator.validateUrl('');
      expect(result.valid).toBe(false);
    });
  });
});