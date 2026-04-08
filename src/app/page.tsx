'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMarkdown } from '@/components/chat-markdown';
import { UserMenu } from '@/components/user-menu';
import type { ProfileChatUi } from '@/lib/chat-ui';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const UI_FALLBACK: ProfileChatUi = {
  headerTitle: 'Learning Assistant',
  headerSubtitle: 'Trợ lý học tập',
  headerBadgeLetter: '·',
  welcomeMessage:
    'Không tải được nội dung theo bộ dữ liệu. Vui lòng tải lại trang hoặc chọn lại bộ dữ liệu trong menu.',
  starterQuestions: [],
};

export default function HomePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [chatUi, setChatUi] = useState<ProfileChatUi | null>(null);
  const [uiReady, setUiReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/data-profile');
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        const ui = data?.ui as ProfileChatUi | undefined;
        if (ui) {
          setChatUi(ui);
          setMessages([{ role: 'assistant', content: ui.welcomeMessage }]);
        } else {
          setChatUi(UI_FALLBACK);
          setMessages([{ role: 'assistant', content: UI_FALLBACK.welcomeMessage }]);
        }
      } catch {
        if (!cancelled) {
          setChatUi(UI_FALLBACK);
          setMessages([{ role: 'assistant', content: UI_FALLBACK.welcomeMessage }]);
        }
      } finally {
        if (!cancelled) setUiReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayUi = chatUi ?? UI_FALLBACK;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: data?.text || 'Không có phản hồi.',
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'Có lỗi xảy ra khi gọi chatbot.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        setLoggingOut(false);
      }
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="h-dvh max-h-dvh overflow-hidden">
      {/* ── Header: fixed top ── */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-viettel-border bg-viettel shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white ring-1 ring-white/25"
              aria-hidden
            >
              {uiReady ? displayUi.headerBadgeLetter : '…'}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-white">
                {uiReady ? displayUi.headerTitle : 'Đang tải…'}
              </h1>
              <p className="truncate text-xs text-white/85">
                {uiReady ? displayUi.headerSubtitle : ' '}
              </p>
            </div>
          </div>
          <UserMenu
            onLogout={logout}
            loggingOut={loggingOut}
            onProfileChange={(ui) => {
              setChatUi(ui);
              setMessages([{ role: 'assistant', content: ui.welcomeMessage }]);
              setInput('');
            }}
          />
        </div>
      </header>

      {/* ── Scrollable middle area ── */}
      <div
        ref={scrollRef}
        className="fixed inset-x-0 top-[60px] bottom-[76px] overflow-y-auto overscroll-y-contain bg-background"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
          {!uiReady && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-viettel-border bg-viettel-card px-4 py-2.5 text-sm text-neutral-500">
              Đang tải nội dung theo bộ dữ liệu…
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx}>
              <div
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-viettel px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm'
                    : 'max-w-[85%] rounded-2xl rounded-bl-md border border-viettel-border bg-viettel-card px-4 py-2.5 text-[15px] leading-relaxed text-neutral-800'
                }
              >
                <ChatMarkdown content={m.content} variant={m.role} />
              </div>

              {uiReady &&
                m.role === 'assistant' &&
                idx === 0 &&
                messages.length <= 1 &&
                displayUi.starterQuestions.length > 0 && (
                  <div className="mt-3 grid max-w-[85%] grid-cols-2 gap-2">
                    {displayUi.starterQuestions.map((q, qIdx) => (
                      <button
                        key={`${qIdx}-${q}`}
                        onClick={() => sendMessage(q)}
                        className="rounded-xl border border-viettel/20 bg-viettel-soft px-3 py-2.5 text-left text-sm text-viettel transition-colors hover:border-viettel/50 hover:bg-white disabled:opacity-50"
                        disabled={loading}
                        type="button"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {loading && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-viettel-border bg-white px-4 py-2.5 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viettel [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viettel [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viettel" />
                </span>
                Đang trả lời...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Input form: fixed bottom ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-viettel-border bg-background px-4 py-3"
      >
        <div className="mx-auto flex max-w-3xl gap-2 rounded-2xl border border-viettel-border bg-viettel-card p-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-neutral-400 focus:ring-0"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-viettel px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-viettel-hover disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
}
