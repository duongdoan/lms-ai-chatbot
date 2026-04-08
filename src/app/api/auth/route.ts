import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'vna_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

function sessionUsername(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const colon = raw.indexOf(':');
    if (colon <= 0) return null;
    return raw.slice(0, colon);
  } catch {
    return null;
  }
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const username = sessionUsername(token);
  if (!username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ username });
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const validUser = process.env.LOGIN_USERNAME ?? 'admin';
  const validPass = process.env.LOGIN_PASSWORD ?? '123456';

  if (username !== validUser || password !== validPass) {
    return NextResponse.json(
      { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
      { status: 401 },
    );
  }

  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
