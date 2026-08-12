import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        }}
      >
        <svg viewBox="0 0 24 24" width="88" height="88" fill="none">
          <path
            d="M4 5.5h13A1.5 1.5 0 0 1 18.5 7v10a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 17V5.5H4Z"
            stroke="#ffffff"
            strokeWidth="2"
            fill="#2563eb"
          />
          <path
            d="M8 9.5h7M8 13h4.5"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}