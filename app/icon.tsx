import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f5f3ef" }}>F</div>
      </div>
    ),
    { ...size }
  )
}
