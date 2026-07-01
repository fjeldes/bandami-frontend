"use client";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content) return null;

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    />
  );
}
