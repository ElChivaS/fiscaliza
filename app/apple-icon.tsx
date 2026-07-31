import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111010",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, color: "#f5f3ef" }}>F</div>
      </div>
    ),
    { ...size }
  )
}
