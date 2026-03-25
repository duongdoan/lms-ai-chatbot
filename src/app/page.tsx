'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const starterQuestions = [
  'Khóa học và chứng chỉ phù hợp với vị trí của tôi?',
  'Quy trình đào tạo nội bộ thường gồm những bước nào?',
  'Giới hạn của bản demo hiện tại là gì?',
];

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Xin chào, tôi là VNA Learning Assistant — trợ lý học tập nội bộ cho nhân viên Vietnam Airlines. Bạn có thể hỏi về khóa học, quy trình đào tạo, chứng chỉ hoặc gợi ý lộ trình theo vị trí.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-viettel-border bg-viettel shadow-[0_1px_0_rgba(0,0,0,0.06)]">
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

      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
        <div className="rounded-2xl border border-viettel-border bg-viettel-card p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-neutral-600">
            Trợ lý học tập nội bộ (demo) — tra cứu khóa học, quy trình đào tạo và lộ trình theo vị trí.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-viettel/30 bg-viettel-soft px-3.5 py-1.5 text-sm font-medium text-viettel transition-colors hover:border-viettel hover:bg-white disabled:opacity-50"
              disabled={loading}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="min-h-[420px] rounded-2xl border border-viettel-border bg-viettel-card p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-viettel px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm'
                    : 'max-w-[85%] rounded-2xl rounded-bl-md border border-viettel-border bg-neutral-50/80 px-4 py-2.5 text-[15px] leading-relaxed text-neutral-800'
                }
              >
                {m.content}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 rounded-2xl border border-viettel-border bg-viettel-card p-2 shadow-sm"
        >
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
        </form>
      </div>
    </main>
  );
}
