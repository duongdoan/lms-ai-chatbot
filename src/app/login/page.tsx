'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-viettel text-xl font-bold text-white shadow-lg shadow-viettel/25">
            L
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Trợ lý học tập nội bộ
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Đăng nhập để sử dụng trợ lý học tập
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
              autoFocus
              className="w-full rounded-xl border border-viettel-border bg-viettel-card px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-neutral-400 focus:border-viettel focus:ring-2 focus:ring-viettel/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              className="w-full rounded-xl border border-viettel-border bg-viettel-card px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-neutral-400 focus:border-viettel focus:ring-2 focus:ring-viettel/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-viettel py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-viettel-hover disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Hệ thống đào tạo nội bộ
        </p>
      </div>
    </div>
  );
}
