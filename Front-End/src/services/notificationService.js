// Serviço de notificações — Firestore
// Coleção: 'notifications'

import {
  collection, addDoc, doc, updateDoc,
  query, where, Timestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'notifications'

// ── Criar notificação para um usuário ────────────────────────────
export async function createNotification(userId, message) {
  await addDoc(collection(db, COL), {
    userId,
    message,
    read: false,
    createdAt: Timestamp.now()
  })
}

// ── Marcar notificação como lida ─────────────────────────────────
export async function markAsRead(notifId) {
  await updateDoc(doc(db, COL, notifId), { read: true })
}

// ── Assinatura em tempo real das notificações do usuário ─────────
export function subscribeToNotifications(userId, callback) {
  if (!userId) {
    callback([])
    return () => {}
  }

  // Sem orderBy para evitar índice composto — ordena client-side
  const q = query(
    collection(db, COL),
    where('userId', '==', userId)
  )

  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Ordena por createdAt decrescente client-side
      docs.sort((a, b) => {
        const ta = a.createdAt?.toDate?.().getTime() ?? 0
        const tb = b.createdAt?.toDate?.().getTime() ?? 0
        return tb - ta
      })
      callback(docs)
    },
    (err) => {
      console.error('subscribeToNotifications error:', err.code, err.message)
      callback([])
    }
  )
}
