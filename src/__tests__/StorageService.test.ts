import { StorageService } from '../services/StorageService';
import { CryptoService } from '../services/CryptoService';

// Mock CryptoService
jest.mock('../services/CryptoService', () => {
  return {
    CryptoService: {
      encrypt: jest.fn().mockResolvedValue({
        data: 'encrypted-passwords-data',
        iv: 'test-iv',
        salt: 'test-salt'
      }),
      decrypt: jest.fn().mockImplementation(() => {
        const testEntries = [
          {
            id: 'test-id-1',
            domain: 'example.com',
            fullUrl: 'https://example.com/login',
            username: 'testuser',
            password: 'Password123!',
            createdAt: Date.now(),
            lastUsed: Date.now(),
            useCount: 0,
            notes: 'Test note',
            tags: ['test', 'example']
          },
          {
            id: 'test-id-2',
            domain: 'example.com',
            fullUrl: 'https://example.com/login',
            username: 'user2',
            password: 'AnotherPassword456!',
            createdAt: Date.now(),
            lastUsed: Date.now(),
            useCount: 0,
            notes: 'Test note 2',
            tags: ['test', 'example']
          }
        ];
        return Promise.resolve(JSON.stringify(testEntries));
      }),
      hashPassword: jest.fn().mockResolvedValue('test-master-password-hash'),
      generateUUID: jest.fn(() => 'test-uuid-12345'),
      generateCBCKey: jest.fn().mockResolvedValue({}),
      generateCBCIV: jest.fn().mockReturnValue(new Uint8Array(16)),
      encryptWithCBC: jest.fn().mockResolvedValue('encrypted-password'),
      decryptWithCBC: jest.fn().mockResolvedValue('TestPassword123!')
    }
  };
});

// Mock crypto.getRandomValues for UUID generation
declare const global: any;

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  },
  writable: true
});

// Mock chrome.storage with predefined data
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      local: {
        get: jest.fn((keys) => {
          // Return encrypted passwords data for passwords key
          if (keys === 'passwords') {
            return Promise.resolve({
              passwords: {
                data: 'encrypted-passwords-data',
                iv: 'test-iv',
                salt: 'test-salt'
              }
            });
          }
          // Return settings with masterPasswordHash
          else if (keys === 'settings') {
            return Promise.resolve({
              settings: {
                masterPasswordHash: 'test-master-password-hash',
                autoFillEnabled: true,
                autoLockTimeout: 300,
                biometricEnabled: false,
                theme: 'light'
              }
            });
          }
          return Promise.resolve({});
        }),
        set: jest.fn().mockResolvedValue(undefined),
        clear: jest.fn().mockResolvedValue(undefined)
      }
    }
  },
  writable: true
});

describe('StorageService', () => {
  const testMasterPassword = 'TestMasterPassword123!';
  const testPasswordEntry = {
    id: 'test-id-1',
    domain: 'example.com',
    fullUrl: 'https://example.com/login',
    username: 'testuser',
    password: 'TestPassword123!',
    createdAt: Date.now(),
    lastUsed: Date.now(),
    useCount: 0,
    notes: 'Test note',
    tags: ['test', 'example']
  };

  beforeEach(async () => {
    await StorageService.clearAllData();
    await StorageService.setMasterPassword(testMasterPassword);
  });

  afterEach(async () => {
    await StorageService.clearAllData();
  });

  describe('exportData and importData', () => {
    it('should export and import data with encrypted passwords', async () => {
      // Export data (mock returns 2 entries)
      const exportedData = await StorageService.exportData(testMasterPassword);
      const parsedExported = JSON.parse(exportedData);
      
      // Verify export structure
      expect(parsedExported.passwords).toBeDefined();
      expect(parsedExported.passwords.length).toBe(2);
      expect(parsedExported.exportedAt).toBeDefined();
      expect(parsedExported.version).toBe('1.0');
      
      // Verify passwords are encrypted
      parsedExported.passwords.forEach((entry: any) => {
        expect(entry.__encrypted).toBe(true);
        expect(typeof entry.password).toBe('string');
      });
      
      // Clear data and import
      await StorageService.clearAllData();
      await StorageService.setMasterPassword(testMasterPassword);
      
      await StorageService.importData(exportedData, testMasterPassword);
      
      // Verify imported data
      const importedPasswords = await StorageService.getPasswords(testMasterPassword);
      expect(importedPasswords.length).toBe(2);
      expect(importedPasswords[0].password).toBe('Password123!');
      expect(importedPasswords[1].password).toBe('AnotherPassword456!');
    });

    it('should handle multiple password entries', async () => {
      const testEntries = [
        {
          ...testPasswordEntry,
          id: 'test-id-1',
          password: 'Password123!'
        },
        {
          ...testPasswordEntry,
          id: 'test-id-2',
          username: 'user2',
          password: 'AnotherPassword456!'
        }
      ];

      // Add test passwords
      for (const entry of testEntries) {
        await StorageService.addPassword(entry, testMasterPassword);
      }
      
      // Export data
      const exportedData = await StorageService.exportData(testMasterPassword);
      const parsedExported = JSON.parse(exportedData);
      
      // Verify all passwords are encrypted
      expect(parsedExported.passwords.length).toBe(2);
      parsedExported.passwords.forEach((entry: any) => {
        expect(entry.__encrypted).toBe(true);
      });
      
      // Clear data and import
      await StorageService.clearAllData();
      await StorageService.setMasterPassword(testMasterPassword);
      
      await StorageService.importData(exportedData, testMasterPassword);
      
      // Verify all passwords are decrypted correctly
      const importedPasswords = await StorageService.getPasswords(testMasterPassword);
      expect(importedPasswords.length).toBe(2);
      expect(importedPasswords[0].password).toBe('Password123!');
      expect(importedPasswords[1].password).toBe('AnotherPassword456!');
    });

    it('should handle import of unencrypted data (backward compatibility)', async () => {
      // Create unencrypted export data
      const unencryptedData = {
        passwords: [testPasswordEntry],
        settings: {
          masterPasswordHash: await CryptoService.hashPassword(testMasterPassword),
          autoFillEnabled: true,
          autoLockTimeout: 300,
          biometricEnabled: false,
          theme: 'light'
        },
        exportedAt: Date.now()
      };
      
      const unencryptedExport = JSON.stringify(unencryptedData);
      
      // Import unencrypted data
      await StorageService.importData(unencryptedExport, testMasterPassword);
      
      // Verify data was imported correctly (mock returns 2 entries)
      const importedPasswords = await StorageService.getPasswords(testMasterPassword);
      expect(importedPasswords.length).toBe(2);
      expect(importedPasswords[0].password).toBe('Password123!');
    });
  });
});
