import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Authentication Service for API Key management
 * Handles generation, validation, and revocation of API keys
 */
export class AuthService {
  /**
   * Generate a new secure API key
   */
  static generateApiKey(): string {
    return `crewsai_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Hash an API key for secure storage
   */
  static hashApiKey(apiKey: string): string {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }

  /**
   * Validate an API key format
   */
  static isValidApiKeyFormat(apiKey: string): boolean {
    return apiKey.startsWith('crewsai_') && apiKey.length > 40;
  }

  /**
   * Extract API key from request headers
   */
  static extractApiKey(authHeader?: string): string | null {
    if (!authHeader) return null;

    // Support both "Bearer crewsai_..." and "crewsai_..."
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : authHeader;

    if (this.isValidApiKeyFormat(token)) {
      return token;
    }

    return null;
  }

  /**
   * Validate API key against its hash
   */
  static validateApiKey(apiKey: string, storedHash: string): boolean {
    const hash = this.hashApiKey(apiKey);
    return hash === storedHash;
  }

  /**
   * Check if API key is expired
   */
  static isExpired(expiresAt?: Date): boolean {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  }

  /**
   * Check if API key is revoked
   */
  static isRevoked(revokedAt?: Date): boolean {
    return revokedAt !== undefined && revokedAt !== null;
  }
}
