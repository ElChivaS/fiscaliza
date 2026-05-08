# DocuVault Chile — Prompt para Claude Code
# Stack: React + Next.js 14 (App Router)

---

## Contexto del proyecto

Construye **DocuVault Chile**, un SaaS web progresivo (PWA) que funciona como bóveda digital de documentos vehiculares para el mercado chileno. El producto resuelve un problema concreto: durante las fiscalizaciones de tránsito, los conductores deben presentar hasta 4 documentos distintos (licencia, revisión técnica, permiso de circulación y SOAP). DocuVault los centraliza en un solo lugar, optimizado para ser mostrado desde el celular al fiscalizador en segundos.

**Modelo de negocio:** Freemium. Free tier permanente con 1 vehículo. Plan Pro (~$4.990 CLP/mes) con vehículos ilimitados y alertas. Plan Business (~$14.990 CLP/mes) para flotas con múltiples usuarios.

**Target:** Personas naturales (B2C) con uno o más vehículos, y empresas pequeñas con flotas (B2B SMB).

**Perfil técnico:** Solopreneur. El proyecto debe ser mantenible por una sola persona.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 con App Router |
| Lenguaje | TypeScript strict (sin `any`) |
| Estilos | Tailwind CSS 4 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage + RLS) |
| State management | Zustand |
| PWA / Offline | next-pwa |
| PDF rendering | pdfjs-dist (carga dinámica) |
| Pagos | Stripe + Fintoc (Fase 2) |
| Deploy | Vercel |
| Analytics | Plausible |
| Monitoreo | Sentry |

---

## Tipografía y diseño

- **Fuente display:** Syne (700, 800) — headlines y patentes
- **Fuente cuerpo:** DM Sans (300, 400, 500)
- **Paleta modo light:** background `#f5f3ef`, surface `#ffffff`, ink `#111010`, muted `#888580`
- **Paleta modo dark (viewer):** background `#0a0a0a`, surface `#141414`
- **Estados de documentos:** valid `#22c55e`, expiring `#f59e0b`, expired `#ef4444`
- **Estilo:** Monochrome minimalista. Sin gradientes púrpura/rosa. Cards con `border-radius` generoso (16–20px), bordes sutiles `rgba(0,0,0,0.08)`.

---

## Esquema de base de datos (Supabase / PostgreSQL)

### Enums
```sql
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'business');
CREATE TYPE org_type  AS ENUM ('personal', 'business');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'driver');
CREATE TYPE document_type AS ENUM (
  'licencia', 'revision_tecnica', 'permiso_circulacion', 'soap'
);
```

### Tablas principales

**organizations** — root multi-tenant
- `id` uuid PK
- `name` text NOT NULL
- `type` org_type default 'personal'
- `plan` plan_type default 'free'
- `plan_expires_at` timestamptz nullable
- `stripe_customer_id` text unique nullable
- `created_at`, `updated_at` timestamptz

**profiles** — extiende auth.users
- `id` uuid PK → FK auth.users(id) ON DELETE CASCADE
- `organization_id` uuid FK → organizations(id)
- `role` member_role default 'owner'
- `full_name` text nullable
- `avatar_url` text nullable

**plan_limits** — configuración de planes
- `plan` plan_type PK
- `max_vehicles` smallint (-1 = ilimitado)
- `max_members` smallint
- `expiry_alerts` boolean default false
- `qr_enabled` boolean default false

**vehicles**
- `id` uuid PK
- `organization_id` uuid FK → organizations
- `alias` text NOT NULL (nombre amigable: "Mi Corolla")
- `plate` text NOT NULL UNIQUE (formato chileno: BBXX00 o AB1234)
- `brand`, `model` text nullable
- `year` smallint nullable
- `is_active` boolean default true (soft delete)

**documents**
- `id` uuid PK
- `vehicle_id` uuid FK → vehicles ON DELETE CASCADE
- `organization_id` uuid FK → organizations (desnormalizado para RLS)
- `type` document_type NOT NULL
- `storage_path` text NOT NULL (path en Supabase Storage)
- `file_name`, `mime_type` text NOT NULL
- `expires_at` date nullable
- `issued_at` date nullable
- `is_current` boolean default true
- `uploaded_by` uuid FK → profiles nullable

