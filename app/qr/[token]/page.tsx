import type { Metadata } from "next"
import QrShareClient from "./QrShareClient"

export const metadata: Metadata = {
  title: "Resumen del vehículo",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "FISCALIZA — Resumen del vehículo",
  },
}

export default async function QrSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return <QrShareClient token={token} />
}
