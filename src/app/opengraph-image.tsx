import { ImageResponse } from "next/og";

export const alt = "ЛЕВЕЛ 8 — Дигитални решения за вашия бизнес";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const interBold = await fetch(
    "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf"
  ).then((res) => res.arrayBuffer());

  const interRegular = await fetch(
    "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
  ).then((res) => res.arrayBuffer());

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
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <svg
          width="1200"
          height="630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(57, 255, 20, 0.06)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: "120px",
            width: "600px",
            height: "300px",
            background:
              "radial-gradient(ellipse at center, rgba(57, 255, 20, 0.12) 0%, rgba(57, 255, 20, 0.04) 40%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #39ff14, transparent)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "96px",
              fontWeight: 700,
              color: "#f5f5f5",
              fontFamily: "Inter",
              letterSpacing: "-2px",
            }}
          >
            LEVEL
          </span>
          <span
            style={{
              fontSize: "96px",
              fontWeight: 700,
              color: "#39ff14",
              fontFamily: "Inter",
              letterSpacing: "-2px",
              marginLeft: "12px",
              textShadow:
                "0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(57, 255, 20, 0.3), 0 0 80px rgba(57, 255, 20, 0.15)",
            }}
          >
            8
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#f5f5f5",
            fontFamily: "Inter",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          Дигитални решения за вашия бизнес
        </div>

        {/* Services */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 400,
            color: "#737373",
            fontFamily: "Inter",
            marginBottom: "40px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <span>Онлайн магазини</span>
          <span style={{ color: "#39ff14" }}>·</span>
          <span>AI Чатботове</span>
          <span style={{ color: "#39ff14" }}>·</span>
          <span>Автоматизация</span>
          <span style={{ color: "#39ff14" }}>·</span>
          <span>Програми за лоялност</span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#39ff14",
            fontFamily: "Inter",
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
            display: "flex",
          }}
        >
          level8.bg
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #39ff14, transparent)",
            display: "flex",
          }}
        />

        {/* Corner accents */}
        <svg
          width="40"
          height="40"
          style={{ position: "absolute", top: "20px", left: "20px" }}
        >
          <path
            d="M 0 20 L 0 0 L 20 0"
            fill="none"
            stroke="#39ff14"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
        <svg
          width="40"
          height="40"
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <path
            d="M 40 20 L 40 0 L 20 0"
            fill="none"
            stroke="#39ff14"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
        <svg
          width="40"
          height="40"
          style={{ position: "absolute", bottom: "20px", left: "20px" }}
        >
          <path
            d="M 0 20 L 0 40 L 20 40"
            fill="none"
            stroke="#39ff14"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
        <svg
          width="40"
          height="40"
          style={{ position: "absolute", bottom: "20px", right: "20px" }}
        >
          <path
            d="M 40 20 L 40 40 L 20 40"
            fill="none"
            stroke="#39ff14"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          style: "normal" as const,
          weight: 700,
        },
        {
          name: "Inter",
          data: interRegular,
          style: "normal" as const,
          weight: 400,
        },
      ],
    }
  );
}
