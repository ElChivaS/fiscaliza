import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { firebaseApp } from "./config"
import type { User } from "firebase/auth"
import type {
  Organization,
  Profile,
  Vehicle,
  Document,
  PlanLimits,
  CreateVehiclePayload,
  ActivityAction,
  ActivityLogEntry,
  QrShare,
  QrShareDocument,
} from "@/types/document.types"

export const db = getFirestore(firebaseApp)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromTimestamp(ts: Timestamp | null | undefined): string | null {
  if (!ts) return null
  return ts.toDate().toISOString()
}

function toFirestoreVehicle(data: DocumentData): Vehicle {
  return {
    id:              data.id,
    organization_id: data.organization_id,
    alias:           data.alias,
    plate:           data.plate,
    brand:           data.brand ?? null,
    model:           data.model ?? null,
    year:            data.year ?? null,
    body_type:       data.body_type ?? null,
    category:        data.category ?? null,
    photo_url:       data.photo_url ?? null,
    plate_photo_url: data.plate_photo_url ?? null,
    is_active:       data.is_active ?? true,
    created_at:      fromTimestamp(data.created_at) ?? new Date().toISOString(),
    updated_at:      fromTimestamp(data.updated_at) ?? new Date().toISOString(),
  }
}

function toQrShare(data: DocumentData): QrShare {
  return {
    id:                data.id,
    organization_id:   data.organization_id,
    vehicle_id:         data.vehicle_id,
    vehicle_alias:      data.vehicle_alias,
    vehicle_plate:      data.vehicle_plate,
    vehicle_photo_url:  data.vehicle_photo_url ?? null,
    plate_photo_url:    data.plate_photo_url ?? null,
    owner_name:         data.owner_name,
    documents:          data.documents ?? [],
    created_at:         fromTimestamp(data.created_at) ?? new Date().toISOString(),
    expires_at:         fromTimestamp(data.expires_at) ?? new Date().toISOString(),
  }
}

function toActivityLogEntry(data: DocumentData): ActivityLogEntry {
  return {
    id:              data.id,
    organization_id: data.organization_id,
    user_id:         data.user_id,
    user_name:       data.user_name,
    action:          data.action,
    target_type:     data.target_type ?? null,
    target_id:       data.target_id ?? null,
    target_label:    data.target_label ?? null,
    created_at:      fromTimestamp(data.created_at) ?? new Date().toISOString(),
  }
}

