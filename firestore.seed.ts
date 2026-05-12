/**
 * Script de seed para plan_limits en Firestore.
 * Ejecutar con: npx ts-node --project tsconfig.json firestore.seed.ts
 * (Requiere Firebase Admin SDK configurado)
 */
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import * as fs from "fs"

const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-admin-sdk.json", "utf8")
)

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const plans = [
  { id: "free",     max_vehicles: 1,  max_members: 1,  expiry_alerts: false, qr_enabled: false },
  { id: "pro",      max_vehicles: -1, max_members: 1,  expiry_alerts: true,  qr_enabled: true  },
  { id: "business", max_vehicles: -1, max_members: 20, expiry_alerts: true,  qr_enabled: true  },
]

async function seed() {
  for (const plan of plans) {
    const { id, ...data } = plan
    await db.collection("plan_limits").doc(id).set(data)
    console.log(`✓ plan_limits/${id}`)
  }
  console.log("Seed completado")
}

seed().catch(console.error)
