export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://fiscaliza.brandifyia.com"

export const SITE_NAME = "FISCALIZA"

export const SITE_DESCRIPTION =
  "Centraliza tu licencia, revisión técnica, permiso de circulación y SOAP. Muéstralos al fiscalizador desde tu celular en segundos."
