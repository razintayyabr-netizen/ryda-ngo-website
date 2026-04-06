import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body.token;
    const valid = process.env.WRITER_TOKEN;

    if (!valid) {
      return NextResponse.json({ error: "WRITER_TOKEN env var not set." }, { status: 500 });
    }

    if (token === valid) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: false, error: "Invalid token." }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
