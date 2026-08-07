# Programa de testers: mes gratis de Pro + flujo de bienvenida

> Plan de diseño — rama `feature/testers`. Todavía no implementado; se actualiza a medida que se trabaja o se ajustan decisiones.

## Contexto

El usuario reclutó testers para probar FISCALIZA y quiere agradecerles con un mes gratis del plan Pro. Para eso se necesita: (1) marcar en la cuenta que alguien es tester, (2) un flujo de bienvenida antes del registro normal que le explique el trato y le pida un par de datos, y (3) dejarlo activar su mes de Pro gratis **cuando él quiera**, dentro de un plazo de un año desde que se hizo tester.

Decisiones ya confirmadas con el usuario:
- **Tier**: Pro (no Business).
- **El Pro NO se activa en el registro** — el tester queda marcado como tester (`is_tester: true`) pero con plan Free normal. Es el propio tester quien decide más adelante, desde la app, cuándo activar su mes gratis (self-service, un botón).
- **Plazo para activar**: tiene hasta un año desde que se registró como tester (`tester_since + 1 año`) para activarlo. Si nunca lo activa dentro de ese año, pierde el beneficio. Una vez que lo activa, el mes de Pro corre 30 días desde ese momento (no desde el registro).
- **Punto de entrada al registro**: link especial `/register?tester=1`, compartido directamente por el usuario con la gente reclutada — sin código de invitación ni ruta nueva.
- **Campo "vehículo"**: texto libre, se guarda junto con nombre/apellido/email en una colección nueva `testers` (leads) apenas se completa el modal, independiente de si termina el registro real.
- **Vencimiento del mes gratis una vez activado**: chequeo al cargar sesión — si `plan_expires_at` ya pasó, se baja el plan a Free en ese momento (no hay Cloud Functions en este proyecto, así que no hay cron real; esto corre en el cliente cuando la persona abre la app).

## Modelo de datos

**`profiles`** (`types/database.types.ts`) — agrega:
- `is_tester: boolean` — marca permanente de que esta persona es parte del programa de testers.
- `tester_since: string` — fecha en que se registró como tester (al completar el registro con `?tester=1`). Es el punto de partida del plazo de un año para activar el mes gratis.

**`organizations`** — agrega:
- `is_tester_promo: boolean` — `true` solo mientras el Pro actual esté **activo** y venga del regalo a testers (no de una suscripción paga real). Arranca en `false` al registrarse; pasa a `true` recién cuando el tester activa su mes.
- `tester_promo_start: string | null` — cuándo activó su mes gratis. `null` hasta que lo activa; **una vez seteado, no se vuelve a limpiar** (incluso después de vencer) — es lo que usa el sistema para saber "este tester ya usó su beneficio, no puede activarlo de nuevo".
- `tester_promo_end: string | null` — `tester_promo_start + 30 días`. Mismo valor que `plan_expires_at` en ese momento.
- Reutiliza los campos que YA existen y que YA lee el resto de la app para gatear features por plan: `plan` (queda `"free"` hasta la activación, pasa a `"pro"` al activar) y `plan_expires_at` (es el que efectivamente usa `getPlanLimits`/`useOrganization`; se limpia a `null` cuando vence, `tester_promo_start`/`end` quedan como registro histórico).

**Elegibilidad para activar** (se calcula, no se guarda): `is_tester === true && tester_promo_start === null && ahora < tester_since + 1 año`.

**Nota de naming**: uso snake_case (`is_tester`, no `isTester`) para seguir la convención que ya tiene el resto del schema (`full_name`, `organization_id`, `plan_expires_at`). Si preferís camelCase avisame y lo cambio antes de implementar.

**Nueva colección `testers`** (leads, no requiere cuenta creada todavía):
```
full_name:    string
email:        string
vehicle_note: string   // texto libre, ej. "Toyota Corolla 2019"
created_at:   timestamp
```
Se define como interfaz suelta en `types/document.types.ts` (mismo criterio que ya usa `QrShare`/`QrShareDocument` ahí — no todo pasa por el objeto `Database` tipo-Supabase).

## Reglas de seguridad (`firestore.rules`)

`testers` es la única colección que se escribe **sin sesión** (el modal aparece antes del registro). Se agrega un bloque nuevo con validación mínima para evitar basura/abuso, sin exigir auth:
```
match /testers/{leadId} {
  allow create: if request.resource.data.full_name is string
    && request.resource.data.full_name.size() > 0 && request.resource.data.full_name.size() < 200
    && request.resource.data.email is string
    && request.resource.data.email.size() > 0 && request.resource.data.email.size() < 200
    && request.resource.data.vehicle_note is string
    && request.resource.data.vehicle_note.size() < 300;
  allow read, update, delete: if false;
}
```
`profiles`/`organizations` no necesitan cambios de reglas: sus `allow create` ya permiten cualquier campo adicional al crear la cuenta (la restricción a `full_name`/`avatar_url` en `profiles` es solo para `update`, no `create`).

## Flujo de registro (no activa el Pro todavía)

1. Usuario entra a `fiscaliza.app/register?tester=1`.
2. `app/(auth)/register/page.tsx` detecta el query param y muestra `TesterWelcomeModal` (nuevo componente) antes que nada: mensaje de bienvenida + "por ayudarnos a testear te vamos a regalar un mes de Pro, lo activás cuando quieras dentro del próximo año" + form corto (Nombre, Apellido, Email, Vehículo).
3. Al enviar el form: se crea el lead en `testers` (vía nueva función `createTesterLead()` en `lib/firebase/firestore.ts`, sin necesidad de sesión), se cierra el modal, y se prellenan `name`/`email` en el form de registro que queda debajo — el usuario solo tiene que poner su contraseña. Un banner chico arriba del form ("Registrándote como tester 🎉") mantiene el contexto visible.
4. Al enviar el registro normal (`handleRegister` → `registerWithEmail`), se marca `profiles.is_tester = true` y `profiles.tester_since = now` en el mismo flujo de `createUserProfile`. La organización se crea **normal, en Free** — no se toca `plan` ni ningún campo de promo todavía.
5. Si el usuario cierra el modal sin completar el form, no pasa nada especial — sigue el registro normal (Free, sin `is_tester`), sin lead guardado.