### Índices clave
```sql
CREATE UNIQUE INDEX idx_document_current_unique
  ON documents(vehicle_id, type) WHERE is_current = true;

CREATE INDEX idx_vehicles_org_active
  ON vehicles(organization_id) WHERE is_active = true;
```

### Triggers críticos
1. **check_vehicle_limit()** — BEFORE INSERT en vehicles: valida límite del plan contra `plan_limits`
2. **retire_previous_document()** — AFTER INSERT en documents: marca el anterior como `is_current = false`
3. **handle_new_user()** — AFTER INSERT en auth.users: crea organization + profile automáticamente
4. **set_updated_at()** — BEFORE UPDATE en organizations y vehicles

### Seed de plan_limits
```sql
INSERT INTO plan_limits (plan, max_vehicles, max_members, expiry_alerts)
VALUES ('free', 1, 1, false), ('pro', -1, 1, true), ('business', -1, 20, true);
```

### Storage
- Bucket: `documents` (privado)
- Path pattern: `{organization_id}/{vehicle_id}/{document_type}/{timestamp}.{ext}`
- Acceso: signed URLs con TTL de 15 minutos (nunca URLs públicas permanentes)

### Row Level Security
Todas las tablas con RLS habilitado. Política base: el usuario solo accede a datos de su `organization_id`. Ejemplo:
```sql
-- vehicles SELECT
auth.uid() IN (
  SELECT p.id FROM profiles p
  WHERE p.organization_id = vehicles.organization_id
)
```

---

## Estructura de archivos Next.js (App Router)

```
docuvault/
├── .env.local                    # variables de entorno (no subir)
├── .env.example                  # documentación de variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── app/
│   ├── layout.tsx                # root layout
│   ├── page.tsx                  # landing page
│   │
│   ├── (auth)/                   # route group sin layout de app
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/page.tsx
│   │
│   ├── (app)/                    # route group autenticado con bottom nav
│   │   ├── layout.tsx            # shell con bottom nav
│   │   ├── dashboard/page.tsx
│   │   ├── vehicles/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # detalle
│   │   │       └── edit/page.tsx
│   │   └── account/page.tsx
│   │
│   └── present/                  # fullscreen sin nav
│       └── [vehicleId]/
│           └── [docType]/page.tsx
│
├── components/
│   ├── ui/                       # genéricos reutilizables
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Spinner.tsx
│   ├── vehicle/
│   │   ├── VehicleCard.tsx
│   │   ├── VehicleForm.tsx       # formulario 2 pasos
│   │   └── VehicleList.tsx
│   ├── document/
│   │   ├── DocumentViewer.tsx    # pantalla fullscreen para fiscalización
│   │   ├── DocumentRow.tsx       # fila en detalle del vehículo
│   │   └── DocumentUploadSlot.tsx
│   └── layout/
│       ├── BottomNav.tsx
│       └── PageHeader.tsx
│
├── hooks/
│   ├── useDocuments.ts
│   ├── useOrganization.ts
│   └── useVehicles.ts
│
├── stores/
│   └── vehiclesStore.ts          # Zustand store
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   ├── server.ts             # createServerClient (para Server Components)
│   │   └── middleware.ts         # refreshSession en middleware.ts raíz
│   └── utils/
│       ├── document.utils.ts     # enrichWithStatus, formatExpiry
│       └── plate.utils.ts        # validación de patentes chilenas
│
└── types/
    ├── database.types.ts         # generado por Supabase CLI
    └── document.types.ts         # tipos de dominio
```

---

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo server-side
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Fase 2:
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Tipos TypeScript del dominio

