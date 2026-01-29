import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: ValidationError[];
  success: false;
  timestamp: string;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string, status = 200): NextResponse {
    const response: ApiResponse<T> = {
      data,
      success: true,
      timestamp: new Date().toISOString(),
      ...(message && { message })
    };

    return NextResponse.json(response, { status });
  }

  static error(
    error: string,
    status = 500,
    details?: ValidationError[]
  ): NextResponse {
    const response: ApiErrorResponse = {
      error,
      success: false,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    };

    return NextResponse.json(response, { status });
  }

  static validationError(zodError: ZodError): NextResponse {
    const details: ValidationError[] = zodError.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return this.error('Validation failed', 400, details);
  }

  static notFound(resource = 'Resource'): NextResponse {
    return this.error(`${resource} not found`, 404);
  }

  static unauthorized(message = 'Unauthorized'): NextResponse {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden'): NextResponse {
    return this.error(message, 403);
  }

  static conflict(message = 'Conflict'): NextResponse {
    return this.error(message, 409);
  }

  static serverError(message = 'Internal server error'): NextResponse {
    return this.error(message, 500);
  }
}