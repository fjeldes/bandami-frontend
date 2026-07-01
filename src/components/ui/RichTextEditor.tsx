"use client";

import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  modules?: object;
}

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  modules: customModules,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`bg-surface-container rounded-lg border border-outline-variant p-3 ${className}`}>
        <div className="h-24 bg-surface-container-high animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={customModules || modules}
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
}
