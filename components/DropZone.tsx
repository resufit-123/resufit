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
        setError("File too large — maximum 5 MB.");
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
    <div style={{ width: "100%" }}>
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
          width: "100%",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          borderRadius: 0,
          border: dragging
            ? "1px solid #6366f1"
            : uploaded
            ? "1px solid #e5e7eb"
            : "1px solid transparent",
          background: dragging
            ? "rgba(99,102,241,0.02)"
            : "#ffffff",
          transition: "border-color 0.15s ease, background 0.15s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!uploaded && !dragging) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
          }
        }}
        onMouseLeave={(e) => {
          if (!uploaded && !dragging) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
          }
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
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="8" fill="#10b981" />
                <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                {file!.name}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "#9ca3af",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          /* ── Upload prompt ── */
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            {/* Upload icon — minimal line art */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
              style={{ marginBottom: 12, opacity: 0.35 }}
            >
              <path d="M16 22V10M16 10l-5 5M16 10l5 5" stroke="#111827" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 26h16" stroke="#111827" strokeWidth="1.75" strokeLinecap="round" />
            </svg>

            <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>
              {dragging ? "Drop it here" : "Drop your resume here"}
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              or <span style={{ color: "#6366f1", fontWeight: 500 }}>click to browse</span>
              &nbsp;· PDF, DOC, DOCX · Max 5 MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8, textAlign: "center" }}>
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
