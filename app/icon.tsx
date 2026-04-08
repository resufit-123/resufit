import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed, #6366f1)",
          borderRadius: 8,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Document lines */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="4" y="4" width="6" height="1.4" rx="0.7" fill="white" fillOpacity="0.55" />
          <rect x="4" y="7.5" width="12" height="1.4" rx="0.7" fill="white" fillOpacity="0.4" />
          <rect x="4" y="11" width="9" height="1.4" rx="0.7" fill="white" fillOpacity="0.4" />
          {/* Checkmark */}
          <circle cx="14" cy="15" r="4.5" fill="white" fillOpacity="0.15" />
          <polyline
            points="11.5,15 13.3,16.8 16.5,13"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
