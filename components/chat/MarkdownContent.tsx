"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/* Renders assistant message content as real Markdown — clickable links,
   bold/italic, headings, lists, and GFM tables — instead of the raw
   pre-wrap text this app used before. Only for assistant messages; user
   messages stay plain text (same convention ChatGPT/Claude use). Never
   passes through raw HTML from the model (no rehype-raw) — only
   recognized Markdown syntax becomes an element, closing off any HTML/
   script-injection surface from model output. */

const components: Components = {
  p: ({ children }) => (
    <p className="text-[15px] leading-[1.72]" style={{ color: "var(--ink-700)" }}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: "var(--ink-800, var(--ink-700))" }}>
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="underline underline-offset-2 transition-colors duration-100"
      style={{ color: "var(--blue-600)" }}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="flex flex-col gap-1.5 pl-5 my-1" style={{ listStyleType: "disc", color: "var(--ink-700)" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="flex flex-col gap-1.5 pl-5 my-1" style={{ listStyleType: "decimal", color: "var(--ink-700)" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] leading-[1.6]" style={{ color: "var(--ink-700)" }}>
      {children}
    </li>
  ),
  h1: ({ children }) => (
    <h1 className="text-[19px] font-semibold mt-3 mb-1" style={{ color: "var(--ink-800, var(--ink-700))" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[17px] font-semibold mt-3 mb-1" style={{ color: "var(--ink-800, var(--ink-700))" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[15.5px] font-semibold mt-2.5 mb-1" style={{ color: "var(--ink-800, var(--ink-700))" }}>
      {children}
    </h3>
  ),
  hr: () => <hr className="my-3" style={{ borderColor: "var(--line)" }} />,
  blockquote: ({ children }) => (
    <blockquote
      className="pl-3.5 italic my-1"
      style={{ borderLeft: "2.5px solid var(--line-strong)", color: "var(--ink-500)" }}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    // A fenced block's <code> carries a "language-xxx" className from
    // remark; inline code doesn't — that's how we tell them apart.
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono text-[13px]`} style={{ color: "var(--ink-700)" }}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="font-mono text-[13px] px-1.5 py-0.5 rounded-md"
        style={{ background: "var(--paper-sunk)", color: "var(--ink-700)" }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      className="overflow-x-auto rounded-xl p-3.5 my-1"
      style={{ background: "var(--paper-sunk)", border: "1px solid var(--line)" }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-1.5 rounded-xl" style={{ border: "1px solid var(--line)" }}>
      <table className="w-full border-collapse text-[13.5px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: "var(--paper-sunk)" }}>{children}</thead>,
  th: ({ children }) => (
    <th
      className="text-left font-semibold px-3 py-2 whitespace-nowrap"
      style={{ color: "var(--ink-700)", borderBottom: "1px solid var(--line)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2" style={{ color: "var(--ink-700)", borderBottom: "1px solid var(--line-soft)" }}>
      {children}
    </td>
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
