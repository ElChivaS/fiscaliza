# FISCALIZA — Handoff

> Última actualización: 2026-10-20 · Rama activa: `master` (limpia, sin cambios pendientes)
> Este documento se actualiza **únicamente** cuando se pide explícitamente "poner todo al día" (commit + push + merge a `master`). **NO** se commitea/pushea de forma automática. Sirve para retomar el proyecto sin reconstruir el contexto desde cero.

## ⚠️ Al retomar trabajo: verificar la rama primero

Antes de tocar código, correr `git branch --show-current` y comparar con la "Rama activa" indicada arriba. Si el HANDOFF menciona una rama de feature (mergeada o no), cambiarse a esa rama (o confirmar con el usuario) **antes** de empezar — no asumir que se trabaja en `master` solo porque el status esté limpio. Esto evita retomar una iniciativa en la rama equivocada cuando la anterior sigue abierta o recién se mergeó.

## Contexto

FISCALIZA es una PWA (Next.js 16 + Firebase) que centraliza los documentos vehiculares obligatorios en Chile (licencia, revisión técnica, permiso de circulación, SOAP) para mostrarlos a un fiscalizador desde el celular. Modelo freemium (Free/Pro/Business).

## Estado actual

**Sesión 2026-10-20 — demo Propuesta D y despliegue de reglas Firebase** (rama `feature/firebase-rules-update`):

- **Reglas desplegadas**: `firestore.rules` y `storage.rules` publicados en `fiscaliza-61539` con `npx firebase-tools deploy --only firestore:rules,storage --project fiscaliza-61539`. Storage ahora aplica límite `<10MB`, `contentType` `application/pdf|image/.*` y validación cruzada org vía `firestore.get()` (requiere IAM correcto). Firestore mantiene las reglas actuales (incluida `testers` sin sesión).

**Sesión 2026-10-20 — demo Propuesta D sobre `master`** (merge `118f766` desde `feature/demo-propuesta-d`):

- **Mockups/demo D completo**: `_mockups/demo-d/` con 16 vistas HTML navegables, CSS base/app, flujo auth/dashboard/vehículo/QR/modo presentación. `d-00-landing.html` restaurado idéntico a `_mockups/home-d-senal.html` (644 líneas). Enlaces entre todas las vistas funcionales.
- **Propuesta D aplicada en mockups**: paleta/estilo D, ajustes móviles (tap targets ≥44px, safe-area, touch-action), ancho de app subido a `--app-w:440px` para evitar saltos de línea en botones.
- **Landing D enlazada**: botones "Crear cuenta"/CTAs apuntan a `d-01-login.html` en el demo; login enlaza directo a dashboard (sin validación).
- **Presentación/galería**: ajustes en `_mockups/presentacion.html`.
- **Sistema de diseño**: `DESIGN.md` añadido con tokens/reglas.
- **Skills**: `.agents/skills/anti-ui-slop/`, `.agents/skills/web-design-guidelines/`, `.claude/skills/web-design-guidelines/` versionados.

**Sesión 2026-10-19 — limpieza y correcciones sobre `master`** (commits `ad400bb`, `a405583`, `0517d5a`, `a401fb6`, `905f45e`):

