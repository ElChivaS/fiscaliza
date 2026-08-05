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

const L = (name: string, bodyType: BodyType): VehicleModel => ({ name, bodyType })

// ─── Autos ───────────────────────────────────────────────────────────────────

const AUTO_BRANDS: VehicleBrand[] = [
  {
    name: "Toyota", slug: "toyota", hasLogo: true, category: "auto",
    models: [
      L("Yaris",        "hatchback"),
      L("Corolla",      "sedan"),
      L("Corolla Cross","suv"),
      L("Camry",        "sedan"),
      L("RAV4",         "suv"),
      L("CH-R",         "suv"),
      L("Fortuner",     "suv"),
      L("Land Cruiser", "suv"),
      L("Prado",        "suv"),
      L("Hilux",        "pickup"),
      L("HiAce",        "van"),
    ],
  },
  {
    name: "Hyundai", slug: "hyundai", hasLogo: true, category: "auto",
    models: [
      L("i10",        "hatchback"),
      L("HB20",       "hatchback"),
      L("Accent",     "sedan"),
      L("Elantra",    "sedan"),
      L("Creta",      "suv"),
      L("Tucson",     "suv"),
      L("Santa Fe",   "suv"),
      L("Kona",       "suv"),
      L("Starex",     "van"),
      L("H1",         "van"),
    ],
  },
  {
    name: "Kia", slug: "kia", hasLogo: true, category: "auto",
    models: [
      L("Picanto",   "hatchback"),
      L("Rio",       "hatchback"),
      L("Cerato",    "sedan"),
      L("Stonic",    "suv"),
      L("Seltos",    "suv"),
      L("Sportage",  "suv"),
      L("Sorento",   "suv"),
      L("Carnival",  "van"),
    ],
  },
  {
    name: "Chevrolet", slug: "chevrolet", hasLogo: true, category: "auto",
    models: [
      L("Spark",    "hatchback"),
      L("Onix",     "hatchback"),
      L("Sail",     "sedan"),
      L("Cavalier", "sedan"),
      L("Tracker",  "suv"),
      L("Captiva",  "suv"),
      L("Trailblazer","suv"),
      L("S10",      "pickup"),
      L("N300",     "van"),
    ],
  },
  {
    name: "Nissan", slug: "nissan", hasLogo: true, category: "auto",
    models: [
      L("March",    "hatchback"),
      L("Versa",    "sedan"),
      L("Sentra",   "sedan"),
      L("Kicks",    "suv"),
      L("Qashqai",  "suv"),
      L("X-Trail",  "suv"),
      L("Murano",   "suv"),
      L("Navara",   "pickup"),
      L("Frontier", "pickup"),
      L("Urvan",    "van"),
    ],
  },
  {
    name: "Suzuki", slug: "suzuki", hasLogo: true, category: "auto",
    models: [
      L("Celerio",      "hatchback"),
      L("Swift",        "hatchback"),
      L("Baleno",       "sedan"),
      L("S-Cross",      "suv"),
      L("Vitara",       "suv"),
      L("Grand Vitara", "suv"),
      L("Jimny",        "suv"),
    ],
  },
  {
    name: "Mazda", slug: "mazda", hasLogo: true, category: "auto",
    models: [
      L("Mazda 2",  "hatchback"),
      L("Mazda 3",  "sedan"),
      L("Mazda 6",  "sedan"),
      L("CX-3",     "suv"),
      L("CX-30",    "suv"),
      L("CX-5",     "suv"),
      L("CX-9",     "suv"),
      L("BT-50",    "pickup"),
    ],
  },
  {
    name: "Ford", slug: "ford", hasLogo: true, category: "auto",
    models: [
      L("Fiesta",    "hatchback"),
      L("Focus",     "hatchback"),
      L("Escape",    "suv"),
      L("EcoSport",  "suv"),
      L("Edge",      "suv"),
      L("Explorer",  "suv"),
      L("Bronco",    "suv"),
      L("Ranger",    "pickup"),
      L("F-150",     "pickup"),
      L("Transit",   "van"),
    ],
  },
  {
    name: "Volkswagen", slug: "volkswagen", hasLogo: true, category: "auto",
    models: [
      L("Gol",       "hatchback"),
      L("Polo",      "hatchback"),
      L("Golf",      "hatchback"),
      L("Vento",     "sedan"),
      L("Jetta",     "sedan"),
      L("T-Cross",   "suv"),
      L("Tiguan",    "suv"),
      L("Teramont",  "suv"),
      L("Amarok",    "pickup"),
      L("Transporter","van"),
    ],
  },
  {
    name: "Mitsubishi", slug: "mitsubishi", hasLogo: true, category: "auto",
    models: [
      L("Mirage",        "hatchback"),
      L("ASX",           "suv"),
      L("Eclipse Cross", "suv"),
      L("Outlander",     "suv"),
      L("Outlander PHEV","suv"),
      L("L200",          "pickup"),
    ],
  },
  {
    name: "Honda", slug: "honda", hasLogo: true, category: "auto",
    models: [
      L("Fit",     "hatchback"),
      L("Jazz",    "hatchback"),
      L("City",    "sedan"),
      L("Civic",   "sedan"),
      L("HR-V",    "suv"),
      L("CR-V",    "suv"),
      L("Pilot",   "suv"),
    ],
  },
  {
    name: "MG", slug: "mg", hasLogo: true, category: "auto",
    models: [
      L("MG 3",    "hatchback"),
      L("MG 5",    "sedan"),
      L("MG GT",   "sedan"),
      L("ZS",      "suv"),
      L("ZX",      "suv"),
      L("ZST",     "suv"),
      L("HS",      "suv"),
    ],
  },
  {
    name: "BYD", slug: "byd", hasLogo: true, category: "auto",
    models: [
      L("Dolphin",   "hatchback"),
      L("F3",        "sedan"),
      L("Atto 3",    "suv"),
      L("Yuan Plus",  "suv"),
      L("Tang",      "suv"),
      L("Han",       "sedan"),
    ],
  },
  {
    name: "Chery", slug: "chery", hasLogo: true, category: "auto",
    models: [
      L("QQ",         "hatchback"),
      L("Arrizo 5",   "sedan"),
      L("Arrizo 6",   "sedan"),
      L("Tiggo 2",    "suv"),
      L("Tiggo 4",    "suv"),
      L("Tiggo 7",    "suv"),
      L("Tiggo 8",    "suv"),
    ],
  },
  {
    name: "JAC", slug: "jac", hasLogo: true, category: "auto",
    models: [
      L("J4",  "sedan"),
      L("S3",  "suv"),
      L("S4",  "suv"),
      L("T6",  "pickup"),
      L("T8",  "pickup"),
    ],
  },
  {
    name: "Subaru", slug: "subaru", hasLogo: true, category: "auto",
    models: [
      L("Impreza",  "sedan"),
      L("WRX",      "sedan"),
      L("Legacy",   "wagon"),
      L("Outback",  "wagon"),
      L("Forester", "suv"),
      L("XV",       "suv"),
      L("Solterra", "suv"),
    ],
  },
  {
    name: "Peugeot", slug: "peugeot", hasLogo: true, category: "auto",
    models: [
      L("208",          "hatchback"),
      L("308",          "hatchback"),
      L("2008",         "suv"),
      L("3008",         "suv"),
      L("5008",         "suv"),
      L("Partner",      "van"),
      L("Expert",       "van"),
    ],
  },
  {
    name: "Renault", slug: "renault", hasLogo: true, category: "auto",
    models: [
      L("Kwid",      "hatchback"),
      L("Sandero",   "hatchback"),
      L("Logan",     "sedan"),
      L("Duster",    "suv"),
      L("Koleos",    "suv"),
      L("Stepway",   "suv"),
      L("Oroch",     "pickup"),
      L("Master",    "van"),
      L("Kangoo",    "van"),
    ],
  },
  {
    name: "Citroën", slug: "citroen", hasLogo: true, category: "auto",
    models: [
      L("C3",           "hatchback"),
      L("C3 Aircross",  "suv"),
      L("C4",           "hatchback"),
      L("C5 Aircross",  "suv"),
      L("C-Elysée",     "sedan"),
      L("Berlingo",     "van"),
    ],
  },
  {
    name: "Foton", slug: "foton", hasLogo: true, category: "auto",
    models: [
      L("Tunland",    "pickup"),
      L("Tunland G7", "pickup"),
      L("Thunder",    "pickup"),
      L("Sauvana",    "van"),
      L("View C2",    "van"),
    ],
  },
  {
    name: "Geely", slug: "geely", hasLogo: true, category: "auto",
    models: [
      L("Emgrand",  "sedan"),
      L("Coolray",  "suv"),
      L("Azkarra",  "suv"),
      L("Okavango", "suv"),
    ],
  },
  {
    name: "Haval", slug: "haval", hasLogo: true, category: "auto",
    models: [
      L("H2",      "suv"),
      L("H6",      "suv"),
      L("Jolion",  "suv"),
      L("Dargo",   "suv"),
    ],
  },
  {
    name: "Jeep", slug: "jeep", hasLogo: true, category: "auto",
    models: [
      L("Renegade",  "suv"),
      L("Compass",   "suv"),
      L("Cherokee",  "suv"),
      L("Grand Cherokee","suv"),
      L("Wrangler",  "suv"),
      L("Avenger",  "suv"),
      L("Gladiator", "pickup"),
    ],
  },
  {
    name: "BMW", slug: "bmw", hasLogo: true, category: "auto",
    models: [
      L("Serie 1", "hatchback"),
      L("Serie 2", "coupe"),
      L("Serie 3", "sedan"),
      L("Serie 5", "sedan"),
      L("X1",      "suv"),
      L("X3",      "suv"),
      L("X5",      "suv"),
    ],
  },
  {
    name: "Mercedes-Benz", slug: "mercedes-benz", hasLogo: true, category: "auto",
    models: [
      L("Clase A",   "hatchback"),
      L("Clase C",   "sedan"),
      L("Clase E",   "sedan"),
      L("GLA",       "suv"),
      L("GLC",       "suv"),
      L("GLE",       "suv"),
      L("Sprinter",  "van"),
    ],
  },
  {
    name: "Audi", slug: "audi", hasLogo: true, category: "auto",
    models: [
      L("A1",  "hatchback"),
      L("A3",  "sedan"),
      L("A4",  "sedan"),
      L("A6",  "sedan"),
      L("Q2",  "suv"),
      L("Q3",  "suv"),
      L("Q5",  "suv"),
    ],
  },
  {
    name: "Otro", slug: "otro-auto", hasLogo: false, category: "auto",
    models: [],
  },
]

