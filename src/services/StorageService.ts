import { PasswordEntry, ExtensionSettings, EncryptedData } from '../types';
import { CryptoService } from './CryptoService';
import { DomainService } from './DomainService';

export class StorageService {
  private static readonly PASSWORDS_KEY = 'passwords';
  private static readonly SETTINGS_KEY = 'settings';
  private static readonly GROUPS_KEY = 'groups';
  private static readonly MASTER_PASSWORD_VERIFIED_KEY = 'masterPasswordVerified';

  static async getPasswords(masterPassword: string): Promise<PasswordEntry[]> {
    const result = await chrome.storage.local.get(this.PASSWORDS_KEY);
    const encryptedData = result[this.PASSWORDS_KEY] as EncryptedData;

    if (!encryptedData) {
      return [];
    }

    try {
      const decryptedData = await CryptoService.decrypt(encryptedData, masterPassword);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt passwords:', error);
      throw new Error('Invalid master password');
    }
  }

  static async savePasswords(passwords: PasswordEntry[], masterPassword: string): Promise<void> {
    // console.log('savePasswords - Saved passwords:', passwords);
    const encryptedData = await CryptoService.encrypt(JSON.stringify(passwords), masterPassword);
    await chrome.storage.local.set({ [this.PASSWORDS_KEY]: encryptedData });
    // console.log('savePasswords - Encrypted data:', encryptedData);
  }

  static async addPassword(entry: PasswordEntry, masterPassword: string): Promise<void> {
    const passwords = await this.getPasswords(masterPassword);
    passwords.push(entry);
    await this.savePasswords(passwords, masterPassword);
  }

  static async updatePassword(entry: PasswordEntry, masterPassword: string): Promise<void> {
    const passwords = await this.getPasswords(masterPassword);
    const index = passwords.findIndex(p => p.id === entry.id);
    if (index !== -1) {
      passwords[index] = entry;
      await this.savePasswords(passwords, masterPassword);
    }
  }

  static async deletePassword(id: string, masterPassword: string): Promise<void> {
    const passwords = await this.getPasswords(masterPassword);
    const filtered = passwords.filter(p => p.id !== id);
    await this.savePasswords(filtered, masterPassword);
  }

  static async getPasswordByDomain(domain: string, masterPassword: string): Promise<PasswordEntry[]> {
    const passwords = await this.getPasswords(masterPassword);
    const normalizedDomain = DomainService.normalizeDomain(domain);
    const baseDomain = DomainService.getBaseDomain(normalizedDomain);
    
    // console.log('getPasswordByDomain - Input domain:', domain);
    // console.log('getPasswordByDomain - Normalized domain:', normalizedDomain);
    // console.log('getPasswordByDomain - Base domain:', baseDomain);
    
    return passwords.filter(p => {
      const normalizedPasswordDomain = DomainService.normalizeDomain(p.domain);
      const passwordBaseDomain = DomainService.getBaseDomain(normalizedPasswordDomain);
      
      // 严格匹配或基础域名匹配
      const isExactMatch = normalizedPasswordDomain === normalizedDomain;
      const isBaseDomainMatch = passwordBaseDomain === baseDomain;
      
      // console.log('getPasswordByDomain - Checking password domain:', p.domain);
      // console.log('getPasswordByDomain - Normalized password domain:', normalizedPasswordDomain);
      // console.log('getPasswordByDomain - Password base domain:', passwordBaseDomain);
      // console.log('getPasswordByDomain - Exact match:', isExactMatch);
      // console.log('getPasswordByDomain - Base domain match:', isBaseDomainMatch);
      
      return isExactMatch && isBaseDomainMatch;
    });
  }

