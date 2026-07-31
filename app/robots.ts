import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/account",
        "/activity",
        "/vehicles",
        "/vehicles/*",
        "/present/*",
        "/callback",
        "/qr/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