Un registro normal por `/register` (sin el query param) no se ve afectado en nada.

## Activación del mes gratis (self-service, cuando el tester quiera)

En `app/(app)/account/page.tsx` (o donde se muestre el plan actual), si `profile.is_tester` es `true` y todavía es elegible (`tester_promo_start === null && ahora < tester_since + 1 año`), se muestra un banner: **"Eres tester — tienes un mes de Pro gratis para activar, válido hasta DD/MM/AAAA"** con un botón **"Activar mi mes gratis"**.

Al hacer clic: nueva función `activateTesterPromo(orgId)` en `lib/firebase/firestore.ts` hace `updateDoc` en la organización con `plan: "pro"`, `is_tester_promo: true`, `tester_promo_start: now`, `tester_promo_end: now + 30 días` (constante `TESTER_PROMO_DURATION_MS`, mismo patrón que ya existe `QR_SHARE_TTL_MS`), y `plan_expires_at: now + 30 días`.

Mientras el Pro de tester está activo (`is_tester_promo === true`), el mismo banner cambia a informativo: "Pro gratis activo hasta DD/MM". Si la ventana de un año pasó sin que lo active (`tester_promo_start === null && ahora >= tester_since + 1 año`), no se muestra nada — perdió el beneficio.

## Vencimiento automático (una vez activado)

En `stores/authStore.ts`, dentro de `init()`, justo después de cargar `organization`: si `organization.is_tester_promo` es `true` y `organization.plan_expires_at` ya pasó, se llama a una función nueva `expireTesterPromo(orgId)` (`lib/firebase/firestore.ts`) que hace `updateDoc` a `plan: "free"`, `is_tester_promo: false`, `plan_expires_at: null` — **sin tocar `tester_promo_start`/`tester_promo_end`**, para que quede el registro de que ya usó su beneficio y no lo pueda activar de nuevo — y se refleja el cambio en el store antes de terminar de cargar. Corre cada vez que la persona abre la app — si no la vuelve a abrir después de vencer, sigue viendo Pro hasta la próxima sesión (aceptado, es la opción que elegiste).

## Fuera de alcance (para no inflar el plan)

- Panel de administración para ver la lista de `testers`/convertir leads en cuenta — se consultan directo desde la consola de Firebase por ahora.
- Vincular el lead de `testers` con el `profile` creado después (marcar el lead como "convertido") — se puede agregar más adelante si hace falta reportar conversión.
- Cron/Cloud Function real para el vencimiento o para avisar "te queda 1 mes de plazo para activar" — como se acordó, todo corre al cargar sesión, no en background.
- Recordatorios automáticos (email/push) cerca de que se cumpla el año sin activar — se podría agregar después.

## Archivos a tocar

- `types/database.types.ts` — campos nuevos en `profiles` (`is_tester`, `tester_since`) y `organizations` (`is_tester_promo`, `tester_promo_start`, `tester_promo_end`).
- `types/document.types.ts` — interfaz `TesterLead`, constante `TESTER_PROMO_DURATION_MS`.
- `firestore.rules` — bloque nuevo para `testers`.
- `lib/firebase/firestore.ts` — `createUserProfile` acepta flag de tester opcional y setea `is_tester`/`tester_since`; `createTesterLead()`; `activateTesterPromo()`; `expireTesterPromo()`.
- `lib/firebase/auth.ts` — `registerWithEmail` recibe y reenvía el flag de tester.
- `stores/authStore.ts` — chequeo de vencimiento en `init()`.
- `components/auth/TesterWelcomeModal.tsx` (nuevo) — el modal de bienvenida + form.
- `app/(auth)/register/page.tsx` — detecta `?tester=1`, muestra el modal, prellena el form, banner de contexto.
- `app/(app)/account/page.tsx` — banner de elegibilidad/activación/estado del mes gratis de tester.

## Verificación

1. `npm run build`.
2. Con el usuario de prueba: visitar `/register?tester=1`, completar el modal, confirmar que se creó el doc en `testers` (chequeo directo con el Admin SDK), completar el registro, y confirmar que el `profile` quedó con `is_tester: true` y `tester_since` seteado, y que la `organization` sigue en `plan: "free"` (el Pro **no** se activó solo).
3. En `/account`, confirmar que aparece el banner de "activar mi mes gratis" y que al hacer clic la organización pasa a `plan: "pro"`, `is_tester_promo: true`, `plan_expires_at` ~30 días adelante.
4. Confirmar que `/register` sin el query param sigue registrando normal (Free, sin ningún campo de tester).
5. Forzar el vencimiento del mes ya activado (poner `plan_expires_at` en el pasado vía Admin SDK), recargar la app logueado, y confirmar que el plan vuelve a `free`, `is_tester_promo` a `false`, y que el banner de "activar" **no** vuelve a aparecer (porque `tester_promo_start` ya está seteado).
6. Forzar el vencimiento del plazo de un año sin activar (poner `tester_since` hace más de un año vía Admin SDK, sin activar nunca), recargar, y confirmar que el banner de activación ya no aparece.
