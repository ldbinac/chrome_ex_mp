import { EncryptedData } from '../types';

export class CryptoService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly CBC_ALGORITHM = 'AES-CBC';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly CBC_IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 16;
  private static readonly PBKDF2_ITERATIONS = 100000;

  static async generateKey(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = this.base64ToArrayBuffer(salt);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, password: string): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const key = await this.generateKey(password, this.arrayBufferToBase64(salt.buffer));

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: iv as BufferSource },
      key,
      dataBuffer
    );

    return {
      data: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer),
      salt: this.arrayBufferToBase64(salt.buffer),
    };
  }

  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const key = await this.generateKey(password, encryptedData.salt);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: iv as BufferSource },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  static async encryptWithCBC(data: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: this.CBC_ALGORITHM, iv: iv as BufferSource },
      key,
      dataBuffer
    );

    return this.arrayBufferToBase64(encryptedBuffer);
  }

  static async decryptWithCBC(encryptedData: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: this.CBC_ALGORITHM, iv: iv as BufferSource },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  static async generateCBCKey(masterPasswordHash: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(masterPasswordHash);
    
    // 使用 SHA-256 哈希确保密钥材料长度为 32 字节（256 位）
    const keyHash = await crypto.subtle.digest('SHA-256', keyMaterial);

    return crypto.subtle.importKey(
      'raw',
      keyHash,
      { name: this.CBC_ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static generateCBCIV(timestamp: number): Uint8Array {
    const iv = new Uint8Array(this.CBC_IV_LENGTH);
    const timestampBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      timestampBytes[i] = (timestamp >> (i * 8)) & 0xff;
    }
    iv.set(timestampBytes, 0);
    return iv;
  }

  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer as ArrayBuffer;
  }
}