```typescript
// types/document.types.ts
import type { Database } from './database.types'

export type DocumentType = Database['public']['Enums']['document_type']
export type PlanType     = Database['public']['Enums']['plan_type']
export type MemberRole   = Database['public']['Enums']['member_role']

export type Document     = Database['public']['Tables']['documents']['Row']
export type Vehicle      = Database['public']['Tables']['vehicles']['Row']
export type Profile      = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']

export interface VehicleWithDocuments extends Vehicle {
  documents: DocumentWithStatus[]
}

export interface DocumentWithStatus extends Document {
  expiryStatus: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  daysUntilExpiry: number | null
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  licencia:            'Licencia de conducir',
  revision_tecnica:    'Revisión técnica',
  permiso_circulacion: 'Permiso de circulación',
  soap:                'SOAP',
}

export const DOCUMENT_TYPE_ORDER: DocumentType[] = [
  'licencia', 'revision_tecnica', 'permiso_circulacion', 'soap',
]
```

---

## Lógica de negocio clave

### enrichWithStatus
```typescript
function enrichWithStatus(doc: Document): DocumentWithStatus {
  if (!doc.expires_at) return { ...doc, expiryStatus: 'unknown', daysUntilExpiry: null }
  const days = Math.ceil(
    (new Date(doc.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const expiryStatus = days < 0 ? 'expired' : days <= 30 ? 'expiring_soon' : 'valid'
  return { ...doc, expiryStatus, daysUntilExpiry: days }
}
```

### Validación de patente chilena
```typescript
const PLATE_NEW = /^[A-Z]{4}\d{2}$/ // BBXX00
const PLATE_OLD = /^[A-Z]{2}\d{4}$/ // AB1234
function isValidPlate(plate: string) {
  return PLATE_NEW.test(plate) || PLATE_OLD.test(plate)
}
```

### Subida de documentos
1. Obtener `organization_id` del profile del usuario
2. Path: `{org_id}/{vehicle_id}/{doc_type}/{Date.now()}.{ext}`
3. Upload a Supabase Storage bucket `documents`
4. INSERT en tabla `documents` (el trigger `retire_previous_document` maneja `is_current`)
5. Para mostrar: generar signed URL con TTL 15 min via `supabase.storage.from('documents').createSignedUrl(path, 900)`

### Renderizado de PDF
Usar `pdfjs-dist` con carga dinámica:
```typescript
const pdfjsLib = await import('pdfjs-dist')
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs'
const pdf  = await pdfjsLib.getDocument(signedUrl).promise
const page = await pdf.getPage(1)
// Renderizar en <canvas> escalado al ancho disponible
```

---

## Pantallas y flujos

### Landing (`/`)
- Nav con blur glassmorphism, sticky
- Hero: headline grande (Syne 800), chip animado "Disponible ahora en Chile", phone mockup con badges flotantes
- Sección Problema: 3 items numerados con fondo blanco, borde izquierdo rojo
- Sección Solución: 4 cards con icono, título y descripción
- Pills de documentos cubiertos
- CTA final: fondo negro, headline blanco, botón blanco
- Footer mínimo

### Auth (`/login`, `/register`)
- Layout limpio sin nav de app, con logo + marca arriba y footer legal abajo
- Login: botón Google OAuth + divisor + form email/password con toggle de visibilidad
- Register: igual + campo nombre + indicador de fuerza de contraseña (débil/moderada/fuerte)
- Callback `/auth/callback`: spinner → detecta sesión → redirige a /dashboard
- Mensajes de error en español (mapear errores de Supabase)

### Dashboard (`/dashboard`)
- Header: saludo dinámico (buenos días/tardes/noches) + avatar → cuenta
- Banner de alerta si algún documento vence en ≤30 días (amarillo, animado)
- Lista de VehicleCard (wallet cards grandes)
- Strip de plan al fondo (negro, con CTA de upgrade si es Free)

### VehicleCard
- Strip de color en el top según peor estado (verde/amarillo/rojo/gris)
- Patente con Syne 700 + alias
- Grid 2x2 de doc pills con icono + nombre corto + días restantes
- Footer con label de estado y "Ver documentos →"
- Hover: `translateY(-3px)` con sombra

