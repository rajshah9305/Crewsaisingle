import logger from '../utils/logger';

const MAX_RESULT_SIZE = 1024 * 1024; // 1MB
const MAX_RESULT_CHARS = 100000; // 100K characters

export interface ValidationResult {
  valid: boolean;
  data: string;
  warning?: string;
  truncated?: boolean;
}

/**
 * Result Validator Service
 * Validates and truncates execution results to prevent storage issues
 */
export class ResultValidator {
  /**
   * Validate and truncate result if necessary
   */
  static validateAndTruncate(result: string | null | undefined): ValidationResult {
    if (!result) {
      return { valid: true, data: '', warning: 'Empty result' };
    }

    const resultSize = Buffer.byteLength(result, 'utf8');
    const resultChars = result.length;

    // Check size
    if (resultSize > MAX_RESULT_SIZE) {
      const truncated = result.substring(0, MAX_RESULT_CHARS);
      logger.warn('Result truncated due to size', {
        originalSize: resultSize,
        maxAllowed: MAX_RESULT_SIZE,
        truncatedChars: MAX_RESULT_CHARS
      });
      return {
        valid: true,
        data: truncated + '\n[TRUNCATED: Result exceeded size limit]',
        warning: `Result truncated from ${resultChars} to ${MAX_RESULT_CHARS} characters`,
        truncated: true
      };
    }

    // Check character count
    if (resultChars > MAX_RESULT_CHARS) {
      const truncated = result.substring(0, MAX_RESULT_CHARS);
      logger.warn('Result truncated due to length', {
        originalChars: resultChars,
        maxAllowed: MAX_RESULT_CHARS
      });
      return {
        valid: true,
        data: truncated + '\n[TRUNCATED: Result exceeded length limit]',
        warning: `Result truncated from ${resultChars} to ${MAX_RESULT_CHARS} characters`,
        truncated: true
      };
    }

    return { valid: true, data: result };
  }

  /**
   * Get result statistics
   */
  static getResultStats(result: string) {
    return {
      characters: result.length,
      bytes: Buffer.byteLength(result, 'utf8'),
      lines: result.split('\n').length,
      maxAllowed: {
        bytes: MAX_RESULT_SIZE,
        characters: MAX_RESULT_CHARS
      },
      exceededLimits: {
        sizeExceeded: Buffer.byteLength(result, 'utf8') > MAX_RESULT_SIZE,
        charExceeded: result.length > MAX_RESULT_CHARS
      }
    };
  }
}
