'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ProfileChatUi } from '@/lib/chat-ui';

type ProfileOption = { id: string; label: string };

type UserMenuProps = {
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
  /** Sau khi đổi bộ dữ liệu thành công — cập nhật header / lời chào / gợi ý. */
  onProfileChange?: (ui: ProfileChatUi) => void | Promise<void>;
};

function initialsFromUsername(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  if (t.length === 1) return t.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

export function UserMenu({
  onLogout,
  loggingOut,
  onProfileChange,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profileSwitching, setProfileSwitching] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const res = await fetch('/api/data-profile');
      if (!res.ok) return;
      const data = (await res.json()) as {
        active?: string;
        profiles?: ProfileOption[];
        ui?: ProfileChatUi;
      };
      if (Array.isArray(data.profiles)) setProfiles(data.profiles);
      if (typeof data.active === 'string') setActiveProfile(data.active);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/auth');
      if (!res.ok) return;
      const data = (await res.json()) as { username?: string };
      if (!cancelled && data.username) setUsername(data.username);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open) void loadProfiles();
  }, [open, loadProfiles]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  async function selectProfile(id: string) {
    if (id === activeProfile || profileSwitching) return;
    setProfileSwitching(id);
    try {
      const res = await fetch('/api/data-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: id }),
      });
      const data = (await res.json()) as { ui?: ProfileChatUi };
      if (res.ok && data.ui) {
        setActiveProfile(id);
        await Promise.resolve(onProfileChange?.(data.ui));
      }
    } finally {
      setProfileSwitching(null);
    }
  }

  const label = username ?? '…';

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loggingOut}
        className="flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 py-1 pl-1 pr-2 text-left transition-colors hover:bg-white/20 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu tài khoản"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-[11px] font-bold tracking-tight text-white ring-1 ring-white/20"
          aria-hidden
        >
          {username ? initialsFromUsername(username) : '·'}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-white/90 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,420px)] min-w-[260px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/20 bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          <div className="border-b border-neutral-100 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              Tài khoản
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900" title={label}>
              {label}
            </p>
          </div>

          <div className="border-b border-neutral-100 py-1">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              Bộ dữ liệu
            </p>
            {profilesLoading && profiles.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-500">Đang tải…</p>
            ) : profiles.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-500">Không có bộ dữ liệu.</p>
            ) : (
              profiles.map((p) => {
                const selected = activeProfile === p.id;
                const busy = profileSwitching === p.id;
                return (
                  <button
                    key={p.id}
                    role="menuitem"
                    type="button"
                    onClick={() => void selectProfile(p.id)}
                    disabled={!!profileSwitching}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                      selected
                        ? 'bg-viettel-soft text-viettel'
                        : 'text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current"
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.label}</span>
                      <span className="block truncate text-[11px] text-neutral-500">
                        {p.id}
                        {busy ? ' · Đang chuyển…' : ''}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4 shrink-0 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </button>
        </div>
      )}
    </div>
  );
}
