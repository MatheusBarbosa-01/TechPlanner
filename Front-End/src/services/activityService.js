// Serviço de atividades — operações CRUD no Firestore
// Coleção: 'activities'

import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, query, where,
  Timestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'activities'

// ── Criar atividade ──────────────────────────────────────────────
export async function createActivity(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    dueDate: Timestamp.fromDate(new Date(data.dueDate)),
    createdAt: Timestamp.now()
  })
  return docRef.id
}

// ── Buscar atividades (leitura única) ────────────────────────────
export async function getActivities(classId = null) {
  const q = classId
    ? query(collection(db, COL), where('classId', '==', classId))
    : query(collection(db, COL))

  const snap = await getDocs(q)
  const docs = snap.docs.map(d => docToActivity(d))
  // Ordena client-side para evitar índice composto no Firestore
  return docs.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
}

// ── Buscar uma atividade por ID ──────────────────────────────────
export async function getActivityById(id) {
  const all = await getActivities()
  return all.find(a => a.id === id) || null
}

// ── Atualizar atividade ──────────────────────────────────────────
export async function updateActivity(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    dueDate: Timestamp.fromDate(new Date(data.dueDate)),
    updatedAt: Timestamp.now()
  })
}

// ── Excluir atividade ────────────────────────────────────────────
export async function deleteActivity(id) {
  await deleteDoc(doc(db, COL, id))
}

// ── Assinatura em tempo real ─────────────────────────────────────
export function subscribeToActivities(classId, callback) {
  const q = classId
    ? query(collection(db, COL), where('classId', '==', classId))
    : query(collection(db, COL))

  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map(d => docToActivity(d))
      // Ordena por data de entrega client-side
      callback(docs.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1)))
    },
    (err) => {
      console.error('subscribeToActivities error:', err.code, err.message)
      callback([])
    }
  )
}

// ── Helper: converte doc Firestore para objeto JS ────────────────
function docToActivity(d) {
  const data = d.data()
  return {
    id: d.id,
    ...data,
    // Converte Timestamp para string ISO (YYYY-MM-DD)
    dueDate: data.dueDate?.toDate?.().toISOString().split('T')[0] ?? data.dueDate
  }
}
