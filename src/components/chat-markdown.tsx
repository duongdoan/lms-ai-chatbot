import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatMarkdownProps = {
  content: string;
  variant: 'assistant' | 'user';
};

const assistantComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 text-[15px] leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed last:mb-0 marker:text-neutral-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 text-[15px] leading-relaxed last:mb-0 marker:text-neutral-500">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-viettel underline decoration-viettel/40 underline-offset-2 hover:decoration-viettel"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-4 border-viettel/40 bg-viettel-soft/50 py-1 pl-3 text-[15px] text-neutral-700 last:mb-0">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <h3 className="mb-2 text-base font-semibold text-neutral-900">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 text-base font-semibold text-neutral-900">{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 text-[15px] font-semibold text-neutral-900">{children}</h3>
  ),
  hr: () => <hr className="my-3 border-viettel-border" />,
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-900 p-3 text-[13px] leading-relaxed text-neutral-100 last:mb-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.startsWith('language-'));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-neutral-200/90 px-1.5 py-0.5 font-mono text-[0.88em] text-neutral-800"
        {...props}
      >
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="mb-2 max-w-full overflow-x-auto last:mb-0">
      <table className="w-full min-w-[240px] border-collapse border border-viettel-border text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-neutral-100">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-viettel-border px-2.5 py-2 font-semibold text-neutral-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-viettel-border px-2.5 py-2 text-neutral-700">{children}</td>
  ),
  tr: ({ children }) => <tr className="even:bg-neutral-50/80">{children}</tr>,
};

const userComponents: Components = {
  ...assistantComponents,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-white underline decoration-white/50 underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.startsWith('language-'));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[0.88em]"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-black/25 p-3 text-[13px] leading-relaxed last:mb-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-4 border-white/40 py-1 pl-3 text-[15px] last:mb-0">
      {children}
    </blockquote>
  ),
};

export function ChatMarkdown({ content, variant }: ChatMarkdownProps) {
  const components = variant === 'user' ? userComponents : assistantComponents;

  return (
    <div className="chat-markdown [&:first-child>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
