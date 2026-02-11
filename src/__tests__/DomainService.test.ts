import { DomainService } from '../services/DomainService';

describe('DomainService', () => {
  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(DomainService.extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(DomainService.extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com');
    });

    it('should handle invalid URLs', () => {
      expect(DomainService.extractDomain('not-a-url')).toBe('');
    });
  });

  describe('extractFullUrl', () => {
    it('should extract full URL with path', () => {
      expect(DomainService.extractFullUrl('https://www.example.com/path/to/page')).toBe('https://www.example.com/path/to/page');
    });

    it('should handle URLs without path', () => {
      expect(DomainService.extractFullUrl('https://www.example.com')).toBe('https://www.example.com/');
    });
  });

  describe('isSameDomain', () => {
    it('should return true for same domains', () => {
      expect(DomainService.isSameDomain('https://www.example.com/path1', 'https://www.example.com/path2')).toBe(true);
    });

    it('should return false for different domains', () => {
      expect(DomainService.isSameDomain('https://www.example.com', 'https://www.other.com')).toBe(false);
    });
  });

  describe('getSubdomain', () => {
    it('should extract subdomain', () => {
      expect(DomainService.getSubdomain('sub.example.com')).toBe('sub');
      expect(DomainService.getSubdomain('deep.sub.example.com')).toBe('deep.sub');
    });

    it('should return empty string for no subdomain', () => {
      expect(DomainService.getSubdomain('example.com')).toBe('');
    });
  });

  describe('getBaseDomain', () => {
    it('should extract base domain', () => {
      expect(DomainService.getBaseDomain('sub.example.com')).toBe('example.com');
      expect(DomainService.getBaseDomain('example.com')).toBe('example.com');
    });
  });

  describe('normalizeDomain', () => {
    it('should convert to lowercase', () => {
      expect(DomainService.normalizeDomain('EXAMPLE.COM')).toBe('example.com');
    });

    it('should trim whitespace', () => {
      expect(DomainService.normalizeDomain('  example.com  ')).toBe('example.com');
    });
  });

  describe('isValidDomain', () => {
    it('should validate correct domains', () => {
      expect(DomainService.isValidDomain('example.com')).toBe(true);
      expect(DomainService.isValidDomain('sub.example.com')).toBe(true);
    });

    it('should reject invalid domains', () => {
      expect(DomainService.isValidDomain('')).toBe(false);
      expect(DomainService.isValidDomain('not a domain')).toBe(false);
    });
  });

  describe('getDomainKey', () => {
    it('should create unique key for domain and username', () => {
      const key = DomainService.getDomainKey('example.com', 'user');
      expect(key).toBe('example.com:user');
    });
  });
});