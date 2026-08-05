import { ImageResponse } from "next/og";
import { getPost } from "@/lib/content/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AccountantAI";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "30px",
            fontWeight: 600,
            color: "#93c5fd",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            A
          </div>
          AccountantAI — Blog
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            {post?.title ?? "Artículo de AccountantAI"}
          </div>
          <div
            style={{
              marginTop: "24px",
              fontSize: "30px",
              color: "#bfdbfe",
            }}
          >
            IA y normativa ARCA/AFIP para estudios contables de Argentina
          </div>
        </div>
      </div>
    ),
    size,
  );
}