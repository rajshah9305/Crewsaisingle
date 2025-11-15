import { validateRequest, validateId, asyncHandler } from '../../server/utils/validation';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

describe('Validation Utilities', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  
  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    nextFunction = jest.fn();
  });
  
  describe('validateRequest', () => {
    test('should call next() when validation passes', async () => {
      const schema: ZodSchema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      mockRequest.body = {
        name: 'Test',
        age: 30,
      };
      
      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
    
    test('should return 400 when validation fails', async () => {
      const schema: ZodSchema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      mockRequest.body = {
        name: 'Test',
        age: 'thirty', // Invalid type
      };
      
      const middleware = validateRequest(schema);
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
        })
      );
    });
    
    test('should validate data from specified source', async () => {
      const schema: ZodSchema = z.object({
        id: z.string(),
      });
      
      mockRequest.query = {
        id: '123',
      };
      
      const middleware = validateRequest(schema, 'query');
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('validateId', () => {
    test('should call next() when id is valid', () => {
      mockRequest.params = {
        id: 'valid-id',
      };
      
      const middleware = validateId();
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
    
    test('should return 400 when id is invalid', () => {
      mockRequest.params = {
        id: '',
      };
      
      const middleware = validateId();
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid id',
        })
      );
    });
    
    test('should validate custom id parameter name', () => {
      mockRequest.params = {
        agentId: 'valid-id',
      };
      
      const middleware = validateId('agentId');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('asyncHandler', () => {
    test('should pass the result to next() when Promise resolves', async () => {
      const handler = jest.fn().mockResolvedValue('result');
      const middleware = asyncHandler(handler);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(handler).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).not.toHaveBeenCalled(); // next is not called on success
    });
    
    test('should pass error to next() when Promise rejects', async () => {
      const error = new Error('Test error');
      const handler = jest.fn().mockRejectedValue(error);
      const middleware = asyncHandler(handler);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(handler).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});