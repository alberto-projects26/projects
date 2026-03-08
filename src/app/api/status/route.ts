/**
 * GET /api/status
 *
 * Returns the current OpenClaw adapter connection status.
 * This is the server-side boundary — clients never talk to the
 * gateway directly.
 */

import { NextResponse } from 'next/server';
import {
  connectOpenClawAdapter,
  getAdapterMode,
  _resetAdapterCache,
} from '@/lib/server/openclaw';
import {
  AppError,
  httpStatusForError,
  errorResponseBody,
  type ErrorResponse,
} from '@/lib/errors';

export interface StatusResponse {
  connected: boolean;
  lastSync: string | null;
  error: string | null;
  mode: string;
}

export async function GET(): Promise<
  NextResponse<StatusResponse | ErrorResponse>
> {
  let mode: string;
  try {
    mode = getAdapterMode();
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(errorResponseBody(err), {
        status: httpStatusForError(err),
      });
    }
    return NextResponse.json(
      errorResponseBody(
        new AppError('CONFIG_INVALID', 'Failed to load configuration'),
      ),
      { status: 500 },
    );
  }

  try {
    const adapter = await connectOpenClawAdapter();
    const status = adapter.getStatus();

    return NextResponse.json({
      connected: status.connected,
      lastSync: status.lastSync?.toISOString() ?? null,
      error: status.error,
      mode,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(errorResponseBody(err), {
        status: httpStatusForError(err),
      });
    }
    return NextResponse.json(
      errorResponseBody(
        new AppError('ADAPTER_ERROR', 'Unexpected adapter failure'),
      ),
      { status: 502 },
    );
  }
}

// Re-export for test teardown
export { _resetAdapterCache };
