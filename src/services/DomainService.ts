export class DomainService {
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  }

  static extractFullUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  }

  static isSameDomain(url1: string, url2: string): boolean {
    const domain1 = this.extractDomain(url1);
    const domain2 = this.extractDomain(url2);
    return domain1 === domain2;
  }

  static getSubdomain(domain: string): string {
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(0, -2).join('.');
    }
    return '';
  }

  static getBaseDomain(domain: string): string {
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return domain;
  }

  static normalizeDomain(domain: string): string {
    return domain.toLowerCase().trim();
  }

  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }

  static getDomainKey(domain: string, username: string): string {
    return `${domain}:${username}`;
  }
}