### Nuevo vehículo (`/vehicles/new`)
- Formulario 2 pasos con progress bar animada
- Paso 1: patente (validación regex + check de disponibilidad en DB con debounce), alias, marca, modelo, año
- Paso 2: 4 slots de documentos (drag & drop + click), cada uno con campo de fecha de vencimiento
- Transición horizontal entre pasos
- Si límite de plan alcanzado: banner de aviso antes del form

### Detalle del vehículo (`/vehicles/[id]`)
- Header: back + patente centrada + menú vertical (⋮)
- Hero: marca/modelo + status pill general
- Lista de DocumentRow (4 filas verticales)
- Botón "Modo presentación" (negro, full width)
- Bottom sheet para opciones de documento: Ver / Reemplazar / Eliminar
- Bottom sheet para opciones de vehículo: Editar / Eliminar

### DocumentRow
- Icono del tipo en cuadrado redondeado (color según estado)
- Nombre + subtítulo (vigente hasta X / vence en N días / sin documento)
- Badge de estado (Vigente / Por vencer / Vencido / Sin doc)
- Botón ⋮ para abrir opciones
- Tap en la fila va al viewer (si tiene documento) o abre opciones (si está vacío)

### Edición de vehículo (`/vehicles/[id]/edit`)
- Patente en solo lectura (no editable, con nota explicativa)
- Campos: alias, marca, modelo, año
- Botones "Descartar" (deshabilitado si no hay cambios) y "Guardar cambios"
- Toast de confirmación al guardar → redirige al detalle
- Zona peligrosa: botón "Eliminar vehículo" (con confirm)

### DocumentViewer (`/present/[vehicleId]/[docType]`)
- Layout fullscreen sin bottom nav, fondo `#0a0a0a`
- Header oscuro: back + patente + nombre del doc + badge de vencimiento
- Área central: documento renderizado (imagen → `<img>`, PDF → `<canvas>` via pdfjs)
- Bottom nav de 4 tabs (licencia, rev. técnica, permiso, SOAP) con:
  - Indicador de estado por tab (punto de color)
  - Línea activa en el top del tab activo
  - Transición al cambiar tab
- `screen.orientation.lock('portrait')` al montar (silenciar error)
- Cache de signed URLs en IndexedDB para acceso offline

### Cuenta (`/account`)
- Avatar + nombre + email + botón editar (inline, no nueva página)
- Card de plan actual (fondo negro)
- Menú: Cambiar contraseña (envío de reset link)
- Menú: Cerrar sesión (rojo)
- App info y links legales
- Modal de planes (bottom sheet):
  - Toggle mensual/anual (anual -20%)
  - 3 cards: Free / Pro / Business
  - Tabla comparativa debajo
  - Plan actual marcado en verde

---

## Middleware de autenticación

```typescript
// middleware.ts (raíz del proyecto)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* get/set/remove helpers */ } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/register')
  const isPublic    = request.nextUrl.pathname === '/'

  if (!session && !isAuthRoute && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## Zustand store de vehículos

```typescript
// stores/vehiclesStore.ts
import { create } from 'zustand'
import type { VehicleWithDocuments } from '@/types/document.types'

