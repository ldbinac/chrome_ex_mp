export class PasswordGeneratorService {
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly NUMBERS = '0123456789';
  private static readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  static generate(length: number = 16, options: {
    lowercase?: boolean;
    uppercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  } = {}): string {
    const {
      lowercase = true,
      uppercase = true,
      numbers = true,
      symbols = true,
    } = options;

    let charset = '';
    if (lowercase) charset += this.LOWERCASE;
    if (uppercase) charset += this.UPPERCASE;
    if (numbers) charset += this.NUMBERS;
    if (symbols) charset += this.SYMBOLS;

    if (charset === '') {
      charset = this.LOWERCASE + this.NUMBERS;
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  static checkStrength(password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else suggestions.push('Consider using 12 or more characters');

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else suggestions.push('Add special characters');

    if (password.length >= 16) score += 1;

    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    if (score >= 6) level = 'strong';
    else if (score >= 4) level = 'good';
    else if (score >= 2) level = 'fair';

    return { score, level, suggestions };
  }
}