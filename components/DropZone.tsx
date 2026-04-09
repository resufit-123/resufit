"use client";

import { useState, useCallback, useRef } from "react";

interface DropZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function DropZone({ file, onFileChange }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (incoming: File) => {
      setError(null);
      const ext = incoming.name.split(".").pop()?.toLowerCase();
      const validExts = ["pdf", "doc", "docx"];
      if (!ACCEPTED_TYPES.includes(incoming.type) && !validExts.includes(ext ?? "")) {
        setError("Please upload a PDF, DOC, or DOCX file.");
        return;
      }
      if (incoming.size > 5 * 1024 * 1024) {
        setError("File too large — please keep it under 5 MB.");
        return;
      }
      onFileChange(incoming);
    },
    [onFileChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) validateAndSet(dropped);
    },
    [validateAndSet]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateAndSet(selected);
    },
    [validateAndSet]
  );

  const uploaded = file !== null && !dragging;

  return (
    /* Outer wrapper fills the parent container fully */
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload your resume"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          outline: "none",
          background: dragging ? "rgba(99,102,241,0.04)" : "transparent",
          transition: "background 0.15s ease",
          padding: "24px",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.outline = "2px solid #6366f1";
          (e.currentTarget as HTMLDivElement).style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.outline = "none";
        }}
      >
        {uploaded ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"
              style={{ display: "block", margin: "0 auto 10px" }}>
              <circle cx="16" cy="16" r="16" fill="#10b981" />
              <path d="M9 16l5 5 9-10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 6px", wordBreak: "break-all" }}>
              {file!.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              style={{
                background: "none", border: "none",
                fontSize: 12, color: "#9ca3af",
                cursor: "pointer", padding: 0,
                textDecoration: "underline",
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          /* ── Upload prompt — no file type or size mentioned here ── */
          <div style={{ textAlign: "center" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true"
              style={{ display: "block", margin: "0 auto 12px" }}>
              <path d="M18 26V12M18 12l-6 6M18 12l6 6"
                stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 30h20"
                stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>
              {dragging ? "Drop it here" : "Drop your resume here"}
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              or <span style={{ color: "#6366f1", fontWeight: 500 }}>click to browse</span>
            </p>
          </div>
        )}
      </div>

      {/* Validation errors only — file type / size shown here if needed */}
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 8px", textAlign: "center", padding: "0 16px" }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onInputChange}
        style={{ display: "none" }}
        aria-label="Upload resume"
      />
    </div>
  );
}
