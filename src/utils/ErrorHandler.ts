export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class CryptoError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CRYPTO_ERROR', details);
    this.name = 'CryptoError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ErrorHandler {
  private static errorLog: Array<{ error: Error; timestamp: number; context?: any }> = [];

  static handleError(error: Error, context?: any): void {
    console.error('Error occurred:', error, context);

    this.errorLog.push({
      error,
      timestamp: Date.now(),
      context,
    });

    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    if (error instanceof AppError) {
      this.handleAppError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private static handleAppError(error: AppError): void {
    switch (error.code) {
      case 'CRYPTO_ERROR':
        console.error('Crypto operation failed:', error.message);
        break;
      case 'STORAGE_ERROR':
        console.error('Storage operation failed:', error.message);
        break;
      case 'VALIDATION_ERROR':
        console.error('Validation failed:', error.message);
        break;
      case 'NETWORK_ERROR':
        console.error('Network operation failed:', error.message);
        break;
      default:
        console.error('Application error:', error.message);
    }
  }

  private static handleUnknownError(error: Error): void {
    console.error('Unknown error:', error.message, error.stack);
  }

  static getErrorLog(): Array<{ error: Error; timestamp: number; context?: any }> {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static async wrapAsync<T>(
    fn: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        this.handleError(error);
        throw new AppError(errorMessage, 'ASYNC_ERROR', { originalError: error.message });
      }
      throw new AppError(errorMessage, 'ASYNC_ERROR', { originalError: error });
    }
  }
}

export class Validator {
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateMasterPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Master password is required');
    } else {
      if (password.length < 12) {
        errors.push('Master password must be at least 12 characters long');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Master password must contain at least one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Master password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Master password must contain at least one number');
      }
      if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('Master password must contain at least one special character');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateDomain(domain: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!domain) {
      errors.push('Domain is required');
    } else {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
      if (!domainRegex.test(domain)) {
        errors.push('Invalid domain format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username) {
      errors.push('Username is required');
    } else {
      if (username.length < 1) {
        errors.push('Username cannot be empty');
      }
      if (username.length > 256) {
        errors.push('Username is too long (max 256 characters)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateUrl(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(url);
      } catch {
        errors.push('Invalid URL format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class RetryHandler {
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Attempt ${attempt} failed:`, lastError.message);

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }
}