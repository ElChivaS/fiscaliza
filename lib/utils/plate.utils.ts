const PLATE_NEW = /^[A-Z]{4}\d{2}$/ // BBXX00 — formato nuevo
const PLATE_OLD = /^[A-Z]{2}\d{4}$/ // AB1234 — formato antiguo

export function isValidPlate(plate: string): boolean {
  const normalized = plate.toUpperCase().replace(/\s|-/g, "")
  return PLATE_NEW.test(normalized) || PLATE_OLD.test(normalized)
}

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s|-/g, "")
}

export function formatPlate(plate: string): string {
  const p = normalizePlate(plate)
  if (PLATE_NEW.test(p)) return `${p.slice(0, 4)}·${p.slice(4)}`
  if (PLATE_OLD.test(p)) return `${p.slice(0, 2)}·${p.slice(2)}`
  return p
}
