import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'vna_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

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
