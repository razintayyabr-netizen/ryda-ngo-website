import { NextResponse } from 'next/server';
import { isValidWriterToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token || request.headers.get('x-writer-token');

    if (isValidWriterToken(token)) {
      return NextResponse.json({
        success: true,
        valid: true,
        message: 'Writer token authenticated successfully.'
      });
    }

    return NextResponse.json(
      { success: false, valid: false, error: 'Invalid access token. Please check your writer password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ success: false, error: 'Authentication check failed' }, { status: 500 });
  }
}
