import { CryptoService } from '../services/CryptoService';

describe('CryptoService', () => {
  const testPassword = 'TestPassword123!';
  const testData = 'Secret data to encrypt';

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const encrypted = await CryptoService.encrypt(testData, testPassword);
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();

      const decrypted = await CryptoService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe(testData);
    });

    it('should produce different encrypted data for same input', async () => {
      const encrypted1 = await CryptoService.encrypt(testData, testPassword);
      const encrypted2 = await CryptoService.encrypt(testData, testPassword);

      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await CryptoService.encrypt(testData, testPassword);

      await expect(
        CryptoService.decrypt(encrypted, 'WrongPassword')
      ).rejects.toThrow();
    });
  });

  describe('hashPassword', () => {
    it('should generate consistent hash for same password', async () => {
      const hash1 = await CryptoService.hashPassword(testPassword);
      const hash2 = await CryptoService.hashPassword(testPassword);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await CryptoService.hashPassword(testPassword);
      const hash2 = await CryptoService.hashPassword('DifferentPassword');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateUUID', () => {
    it('should generate unique UUIDs', () => {
      const uuid1 = CryptoService.generateUUID();
      const uuid2 = CryptoService.generateUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});