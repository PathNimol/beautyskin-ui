import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const formData = await req.formData();

  const res = await fetch(`${process.env.API_URL}/upload/avatar`, {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Upload failed' }, { status: res.status });
  }

  return NextResponse.json(data);
}