- Catálogo: entrada **GAC** corregida en `autos.json` (`id`/`name`/`country`/`website` tenían typos; 8 modelos reclasificados: GS3 Power B-SUV, GS4 Power/Emzoom/Emkoo C-SUV, GS8 D-SUV, Empow sedán C, Aion ES sedán C eléctrico, Aion Y C-SUV eléctrico). Años y segmentos son criterio razonado, no research 1 a 1 — misma salvedad que el resto del catálogo.
- Landing: CTAs cambiados a "Ingresa" / "Prueba Fiscaliza Gratis".
- Dominio canonical: `lib/config/site.ts` corregido a `fiscaliza.brandifyia.com` (la variante `brandifyai.com` no responde; la nueva sirve la app). `.env.example` ahora sí está versionado (`!.env.example` en `.gitignore`) y su comentario quedó alineado.
- Seguridad: `storage.rules` ahora limita subidas a <10 MB y `application/pdf|image/.*` (hallazgo #5 del informe). `firebase-admin` movido a `devDependencies` (solo lo usa `firestore.seed.ts`) y se eliminó `lib/firebase/admin.ts` (código muerto).
- Archivos personales (nómina, PRT, SOAP) movidos de `public/` a `_private/`, que quedó ignorada en git. Nunca deben volver a `public/`: ese directorio se sirve público en Vercel.
- `npm run build` pasó después de los cambios.

**`feature/testers` mergeado a `master`** (commit `9f9f23a`, merge de `34ce2e5`) — programa de testers completo: modal de bienvenida en el registro, captura de leads, y mes gratis de Pro self-service. Diseño completo en `PLAN-testers.md` (queda en el repo como referencia).

- **Registro**: `fiscaliza.app/register?tester=1` muestra `TesterWelcomeModal` (nombre, apellido, email, vehículo de texto libre) antes del form normal. Al enviarlo se crea un lead en la colección nueva `testers` (sin sesión — regla de Firestore con validación mínima, ya desplegada a producción) y se prellenan nombre/email en el registro. La cuenta se crea con `profiles.is_tester: true` y `profiles.tester_since`, pero **el plan Pro no se activa solo** — queda en Free.
- **Activación self-service**: desde `/account`, si el usuario es tester y no lo activó todavía (dentro del año de plazo desde `tester_since`), aparece un banner con botón "Activar mi mes gratis" → `activateTesterPromo()` pone `organization.plan: "pro"` por 30 días (`is_tester_promo`, `tester_promo_start/end`, `plan_expires_at`).
- **Vencimiento**: se chequea al cargar sesión (`stores/authStore.ts`, no hay Cloud Functions en este proyecto) — si `plan_expires_at` ya pasó, `expireTesterPromo()` vuelve el plan a Free sin permitir reactivar (no limpia `tester_promo_start`, queda como registro de que ya lo usó).
- Verificado de punta a punta con una cuenta de prueba real (creada y eliminada por completo al terminar): registro → lead capturado → activación → vencimiento forzado → todo se comportó como se diseñó.

**`fix/doc-view` mergeado a `master`** (commit `e7f4985`), más el modelo **Chevrolet Prisma** re-agregado a `autos.json` (commit `289c46f`) — se había perdido al migrar la fuente de datos del catálogo de `vehicles.ts` (hardcodeado) a los JSON.

`fix/doc-view` resolvió el bug reportado: "los documentos no se muestran correctamente al entrar en modo presentación". Tenía **dos causas independientes**:

1. **Race condition de auth** en `app/present/[vehicleId]/[docType]/page.tsx` y en `app/(app)/vehicles/[id]/page.tsx`: ambas páginas leían Firestore apenas montaban, sin esperar a que Firebase Auth terminara de rehidratar la sesión en cada carga completa de página (refresh, entrada directa, cold-start de PWA) — la consulta salía con `request.auth` null y Firestore la rechazaba con "Missing or insufficient permissions". Arreglado esperando el primer `onAuthStateChanged`/gateando en `profile` (mismo patrón que ya usaba el dashboard, ver comentario ahí).
2. **Permiso de IAM faltante para el lookup cruzado Storage→Firestore**: `storage.rules` usa `firestore.get(...)` dentro de `userOrgId()`, y el proyecto nunca tuvo aprovisionado el rol de IAM necesario — todas las subidas/lecturas fallaban con `storage/unauthorized` (403). Se solucionó desde la consola de Firebase (Storage → Reglas → "Corregir problema" → "Adjuntar permisos").

**Ramas ya mergeadas a `master`** (más reciente primero): `feature/firebase-rules-update` (despliegue reglas Firebase), `feature/demo-propuesta-d` (demo D navegable + ajustes), `feature/testers` (mes gratis de Pro para testers), `fix/doc-view` (race condition de auth + permiso IAM de Storage), `style/vehicle-form-ui` (grid de marcas a 3 columnas, solo logo), `feature/vehicle-db` (integración del catálogo extendido autos.json/motos.json), `fix/nuevo-vehiculo`, `feature/feedback`, `feature/SEO-tech-base`.

## Próximos pasos

1. **Deploy de reglas**: completado (2026-10-20) desde `feature/firebase-rules-update` con `npx firebase-tools deploy --only firestore:rules,storage --project fiscaliza-61539`.
2. Revisar con el usuario los campos marcados con criterio propio (no verificados 1 a 1) en `autos.json`/`motos.json`: `availableInChile`, `discontinued`, `yearsAvailable`, `origin` — incluye los años/segmentos de GAC corregidos en esta sesión.
3. Decidir qué hacer con las 4 marcas de moto sin logo (QJMotor, Voge, Zontes, Kove) y con Bera (auto) — no hay fuente de logo libre confiable todavía (por ahora muestran el nombre en vez de logo).
4. Acomodar UI de input para escribir marca y modelo cuando usuario selecciona 'otro' a agregar vehículo.
5. Compartir el link `?tester=1` con los testers reclutados y revisar la colección `testers` en Firebase Console de vez en cuando para ver los leads (no hay panel propio, es lectura directa desde la consola — ver Fuera de alcance en `PLAN-testers.md`).
6. **Deuda de dependencias**: `npm audit` reporta 31 vulnerabilidades en producción (2 críticas vía `postcss`/`sharp` de `next`, 16 altas) y `pdfjs-dist` requiere salto mayor (5.x → 6.x). No se tocaron en esta sesión; evaluar upgrade de `next` (hoy 16.2.6) y `pdfjs-dist` como tarea aparte.

## Decisiones tomadas y por qué

- **El mes gratis de tester es self-service, no automático** — el usuario aclaró explícitamente que no quería que el Pro se activara solo en el registro; el tester decide cuándo activarlo, con un año de plazo desde que se registró. Cambió el diseño inicial del plan a mitad de sesión — ver `PLAN-testers.md` para el detalle completo.
- **`tester_promo_start`/`tester_promo_end` en `organizations` no se limpian al vencer** (a diferencia de `plan_expires_at`, que sí vuelve a `null`) — es la forma en que el sistema sabe que ese tester ya usó su beneficio y no debe poder reactivarlo. Si algún día hace falta "resetear" a un tester para darle otra oportunidad, hay que limpiar esos dos campos a mano.
- **Comunicación con el usuario**: pidió explícitamente español neutro sin voseo argentino (ni en el chat ni en texto de UI) — corregirlo si aparece, incluyendo en cualquier copy nuevo que se escriba en componentes.
- **Schema simplificado** — el usuario pidió sacar `fuelTypes`, `electricType`, `transmissions`, `drivetrain`/`driveType`, `seats` de ambos catálogos, y además `origin` solo de `autos.json` (en `motos.json` se mantuvo `origin`). Motivo: esos campos se consideraron innecesarios para el caso de uso actual de la app.
- **`discontinued` ≠ `availableInChile`** — son independientes a propósito: un modelo discontinuado (ya no se vende nuevo) puede seguir con `availableInChile: true` porque el dueño actual todavía necesita poder registrarlo en la app. `availableInChile: false` se reserva para modelos que nunca llegaron a Chile o son demasiado nicho/nuevos.
- **Marcas del catálogo viejo que no aparecían en las listas nuevas del usuario se agregaron igual** (Haval, Mercedes-Benz, Audi en autos; Lifan, Keeway, Bera en motos) — instrucción explícita del usuario para no perder cobertura existente.
- **Logos**: se prioriza reusar `raw.githubusercontent.com/filippofilip95/car-logos-dataset` (ya usado en el catálogo viejo) y se cae a Wikimedia Commons (rasterizado a PNG vía su servicio de miniaturas, `?width=200`, para evitar problemas de SVG en `next/image`) cuando la marca no está en ese dataset. Si ninguna fuente confiable tiene el logo, se deja `logo: null` (fallback de letra en la UI) en vez de inventar una URL.
- **Dominio canonical definitivo: `fiscaliza.brandifyia.com`** — verificado el 2026-10-19: responde y sirve la app; `fiscaliza.brandifyai.com` no responde. El cambio en `site.ts` fue una corrección, no un typo.
- **`.env.example` se versiona** (`!.env.example`) — es plantilla sin secretos; los `.env` reales siguen ignorados.
- **`_private/` para documentos sensibles locales** — nunca se sirven ni se commitean; `public/` es público por definición en Vercel.
- **Deploy de reglas queda pendiente de decisión** — se acordó tratarlo como último punto, después de revisar el estado real en Firebase Console.
- **`components/vehicle/BrandPicker.tsx`** — el fallback de logo roto se reescribió para usar estado de React (`brokenLogos`) en vez de mutar el DOM con `innerHTML`, que rompía la reconciliación de React al re-renderizar la grilla completa (bug real encontrado en sesión anterior).

## Cómo correr el proyecto

```
npm run dev      # local, puerto 3000 (o el siguiente libre)
npm run build    # build de producción — correrlo después de cualquier cambio de datos/config
```

Firebase real detrás (Auth + Firestore + Storage) — no hay mocks, así que probar flujos que requieren sesión necesita login real o inyectar la cookie `fiscaliza-session` + un usuario válido.

## Riesgos / cosas a tener ojo

- **`organizations` permite update de cualquier campo** (`firestore.rules:39`): cualquier miembro puede auto-asignarse `plan: "pro"` desde devtools. Riesgo aceptado mientras no haya pagos reales; al integrar Stripe habrá que mover los cambios de plan a servidor (Cloud Function/Route Handler) o restringir campos y aceptar que el cliente sigue pudiendo tocar la promo de testers.
- **Rules sin CI/CD**: el deploy es manual; editar `firestore.rules`/`storage.rules` no cambia producción hasta correr `firebase deploy --only firestore:rules,storage:rules`.
- **La elegibilidad de un año para activar el mes de tester se calcula en el cliente** (`app/(app)/account/page.tsx`, comparando `tester_since` contra la fecha actual) — no hay ninguna regla de Firestore ni chequeo de servidor que la haga cumplir. Un usuario que manipule el cliente técnicamente podría llamar `activateTesterPromo` fuera de plazo. Riesgo bajo (no hay incentivo económico real de por medio, son pocos testers de confianza), pero vale la pena tenerlo presente si el programa crece.
- **El patrón de race condition de auth (ver "Estado actual") puede repetirse en otras páginas** que llamen a Firestore/Storage inmediatamente al montar sin gatear en `profile`/`useOrganization()` — solo se auditaron y arreglaron `present/page.tsx` y `vehicles/[id]/page.tsx` porque son las que reportó el usuario. Si aparece otro "no carga X hasta que refresco de nuevo", sospechar de esto primero.
- La migración de `lib/data/vehicles.ts` a los JSON se verificó con `npm run build`, un script de Node (conteos, slugs únicos, "Otro" al final) y una pasada visual real en `/vehicles/new` (ver Estado actual) — sin issues encontrados.
- Queda una cuenta de test en el proyecto Firebase real (`fiscaliza-61539`): `claude-test-vehicle-db@fiscaliza-test.dev` con su organización asociada. No hay emulador local configurado en el repo, así que cualquier test futuro contra `/register` o `/login` también va a tocar el proyecto real — tenerlo presente.
- Los datos de `yearsAvailable`, `origin`, `discontinued` y `availableInChile` a nivel de modelo son criterio razonado, no verificación exhaustiva contra ficha técnica oficial de cada uno de los 660 modelos — vale la pena un ojo humano antes de tratarlos como fuente de verdad absoluta.
