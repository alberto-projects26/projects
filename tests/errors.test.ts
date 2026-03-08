import { describe, it, expect } from 'vitest';
import {
  AppError,
  ConfigError,
  ConnectionError,
  NotFoundError,
  httpStatusForError,
  errorResponseBody,
} from '@/lib/errors';

describe('Error hierarchy', () => {
  it('AppError carries code and message', () => {
    const err = new AppError('ADAPTER_ERROR', 'something broke');
    expect(err.code).toBe('ADAPTER_ERROR');
    expect(err.message).toBe('something broke');
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
  });

  it('ConfigError has CONFIG_INVALID code', () => {
    const err = new ConfigError('bad config');
    expect(err.code).toBe('CONFIG_INVALID');
    expect(err.name).toBe('ConfigError');
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it('ConnectionError has CONNECTION_FAILED code', () => {
    const err = new ConnectionError('timeout');
    expect(err.code).toBe('CONNECTION_FAILED');
    expect(err.name).toBe('ConnectionError');
    expect(err).toBeInstanceOf(AppError);
  });

  it('NotFoundError formats resource and id', () => {
    const err = new NotFoundError('Agent', 'agent:123');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Agent "agent:123" not found');
    expect(err.name).toBe('NotFoundError');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('httpStatusForError', () => {
  it('maps CONFIG_INVALID to 500', () => {
    expect(httpStatusForError(new ConfigError('x'))).toBe(500);
  });

  it('maps CONNECTION_FAILED to 502', () => {
    expect(httpStatusForError(new ConnectionError('x'))).toBe(502);
  });

  it('maps NOT_FOUND to 404', () => {
    expect(httpStatusForError(new NotFoundError('X', 'y'))).toBe(404);
  });

  it('maps ADAPTER_ERROR to 502', () => {
    expect(httpStatusForError(new AppError('ADAPTER_ERROR', 'x'))).toBe(502);
  });
});

describe('errorResponseBody', () => {
  it('returns structured error object', () => {
    const err = new ConfigError('missing url');
    const body = errorResponseBody(err);
    expect(body).toEqual({
      error: {
        code: 'CONFIG_INVALID',
        message: 'missing url',
      },
    });
  });
});
