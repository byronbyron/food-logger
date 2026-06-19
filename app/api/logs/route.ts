import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadOrInitData, saveData } from '@/lib/drive';
import { DriveData } from '@/types';

// Simple in-memory cache of fileId per access token, to avoid a Drive
// search call on every request. This resets on cold starts, which is fine —
// it just falls back to a search.
const fileIdCache = new Map<string, string>();

export async function GET() {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const cached = fileIdCache.get(session.accessToken);
    const { data, fileId } = await loadOrInitData(session.accessToken, cached);
    fileIdCache.set(session.accessToken, fileId);
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/logs error', err);
    return NextResponse.json({ error: 'Failed to load data from Drive' }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: DriveData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const cached = fileIdCache.get(session.accessToken);
    const { fileId } = await loadOrInitData(session.accessToken, cached);
    fileIdCache.set(session.accessToken, fileId);
    await saveData(session.accessToken, fileId, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/logs error', err);
    return NextResponse.json({ error: 'Failed to save data to Drive' }, { status: 502 });
  }
}