// ─── Motos ───────────────────────────────────────────────────────────────────

const MOTO_BRANDS: VehicleBrand[] = [
  {
    name: "Honda", slug: "honda", hasLogo: true, category: "moto",
    models: [
      L("CB 190R",      "naked"),
      L("CB 500F",      "naked"),
      L("CB 650R",      "naked"),
      L("CB 1000R",     "naked"),
      L("CBR 300R",     "racing"),
      L("CBR 500R",     "racing"),
      L("CBR 650R",     "racing"),
      L("CBR 1000RR",   "racing"),
      L("Wave 110i",    "scooter"),
      L("PCX 150",      "scooter"),
      L("PCX 160",      "scooter"),
      L("Forza 350",    "scooter"),
      L("Africa Twin",  "enduro"),
      L("XR 150L",      "enduro"),
      L("Shadow 750",   "cruiser"),
      L("NT1100",       "touring"),
    ],
  },
  {
    name: "Yamaha", slug: "yamaha", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Yamaha_Motor_logo.svg/250px-Yamaha_Motor_logo.svg.png",
    models: [
      L("YBR 125",     "naked"),
      L("FZ 150i",     "naked"),
      L("MT-03",       "naked"),
      L("MT-07",       "naked"),
      L("MT-09",       "naked"),
      L("YZF-R3",      "racing"),
      L("YZF-R6",      "racing"),
      L("YZF-R1",      "racing"),
      L("NMAX 155",    "scooter"),
      L("T-Max 560",   "scooter"),
      L("Ténéré 700",  "enduro"),
      L("Ténéré 660",  "enduro"),
      L("XTZ 150",     "enduro"),
      L("V-Star 250",  "cruiser"),
      L("FJR 1300",    "touring"),
    ],
  },
  {
    name: "Kawasaki", slug: "kawasaki", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Kawasaki_Motors_logo.svg/250px-Kawasaki_Motors_logo.svg.png",
    models: [
      L("Z400",         "naked"),
      L("Z650",         "naked"),
      L("Z900",         "naked"),
      L("Ninja 400",    "racing"),
      L("Ninja 650",    "racing"),
      L("Ninja ZX-6R",  "racing"),
      L("Ninja ZX-10R", "racing"),
      L("Versys 650",   "touring"),
      L("Versys 1000",  "touring"),
      L("KLX 150",      "enduro"),
      L("Vulcan S",     "cruiser"),
    ],
  },
  {
    name: "Suzuki", slug: "suzuki", hasLogo: true, category: "moto",
    models: [
      L("GN 125",       "naked"),
      L("GSX-S750",     "naked"),
      L("GSX-S1000",    "naked"),
      L("GSX-R600",     "racing"),
      L("GSX-R750",     "racing"),
      L("GSX-R1000",    "racing"),
      L("V-Strom 650",  "touring"),
      L("V-Strom 1000", "touring"),
      L("Burgman 400",  "scooter"),
      L("Boulevard M50","cruiser"),
      L("Boulevard C50","cruiser"),
    ],
  },
  {
    name: "KTM", slug: "ktm", hasLogo: true, category: "moto",
    models: [
      L("Duke 200",      "naked"),
      L("Duke 390",      "naked"),
      L("Duke 890",      "naked"),
      L("Duke 1290",     "naked"),
      L("RC 200",        "racing"),
      L("RC 390",        "racing"),
      L("Adventure 390", "enduro"),
      L("Adventure 890", "enduro"),
      L("EXC 350",       "enduro"),
      L("EXC-F 450",     "enduro"),
    ],
  },
  {
    name: "BMW Motorrad", slug: "bmw", hasLogo: true, category: "moto",
    models: [
      L("G 310 R",    "naked"),
      L("G 310 GS",   "enduro"),
      L("F 900 R",    "naked"),
      L("F 900 XR",   "touring"),
      L("R 1250 GS",  "enduro"),
      L("R 1250 RT",  "touring"),
      L("S 1000 R",   "naked"),
      L("S 1000 RR",  "racing"),
    ],
  },
  {
    name: "Bajaj", slug: "bajaj", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bajaj_Auto_logo.svg/250px-Bajaj_Auto_logo.svg.png",
    models: [
      L("Boxer 100",    "naked"),
      L("Rouser NS 200","naked"),
      L("Rouser RS 200","racing"),
      L("Rouser AS 200","enduro"),
      L("Dominar 400",  "naked"),
      L("Pulsar 220",   "naked"),
    ],
  },
  {
    name: "Royal Enfield", slug: "royal-enfield", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Royal_Enfield_logo.svg/250px-Royal_Enfield_logo.svg.png",
    models: [
      L("Meteor 350",     "cruiser"),
      L("Classic 350",    "cruiser"),
      L("Thunderbird 350","cruiser"),
      L("Himalayan 450",  "enduro"),
      L("Guerrilla 450",  "cafe_racer"),
      L("Interceptor 650","cafe_racer"),
      L("Continental GT", "cafe_racer"),
    ],
  },
  {
    name: "Lifan", slug: "lifan", hasLogo: true, category: "moto",
    models: [
      L("KP 150",    "naked"),
      L("KPS 150",   "naked"),
      L("KP 200",    "naked"),
      L("KPS 200",   "racing"),
      L("X-Pect 150","enduro"),
    ],
  },
  {
    name: "TVS", slug: "tvs", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/TVS_logo_%282024%29.png/250px-TVS_logo_%282024%29.png",
    models: [
      L("Sport 100",     "naked"),
      L("Apache RTR 160","naked"),
      L("Apache RTR 200","naked"),
      L("Apache RR 310", "racing"),
      L("Ronin 225",     "cafe_racer"),
    ],
  },
  {
    name: "Benelli", slug: "benelli", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Benelli_logo_2019.png",
    models: [
      L("TNT 135",      "naked"),
      L("TNT 150i",     "naked"),
      L("TNT 300",      "naked"),
      L("Leoncino 250", "cafe_racer"),
      L("TRK 502",      "touring"),
      L("TRK 800",      "touring"),
    ],
  },
  {
    name: "Ducati", slug: "ducati", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ducati_red_logo.svg/250px-Ducati_red_logo.svg.png",
    models: [
      L("Monster 797",    "naked"),
      L("Monster 937",    "naked"),
      L("Scrambler 800",  "cafe_racer"),
      L("Scrambler Icon", "cafe_racer"),
      L("Panigale V2",    "racing"),
      L("Panigale V4",    "racing"),
      L("Multistrada V2", "touring"),
      L("Diavel V4",      "cruiser"),
    ],
  },
  {
    name: "Harley-Davidson", slug: "harley-davidson", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Harley-Davidson_logo.svg/250px-Harley-Davidson_logo.svg.png",
    models: [
      L("Sportster S",        "cruiser"),
      L("Iron 883",           "cruiser"),
      L("Iron 1200",          "cruiser"),
      L("Fat Boy",            "cruiser"),
      L("Fat Bob",            "cruiser"),
      L("Street Bob",         "cruiser"),
      L("Softail Standard",   "cruiser"),
      L("Road King",          "touring"),
      L("Street Glide",       "touring"),
      L("Electra Glide",      "touring"),
      L("Low Rider S",        "cruiser"),
      L("Pan America 1250",   "enduro"),
    ],
  },
  {
    name: "Triumph", slug: "triumph", hasLogo: true, category: "moto",
    models: [
      L("Street Triple",      "naked"),
      L("Speed Triple",       "naked"),
      L("Tiger 660",          "enduro"),
      L("Tiger 800",          "enduro"),
      L("Tiger 900",          "enduro"),
      L("Tiger 1200",         "touring"),
      L("Bonneville T100",    "cafe_racer"),
      L("Bonneville T120",    "cafe_racer"),
      L("Thruxton RS",        "cafe_racer"),
      L("Speed Twin",         "cafe_racer"),
      L("Rocket 3",           "cruiser"),
      L("Daytona 660",        "racing"),
    ],
  },
  {
    name: "Keeway", slug: "keeway", hasLogo: true, category: "moto",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Keeway_logo.svg/250px-Keeway_logo.svg.png",
    models: [
      L("RKS 125",        "naked"),
      L("Superlight 200", "cafe_racer"),
      L("Patagonia 250",  "enduro"),
      L("V-Twin 250",     "naked"),
      L("K-Light 250V",   "cruiser"),
      L("Blackster 250",  "cruiser"),
      L("Dorado 250",     "cruiser"),
      L("Zahara 125",     "scooter"),
      L("F-Act 50",       "scooter"),
    ],
  },
  {
    name: "Bera", slug: "bera", hasLogo: false, category: "moto",
    models: [
      L("BR 200",       "naked"),
      L("BR 250",       "naked"),
      L("Torpedo 200",  "naked"),
      L("Explorer 200", "enduro"),
      L("Explorer 250", "enduro"),
      L("Ranger 200",   "enduro"),
      L("Ranger 250",   "enduro"),
    ],
  },
  {
    name: "Otro", slug: "otro-moto", hasLogo: false, category: "moto",
    models: [],
  },
]

export const VEHICLE_BRANDS: VehicleBrand[] = [...AUTO_BRANDS, ...MOTO_BRANDS]

export const AUTO_BRANDS_LIST  = AUTO_BRANDS
export const MOTO_BRANDS_LIST  = MOTO_BRANDS

export const BRAND_LOGO_BASE =
  "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized"

export function getBrandLogoUrl(brand: VehicleBrand): string | null {
  if (!brand.hasLogo) return null
  return brand.logoUrl ?? `${BRAND_LOGO_BASE}/${brand.slug}.png`
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
