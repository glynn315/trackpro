import { ImageResponse } from "next/og";

export const alt = "TrackPro GPS — Anti-Jammer GPS Tracker, Philippines";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(60% 80% at 80% 10%, #ED1C24 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 70% at 10% 90%, #8A0E13 0%, rgba(0,0,0,0) 60%), #000000",
          color: "white",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            alignSelf: "flex-start",
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div style={{ width: 8, height: 8, background: "#ED1C24", borderRadius: 999 }} />
          Anti-Jammer GPS · Philippines
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 920,
          }}
        >
          <span>Stop your vehicle</span>
          <span style={{ color: "#FF3B44" }}>anytime, anywhere.</span>
        </div>

        {/* Feature chips */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          {["Anti-Jammer", "Remote Engine Kill", "Door Lock", "Real-Time Tracking"].map((f) => (
            <div
              key={f}
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 500,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Bottom bar with brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>
            <span style={{ color: "#fff" }}>TRACK</span>
            <span style={{ color: "#ED1C24" }}>PRO</span>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.65)" }}>
            trackprogps.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
