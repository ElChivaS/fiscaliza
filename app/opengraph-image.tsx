import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
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
          backgroundColor: "#111010",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#f5f3ef",
            letterSpacing: -2,
          }}
        >
          FISCALIZA
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#f5f3ef",
            opacity: 0.7,
            marginTop: 16,
          }}
        >
          Tu bóveda vehicular digital
        </div>
      </div>
    ),
    { ...size }
  )
}
