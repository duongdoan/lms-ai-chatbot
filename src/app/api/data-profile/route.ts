import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  buildProfileChatUi,
  DATA_PROFILE_COOKIE,
  isValidDataProfileId,
  listProfileSummaries,
  resolveDataProfileFromCookie,
} from '@/lib/lms-data';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET() {
  const jar = await cookies();
  const active = resolveDataProfileFromCookie(jar.get(DATA_PROFILE_COOKIE)?.value);
  const profiles = listProfileSummaries();
  const ui = buildProfileChatUi(active);
  return NextResponse.json({ active, profiles, ui });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload không hợp lệ' }, { status: 400 });
  }

  const profile =
    typeof (body as { profile?: string })?.profile === 'string'
      ? (body as { profile: string }).profile.trim()
      : '';

  if (!isValidDataProfileId(profile)) {
    return NextResponse.json({ error: 'Bộ dữ liệu không hợp lệ' }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(DATA_PROFILE_COOKIE, profile, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  const ui = buildProfileChatUi(profile);
  return NextResponse.json({ ok: true, active: profile, ui });
}
