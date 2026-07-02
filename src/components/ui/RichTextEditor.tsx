"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const ReactQuillEditor = dynamic(
  () => {
    return import("react-quill").then((mod) => {
      const QuillComponent = mod.default;
      return function QuillWrapper(props: any) {
        return <QuillComponent {...props} />;
      };
    });
  },
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-container rounded-lg border border-outline-variant p-3 h-32 animate-pulse" />
    ),
  }
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
}: RichTextEditorProps) {
  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuillEditor
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
}