  static async getPasswordByDomainAndUsername(domain: string, username: string, masterPassword: string): Promise<PasswordEntry | undefined> {
    const passwords = await this.getPasswords(masterPassword);
    const normalizedDomain = DomainService.normalizeDomain(domain);
    const baseDomain = DomainService.getBaseDomain(normalizedDomain);
    
    // console.log('getPasswordByDomainAndUsername - Input domain:', domain);
    // console.log('getPasswordByDomainAndUsername - Normalized domain:', normalizedDomain);
    // console.log('getPasswordByDomainAndUsername - Base domain:', baseDomain);
    // console.log('getPasswordByDomainAndUsername - Username:', username);
    
    return passwords.find(p => {
      const normalizedPasswordDomain = DomainService.normalizeDomain(p.domain);
      const passwordBaseDomain = DomainService.getBaseDomain(normalizedPasswordDomain);
      
      // 严格匹配或基础域名匹配，并且用户名匹配
      const isDomainMatch = normalizedPasswordDomain === normalizedDomain || passwordBaseDomain === baseDomain;
      const isUsernameMatch = p.username === username;
      
      // console.log('getPasswordByDomainAndUsername - Checking password domain:', p.domain);
      // console.log('getPasswordByDomainAndUsername - Checking password username:', p.username);
      // console.log('getPasswordByDomainAndUsername - Domain match:', isDomainMatch);
      // console.log('getPasswordByDomainAndUsername - Username match:', isUsernameMatch);
      
      return isDomainMatch && isUsernameMatch;
    });
  }

  static async getSettings(): Promise<ExtensionSettings> {
    const result = await chrome.storage.local.get(this.SETTINGS_KEY);
    return result[this.SETTINGS_KEY] || {
      masterPasswordHash: '',
      autoFillEnabled: true,
      autoLockTimeout: 300,
      biometricEnabled: false,
      theme: 'light',
    };
  }

  static async saveSettings(settings: ExtensionSettings): Promise<void> {
    await chrome.storage.local.set({ [this.SETTINGS_KEY]: settings });
  }

  static async isMasterPasswordSet(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.masterPasswordHash !== '';
  }

  static async verifyMasterPassword(password: string): Promise<boolean> {
    const settings = await this.getSettings();
    const hash = await CryptoService.hashPassword(password);
    return hash === settings.masterPasswordHash;
  }

  static async setMasterPassword(password: string): Promise<void> {
    const hash = await CryptoService.hashPassword(password);
    const settings = await this.getSettings();
    settings.masterPasswordHash = hash;
    await this.saveSettings(settings);
  }

  static async setMasterPasswordVerified(verified: boolean): Promise<void> {
    await chrome.storage.local.set({ [this.MASTER_PASSWORD_VERIFIED_KEY]: verified });
  }

  static async isMasterPasswordVerified(): Promise<boolean> {
    const result = await chrome.storage.local.get(this.MASTER_PASSWORD_VERIFIED_KEY);
    return result[this.MASTER_PASSWORD_VERIFIED_KEY] || false;
  }

  static async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
  }

  static async exportData(masterPassword: string): Promise<string> {
    const passwords = await this.getPasswords(masterPassword);
    const settings = await this.getSettings();
    const exportedAt = Date.now();
    
    // 加密密码字段
    const encryptedPasswords = await Promise.all(passwords.map(async (entry) => {
      try {
        const key = await CryptoService.generateCBCKey(settings.masterPasswordHash);
        const iv = CryptoService.generateCBCIV(exportedAt);
        const encryptedPassword = await CryptoService.encryptWithCBC(entry.password, key, iv);
        return {
          ...entry,
          password: encryptedPassword,
          __encrypted: true
        };
      } catch (error) {
        console.error('Failed to encrypt password:', error);
        return entry;
      }
    }));
    
    const data = {
      passwords: encryptedPasswords,
      settings,
      exportedAt,
      version: '1.0'
    };
    console.log('exportData - Exporting data:', data);
    return JSON.stringify(data);
  }

  static async importData(data: string, masterPassword: string): Promise<void> {
    const parsed = JSON.parse(data);
    // console.log('importData - Importing data:', parsed);
    
    if (parsed.passwords) {
      // 解密密码字段
      const decryptedPasswords = await Promise.all(parsed.passwords.map(async (entry: any) => {
        try {
          if (entry.__encrypted && parsed.exportedAt && parsed.settings?.masterPasswordHash) {
            const key = await CryptoService.generateCBCKey(parsed.settings.masterPasswordHash);
            const iv = CryptoService.generateCBCIV(parsed.exportedAt);
            const decryptedPassword = await CryptoService.decryptWithCBC(entry.password, key, iv);
            const { __encrypted, ...decryptedEntry } = entry;
            return {
              ...decryptedEntry,
              password: decryptedPassword
            };
          }
          return entry;
        } catch (error) {
          console.error('Failed to decrypt password:', error);
          throw new Error('Failed to decrypt imported passwords. Please check your master password.');
        }
      }));
      await this.savePasswords(decryptedPasswords, masterPassword);
    }
    
    if (parsed.settings) {
      await this.saveSettings(parsed.settings);
    }
  }
}