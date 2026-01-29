import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponseBuilder } from './api-response';

export interface ValidatedRequest<T> extends NextRequest {
  validatedData: T;
}

export function withValidation<T>(schema: ZodSchema<T>) {
  return function (handler: (req: ValidatedRequest<T>) => Promise<Response>) {
    return async function (req: NextRequest): Promise<Response> {
      try {
        let data: unknown;

        if (req.method === 'GET') {
          const url = new URL(req.url);
          data = Object.fromEntries(url.searchParams);
        } else {
          data = await req.json();
        }

        const validatedData = schema.parse(data);
        const validatedRequest = Object.assign(req, { validatedData });

        return await handler(validatedRequest);
      } catch (error) {
        if (error instanceof ZodError) {
          return ApiResponseBuilder.validationError(error);
        }

        console.error('Validation middleware error:', error);
        return ApiResponseBuilder.serverError('Failed to process request');
      }
    };
  };
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async function (req: NextRequest): Promise<Response> {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        return ApiResponseBuilder.serverError(error.message);
      }

      return ApiResponseBuilder.serverError('An unexpected error occurred');
    }
  };
}