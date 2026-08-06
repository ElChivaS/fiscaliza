import autosData from "./autos.json"
import motosData from "./motos.json"

export type VehicleCategory = "auto" | "moto"

export type BodyType =
  | "sedan"
  | "hatchback"
  | "suv"
  | "pickup"
  | "van"
  | "wagon"
  | "coupe"
  | "naked"
  | "scooter"
  | "cafe_racer"
  | "cruiser"
  | "enduro"
  | "touring"
  | "trike"
  | "racing"

export interface VehicleModel {
  name:     string
  bodyType: BodyType
}

export interface VehicleBrand {
  name:     string
  slug:     string
  hasLogo:  boolean
  logoUrl?: string  // override — para marcas sin logo en BRAND_LOGO_BASE (ej. motos)
  category: VehicleCategory
  models:   VehicleModel[]
}

interface CatalogModel {
  id:   string
  name: string
  bodyType: string
}

interface CatalogBrand {
  id:     string
  name:   string
  logo:   string | null
  models: CatalogModel[]
}

function buildBrands(catalog: { brands: CatalogBrand[] }, category: VehicleCategory): VehicleBrand[] {
  const brands: VehicleBrand[] = catalog.brands.map((b) => ({
    name:     b.name,
    slug:     b.id,
    hasLogo:  b.logo !== null,
    logoUrl:  b.logo ?? undefined,
    category,
    models:   b.models.map((m) => ({ name: m.name, bodyType: m.bodyType as BodyType })),
  }))

  brands.push({
    name:    "Otro",
    slug:    category === "auto" ? "otro-auto" : "otro-moto",
    hasLogo: false,
    category,
    models:  [],
  })

  return brands
}

const AUTO_BRANDS: VehicleBrand[] = buildBrands(autosData, "auto")
const MOTO_BRANDS: VehicleBrand[] = buildBrands(motosData, "moto")

export const VEHICLE_BRANDS: VehicleBrand[] = [...AUTO_BRANDS, ...MOTO_BRANDS]

export const AUTO_BRANDS_LIST  = AUTO_BRANDS
export const MOTO_BRANDS_LIST  = MOTO_BRANDS

export function getBrandLogoUrl(brand: VehicleBrand): string | null {
  if (!brand.hasLogo) return null
  return brand.logoUrl ?? null
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  // Autos
  sedan:     "Sedán",
  hatchback: "Hatchback",
  suv:       "SUV / Crossover",
  pickup:    "Pickup",
  van:       "Furgón / Van",
  wagon:     "Station Wagon",
  coupe:     "Coupé",
  // Motos
  scooter:   "Scooter",
  cafe_racer:"Café Racer",
  cruiser:   "Cruiser",
  enduro:    "Enduro / Adventure",
  touring:   "Touring",
  trike:     "Trike",
  naked:     "Naked / Estándar",
  racing:    "Racing / Deportiva",
}
