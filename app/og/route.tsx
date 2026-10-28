import { ImageResponse } from "next/og";

export function GET(request: Request) {
  const title = (
    new URL(request.url).searchParams.get("title") || "Quem faz, fortalece."
  ).slice(0, 120);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#f3efe3",
        color: "#24251c",
        padding: "54px 64px",
        fontFamily: "sans-serif",
        borderLeft: "24px solid #ed3b2f",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        FEITO EM REDE
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 42,
          fontSize: title.length > 65 ? 52 : 70,
          fontWeight: 700,
          lineHeight: 1.08,
          maxWidth: 1030,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          background: "#f2c433",
          padding: "18px 24px",
          fontSize: 25,
          fontWeight: 700,
        }}
      >
        NEGÓCIOS · TALENTOS · OPORTUNIDADES
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 24 }}>
        Uma economia feita por gente, para gente.
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
