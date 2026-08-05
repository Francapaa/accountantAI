import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
              <path
                d="M4 5.5h13A1.5 1.5 0 0 1 18.5 7v10a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 17V5.5H4Z"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M8 9.5h7M8 13h4.5"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            AccountantAI
          </div>
        </div>
        <div style={{ fontSize: "44px", fontWeight: 600, color: "#2563eb" }}>
          {siteConfig.tagline}
        </div>
        <div style={{ fontSize: "30px", color: "#475569", marginTop: "20px" }}>
          Respuestas con cita a la normativa de ARCA/AFIP, en la carpeta de cada
          cliente.
        </div>
      </div>
    ),
    size,
  );
}