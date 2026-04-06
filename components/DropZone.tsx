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
        setError("File is too large. Maximum size is 5MB.");
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
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="w-full rounded-xl cursor-pointer transition-all duration-200 select-none"
        style={{
          padding: "24px 20px",
          border: `2px ${uploaded ? "solid" : "dashed"} ${
            dragging ? "#8b5cf6" : uploaded ? "#10b981" : "#334155"
          }`,
          background: dragging
            ? "rgba(139,92,246,0.05)"
            : uploaded
            ? "rgba(16,185,129,0.04)"
            : "rgba(15,23,42,0.5)",
        }}
      >
        <div className="text-center">
          {uploaded ? (
            <>
              {/* Green success state */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2.5"
                style={{ background: "#10b981" }}
              >
                <span className="text-white text-base font-extrabold">✓</span>
              </div>
              <p className="text-sm font-medium text-white">{file!.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-xs text-[#475569] hover:text-[#94a3b8] mt-1 transition-colors"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              {/* Upload prompt */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2.5"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">
                Drop your resume here
              </p>
              <p className="text-xs text-[#475569] mt-1">
                or <span className="text-[#a78bfa]">click to browse</span> · PDF, DOC, DOCX · Max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onInputChange}
        className="hidden"
        aria-label="Upload resume"
      />
    </div>
  );
}
