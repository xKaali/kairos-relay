import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined && { details }),
    },
    { status }
  )
}
