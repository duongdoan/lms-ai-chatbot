'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMarkdown } from '@/components/chat-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const starterQuestions = [
  'Tôi nên học gì trước theo vị trí của mình?',
  'Có những khóa tiếng Anh nào trong hệ thống?',
  'Chứng chỉ sắp hết hạn thì phải làm gì?',
  'Làm sao để đăng ký khóa học?',
  'Nếu tôi không đạt bài kiểm tra thì sao?',
  'Gợi ý lộ trình học tập phù hợp với tôi',
];

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Xin chào, tôi là VNA Learning Assistant — trợ lý học tập nội bộ cho nhân viên Vietnam Airlines. Bạn có thể hỏi về khóa học, quy trình đào tạo, chứng chỉ hoặc gợi ý lộ trình theo vị trí.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      {/* ── Header: fixed top ── */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-viettel-border bg-viettel shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white ring-1 ring-white/25"
            aria-hidden
          >
            V
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white">
              VNA Learning Assistant
            </h1>
            <p className="truncate text-xs text-white/85">
              Trợ lý học tập nội bộ — hỗ trợ tra cứu đào tạo
            </p>
          </div>
        </div>
      </header>

      {/* ── Scrollable middle area ── */}
      <div
        ref={scrollRef}
        className="fixed inset-x-0 top-[60px] bottom-[76px] overflow-y-auto overscroll-y-contain bg-background"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
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

              {m.role === 'assistant' && idx === 0 && messages.length <= 1 && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-w-[85%]">
                  {starterQuestions.map((q) => (
                    <button
                      key={q}
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
    </>
  );
}
