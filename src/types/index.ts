export interface PasswordEntry {
  id: string;
  domain: string;
  fullUrl: string;
  username: string;
  password: string;
  createdAt: number;
  lastUsed: number;
  useCount: number;
  notes: string;
  groupId?: string;
  tags: string[];
}

export interface PasswordGroup {
  id: string;
  name: string;
  color: string;
  domains: string[];
}

export interface ExtensionSettings {
  masterPasswordHash: string;
  autoFillEnabled: boolean;
  autoLockTimeout: number;
  biometricEnabled: boolean;
  theme: 'light' | 'dark';
  encryptionKey?: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export interface Message {
  type: string;
  payload?: any;
  error?: string;
}

export interface PasswordFillRequest {
  domain: string;
  username: string;
}

export interface PasswordSaveRequest {
  domain: string;
  fullUrl: string;
  username: string;
  password: string;
}