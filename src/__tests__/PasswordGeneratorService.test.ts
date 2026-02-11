import { PasswordGeneratorService } from '../services/PasswordGeneratorService';

describe('PasswordGeneratorService', () => {
  describe('generate', () => {
    it('should generate password with default length', () => {
      const password = PasswordGeneratorService.generate();
      expect(password).toHaveLength(16);
    });

    it('should generate password with custom length', () => {
      const password = PasswordGeneratorService.generate(20);
      expect(password).toHaveLength(20);
    });

    it('should generate password with only lowercase', () => {
      const password = PasswordGeneratorService.generate(12, {
        lowercase: true,
        uppercase: false,
        numbers: false,
        symbols: false,
      });
      expect(password).toMatch(/^[a-z]+$/);
    });

    it('should generate password with only numbers', () => {
      const password = PasswordGeneratorService.generate(12, {
        lowercase: false,
        uppercase: false,
        numbers: true,
        symbols: false,
      });
      expect(password).toMatch(/^[0-9]+$/);
    });

    it('should generate unique passwords', () => {
      const password1 = PasswordGeneratorService.generate();
      const password2 = PasswordGeneratorService.generate();
      expect(password1).not.toBe(password2);
    });

    it('should fallback to lowercase and numbers when all options are false', () => {
      const password = PasswordGeneratorService.generate(12, {
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
      });
      expect(password).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('checkStrength', () => {
    it('should return weak for short password', () => {
      const result = PasswordGeneratorService.checkStrength('abc');
      expect(result.level).toBe('weak');
      expect(result.score).toBeLessThan(2);
    });

    it('should return strong for long complex password', () => {
      const result = PasswordGeneratorService.checkStrength('StrongP@ssw0rd123!');
      expect(result.level).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(6);
    });

    it('should provide suggestions for weak passwords', () => {
      const result = PasswordGeneratorService.checkStrength('abc');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions).toContain('Use at least 8 characters');
    });

    it('should give good score for password with letters and numbers', () => {
      const result = PasswordGeneratorService.checkStrength('Password123');
      expect(result.level).toBe('good');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should give fair score for password with only letters', () => {
      const result = PasswordGeneratorService.checkStrength('Password');
      expect(result.level).toBe('fair');
    });
  });
});