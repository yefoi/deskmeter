import { ImageResponse } from "next/og";

export const alt = "Deskmeter · Your helpdesk health";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #0b1120 0%, #0f3b38 100%)",
          color: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "#0d9488",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "#f0fdfa",
            }}
          >
            D
          </div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 700 }}>
            Desk<span style={{ color: "#2dd4bf" }}>meter</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "68px", fontWeight: 700, lineHeight: 1.1 }}>
            Helpdesk health,
          </div>
          <div style={{ fontSize: "68px", fontWeight: 700, lineHeight: 1.1 }}>
            in seconds
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "30px",
              color: "#94a3b8",
            }}
          >
            Ticket CSV · open index · no sign-up · no stored data
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "24px", color: "#2dd4bf" }}>
          classifier.dev · Next.js · Recharts
        </div>
      </div>
    ),
    size,
  );
}