interface VehiclesStore {
  vehicles:    VehicleWithDocuments[]
  loading:     boolean
  error:       string | null
  fetchVehiclesWithDocuments: () => Promise<void>
  createVehicle:    (payload: CreateVehiclePayload) => Promise<string>
  updateVehicle:    (id: string, payload: Partial<...>) => Promise<void>
  deleteVehicle:    (id: string) => Promise<void>
  checkPlateExists: (plate: string) => Promise<boolean>
  refreshVehicleDocuments: (vehicleId: string) => Promise<void>
}
```

La lógica de cada acción:
- **fetchVehiclesWithDocuments**: query con join `vehicles → documents` filtrado por `organization_id` del usuario y `is_active = true`. Enriquecer cada documento con `enrichWithStatus`.
- **createVehicle**: INSERT en vehicles. Si el trigger lanza `vehicle_limit_reached`, capturar y relanzar.
- **checkPlateExists**: SELECT count con `head: true` en vehicles donde `plate = X AND is_active = true`.
- **refreshVehicleDocuments**: query solo de documents de un vehicleId específico, actualizar el item en el array local sin refetch completo.

---

## Hook useDocuments

```typescript
// hooks/useDocuments.ts
export function useDocuments(vehicleId: string) {
  // Estado: documents, loading, error
  // fetchDocuments: query documents where vehicle_id + is_current = true
  // getSignedUrl(storagePath): supabase.storage.from('documents').createSignedUrl(path, 900)
  // uploadDocument(file, type, meta):
  //   1. obtener org_id del profile
  //   2. construir path: {org_id}/{vehicle_id}/{type}/{Date.now()}.{ext}
  //   3. upload a Storage
  //   4. INSERT en documents (trigger maneja retire del anterior)
  //   5. refetch documents
}
```

---

## Planes de precios (CLP)

| | Free | Pro | Business |
|---|---|---|---|
| Precio mensual | $0 | $4.990 | $14.990 |
| Precio anual /mes | $0 | $3.990 | $11.990 |
| Vehículos | 1 | Ilimitados | Ilimitados |
| Usuarios | 1 | 1 | Hasta 20 |
| Alertas vencimiento | ✗ | ✓ | ✓ |
| QR verificable | ✗ | ✓ | ✓ |
| Panel de flota | ✗ | ✗ | ✓ |
| Reportes | ✗ | ✗ | ✓ |

---

## Fases del roadmap

**Fase 1 (MVP — este prompt):**
- Auth (email + Google OAuth)
- CRUD de vehículos
- Carga manual de 4 documentos (PDF/imagen)
- Vista de presentación fullscreen optimizada para móvil
- PWA instalable con cache offline básico
- Plan Free operativo

**Fase 2:**
- Stripe + Fintoc (pagos)
- Alertas de vencimiento (email/push)
- QR verificable por documento

**Fase 3:**
- Integración APIs oficiales (Registro Civil, SOAP)
- OCR para extracción automática de fechas

**Fase 4:**
- Roles y permisos (admin, conductor, visualizador)
- Panel de flota y reportes para Business

---

## Convenciones de código

- TypeScript strict, sin `any`
- Componentes en PascalCase, hooks en camelCase con prefijo `use`
- Server Components por defecto en App Router; `'use client'` solo cuando necesario (interactividad, hooks de browser)
- Tailwind para estilos — sin CSS modules salvo casos excepcionales
- Validación de formularios sin librerías externas (validación manual con estado local)
- Manejo de errores: siempre catch + mensaje de error tipado
- Soft delete en vehículos (`is_active = false`), nunca DELETE en documentos (solo `is_current = false`)

---

## Notas legales importantes

- Los documentos contienen RUT, foto y datos sensibles → aplica Ley 19.628 de protección de datos personales en Chile
- Incluir política de privacidad real antes del primer usuario real
- La Ley 21.302 (Chile, 2021) permite presentar documentos vehiculares en formato digital → comunicar esto en la UI y en la landing

---

## Instrucciones para Claude Code

1. Construir en el orden: tipos → lib/supabase → middleware → layouts → componentes UI → hooks → store → páginas
2. Generar primero el SQL de migración completo (`supabase/migrations/001_initial.sql`) con todos los enums, tablas, triggers, RLS e índices
3. Usar `createServerClient` de `@supabase/ssr` en Server Components y `createBrowserClient` en Client Components
4. El `DocumentViewer` es la pantalla más crítica del producto — priorizarla y asegurarse de que funciona perfectamente en móvil
5. La patente en edición de vehículo es de solo lectura — no generar UI para cambiarla
6. Los límites de plan se validan en DB (trigger) Y en el frontend (UX preventiva)
7. Nunca URLs públicas permanentes para documentos — siempre signed URLs con TTL
8. Probar que el flujo completo funciona: registro → crear vehículo → subir documento → modo presentación
