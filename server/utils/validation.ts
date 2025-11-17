import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import logger from './logger';

/**
 * Validates request data against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param source Where to get the data from (body, query, params)
 * @returns Express middleware function
 */
export function validateRequest<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = await schema.parseAsync(data);
      
      // Replace the original data with the validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        
        logger.warn('Validation error', {
          path: req.path,
          source,
          errors: error.errors,
        });
        
        return res.status(400).json({
          error: 'Validation failed',
          details: validationError.details,
          message: validationError.message,
          timestamp: new Date().toISOString(),
        });
      }
      
      logger.error('Unexpected validation error', {
        path: req.path,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return res.status(500).json({
        error: 'Server error during validation',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Validates IDs in requests to ensure they are valid format
 */
export function validateId(idParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[idParam];
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      logger.warn('Invalid ID format', {
        path: req.path,
        id,
        paramName: idParam,
      });
      
      return res.status(400).json({
        error: `Invalid ${idParam}`,
        details: 'ID must be a non-empty string',
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
}

/**
 * Handles async route errors to avoid try/catch in every route
 * 
 * @param fn The async route handler function
 * @returns Express middleware function with error handling
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}