function toFirestoreDocument(data: DocumentData): Document {
  return {
    id:              data.id,
    vehicle_id:      data.vehicle_id,
    organization_id: data.organization_id,
    type:            data.type,
    side:            data.side ?? null,
    storage_path:    data.storage_path,
    file_name:       data.file_name,
    mime_type:       data.mime_type,
    expires_at:      data.expires_at ?? null,
    issued_at:       data.issued_at ?? null,
    is_current:      data.is_current ?? true,
    uploaded_by:     data.uploaded_by ?? null,
    created_at:      fromTimestamp(data.created_at) ?? new Date().toISOString(),
  }
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export async function createUserProfile(
  user: User,
  fullName?: string
): Promise<{ organizationId: string; fullName: string }> {
  const profileRef = doc(db, "profiles", user.uid)
  const existing   = await getDoc(profileRef)
  if (existing.exists()) {
    const data = existing.data()
    return {
      organizationId: data.organization_id,
      fullName:       data.full_name ?? fullName ?? "Usuario",
    }
  }

  const name = fullName ?? user.displayName ?? user.email?.split("@")[0] ?? "Usuario"

  // Crear organización
  const orgRef = await addDoc(collection(db, "organizations"), {
    name:             `${name}'s Fiscaliza`,
    type:             "personal",
    plan:             "free",
    plan_expires_at:  null,
    stripe_customer_id: null,
    created_at:       serverTimestamp(),
    updated_at:       serverTimestamp(),
  })

  // Crear perfil
  await setDoc(profileRef, {
    organization_id: orgRef.id,
    role:            "owner",
    full_name:       name,
    avatar_url:      user.photoURL ?? null,
    email:           user.email,
  })

  return { organizationId: orgRef.id, fullName: name }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db, "profiles", userId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Profile
}

export async function updateProfile(
  userId: string,
  data: { full_name?: string; avatar_url?: string }
): Promise<void> {
  await updateDoc(doc(db, "profiles", userId), data)
}

// ─── Organization ─────────────────────────────────────────────────────────────

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const snap = await getDoc(doc(db, "organizations", orgId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Organization
}

export async function getPlanLimits(plan: string): Promise<PlanLimits | null> {
  const snap = await getDoc(doc(db, "plan_limits", plan))
  if (!snap.exists()) return null
  return { plan, ...snap.data() } as PlanLimits
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function getVehicles(orgId: string): Promise<Vehicle[]> {
  const q    = query(
    collection(db, "vehicles"),
    where("organization_id", "==", orgId),
    where("is_active", "==", true),
    orderBy("created_at", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toFirestoreVehicle({ id: d.id, ...d.data() }))
}

export async function getVehicle(vehicleId: string): Promise<Vehicle | null> {
  const snap = await getDoc(doc(db, "vehicles", vehicleId))
  if (!snap.exists()) return null
  return toFirestoreVehicle({ id: snap.id, ...snap.data() })
}

export async function createVehicle(
  orgId:   string,
  payload: CreateVehiclePayload
): Promise<string> {
  // Verificar límite de plan
  const profile = await getDoc(doc(db, "organizations", orgId))
  const plan    = profile.data()?.plan ?? "free"
  const limits  = await getPlanLimits(plan)

  if (limits && limits.max_vehicles !== -1) {
    const q    = query(
      collection(db, "vehicles"),
      where("organization_id", "==", orgId),
      where("is_active", "==", true)
    )
    const snap = await getDocs(q)
    if (snap.size >= limits.max_vehicles) {
      throw new Error("vehicle_limit_reached")
    }
  }

  // Verificar patente duplicada (dentro de la organización)
  const plateQ = query(
    collection(db, "vehicles"),
    where("organization_id", "==", orgId),
    where("plate", "==", payload.plate),
    where("is_active", "==", true)
  )
  const plateSnap = await getDocs(plateQ)
  if (!plateSnap.empty) throw new Error("plate_already_exists")

  const ref = await addDoc(collection(db, "vehicles"), {
    organization_id: orgId,
    alias:           payload.alias,
    plate:           payload.plate,
    brand:           payload.brand ?? null,
    model:           payload.model ?? null,
    year:            payload.year ?? null,
    body_type:       payload.body_type ?? null,
    category:        payload.category ?? null,
    is_active:       true,
    created_at:      serverTimestamp(),
    updated_at:      serverTimestamp(),
  })

  return ref.id
}

export async function updateVehicle(
  vehicleId: string,
  data: Partial<Pick<Vehicle, "alias" | "brand" | "model" | "year">>
): Promise<void> {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export async function updateVehiclePhoto(
  vehicleId: string,
  data: Partial<Pick<Vehicle, "photo_url" | "plate_photo_url">>
): Promise<void> {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export async function softDeleteVehicle(vehicleId: string): Promise<void> {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    is_active:  false,
    updated_at: serverTimestamp(),
  })
}

export async function checkPlateExists(plate: string, orgId: string): Promise<boolean> {
  const q    = query(
    collection(db, "vehicles"),
    where("organization_id", "==", orgId),
    where("plate", "==", plate),
    where("is_active", "==", true)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getDocumentsForVehicle(vehicleId: string, orgId: string): Promise<Document[]> {
  const q    = query(
    collection(db, "documents"),
    where("organization_id", "==", orgId),
    where("vehicle_id", "==", vehicleId),
    where("is_current", "==", true)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toFirestoreDocument({ id: d.id, ...d.data() }))
}

export async function getDocumentsForOrg(orgId: string): Promise<Document[]> {
  const q    = query(
    collection(db, "documents"),
    where("organization_id", "==", orgId),
    where("is_current", "==", true)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toFirestoreDocument({ id: d.id, ...d.data() }))
}

export async function insertDocument(data: {
  vehicleId:      string
  orgId:          string
  type:           Document["type"]
  side?:          "front" | "back" | null
  storagePath:    string
  fileName:       string
  mimeType:       string
  expiresAt?:     string | null
  issuedAt?:      string | null
  uploadedBy?:    string | null
}): Promise<void> {
  // Retirar el anterior del mismo tipo (y del mismo lado si aplica).
  // Usamos la query sin filtro de `side` y filtramos en memoria para
  // evitar necesitar un índice compuesto adicional.
  const prevQ = query(
    collection(db, "documents"),
    where("organization_id", "==", data.orgId),
    where("vehicle_id",      "==", data.vehicleId),
    where("type",            "==", data.type),
    where("is_current",      "==", true)
  )
  const prevSnap = await getDocs(prevQ)
  for (const d of prevSnap.docs) {
    const docSide = d.data().side ?? null
    // Si insertamos con lado específico, solo retiramos el mismo lado
    if (!data.side || docSide === data.side) {
      await updateDoc(d.ref, { is_current: false })
    }
  }

  await addDoc(collection(db, "documents"), {
    vehicle_id:      data.vehicleId,
    organization_id: data.orgId,
    type:            data.type,
    side:            data.side ?? null,
    storage_path:    data.storagePath,
    file_name:       data.fileName,
    mime_type:       data.mimeType,
    expires_at:      data.expiresAt ?? null,
    issued_at:       data.issuedAt ?? null,
    is_current:      true,
    uploaded_by:     data.uploadedBy ?? null,
    created_at:      serverTimestamp(),
  })
}

export async function retireDocument(documentId: string): Promise<void> {
  await updateDoc(doc(db, "documents", documentId), { is_current: false })
}

// ─── Activity log ──────────────────────────────────────────────────────────

export async function logActivity(entry: {
  orgId:       string
  userId:      string
  userName:    string
  action:      ActivityAction
  targetType?: "vehicle" | "document" | null
  targetId?:   string | null
  targetLabel?: string | null
}): Promise<void> {
  try {
    await addDoc(collection(db, "activity_log"), {
      organization_id: entry.orgId,
      user_id:         entry.userId,
      user_name:       entry.userName,
      action:          entry.action,
      target_type:     entry.targetType ?? null,
      target_id:       entry.targetId ?? null,
      target_label:    entry.targetLabel ?? null,
      created_at:      serverTimestamp(),
    })
  } catch (err) {
    console.error("[activity_log] fallo al registrar:", err)
  }
}

export async function getActivityLog(orgId: string, count = 50): Promise<ActivityLogEntry[]> {
  const q    = query(
    collection(db, "activity_log"),
    where("organization_id", "==", orgId),
    orderBy("created_at", "desc"),
    limit(count)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toActivityLogEntry({ id: d.id, ...d.data() }))
}

// ─── QR shares (landing pública temporal) ───────────────────────────────────

export const QR_SHARE_TTL_MS = 5 * 60 * 1000

export async function createQrShare(entry: {
  orgId:            string
  vehicleId:        string
  vehicleAlias:     string
  vehiclePlate:     string
  vehiclePhotoUrl:  string | null
  platePhotoUrl:    string | null
  ownerName:        string
  documents:        QrShareDocument[]
}): Promise<string> {
  const ref = await addDoc(collection(db, "qr_shares"), {
    organization_id:   entry.orgId,
    vehicle_id:         entry.vehicleId,
    vehicle_alias:      entry.vehicleAlias,
    vehicle_plate:      entry.vehiclePlate,
    vehicle_photo_url:  entry.vehiclePhotoUrl,
    plate_photo_url:    entry.platePhotoUrl,
    owner_name:         entry.ownerName,
    documents:          entry.documents,
    created_at:         serverTimestamp(),
    // No usar serverTimestamp() aquí: necesitamos "ahora + 5min", no la hora de escritura.
    expires_at:         Timestamp.fromMillis(Date.now() + QR_SHARE_TTL_MS),
  })
  return ref.id
}

export async function getQrShare(id: string): Promise<QrShare | null> {
  const snap = await getDoc(doc(db, "qr_shares", id))
  if (!snap.exists()) return null
  return toQrShare({ id: snap.id, ...snap.data() })
}
