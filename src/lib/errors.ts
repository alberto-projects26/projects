/**
 * Typed Error Hierarchy
 *
 * Framework-agnostic error classes with stable codes.
 * Route handlers map these to HTTP status codes.
 */

export type ErrorCode =
  | 'CONFIG_INVALID'
  | 'CONNECTION_FAILED'
  | 'NOT_FOUND'
  | 'ADAPTER_ERROR';

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super('CONFIG_INVALID', message);
    this.name = 'ConfigError';
  }
}

export class ConnectionError extends AppError {
  constructor(message: string) {
    super('CONNECTION_FAILED', message);
    this.name = 'ConnectionError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Map an AppError code to an HTTP status code.
 */
export function httpStatusForError(error: AppError): number {
  switch (error.code) {
    case 'CONFIG_INVALID':
      return 500;
    case 'CONNECTION_FAILED':
      return 502;
    case 'NOT_FOUND':
      return 404;
    case 'ADAPTER_ERROR':
      return 502;
  }
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

/**
 * Build a JSON-serializable error response body from an AppError.
 */
export function errorResponseBody(error: AppError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
  };
}
