// Serviço de Solicitações de Entrada em Turma — Firestore
// Coleção: 'classJoinRequests'

import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, where, Timestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'classJoinRequests'

export async function createJoinRequest({ userId, userName, userEmail, classId, className }) {
  // Verifica se já existe solicitação pendente
  const existing = await getDocs(query(
    collection(db, COL),
    where('userId', '==', userId),
    where('classId', '==', classId),
    where('status', '==', 'pendente')
  ))
  if (!existing.empty) {
    throw new Error('Você já tem uma solicitação pendente para esta turma.')
  }

  await addDoc(collection(db, COL), {
    userId, userName, userEmail,
    classId, className,
    status: 'pendente',
    createdAt: Timestamp.now()
  })
}

export async function getJoinRequests(classId = null) {
  const q = classId
    ? query(collection(db, COL), where('classId', '==', classId))
    : query(collection(db, COL))
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function getPendingRequestsForUser(userId) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function respondToJoinRequest(requestId, status, respondedByName = '') {
  // status: 'aprovado' | 'rejeitado'
  await updateDoc(doc(db, COL, requestId), {
    status,
    respondedByName,
    respondedAt: Timestamp.now()
  })
}

export function subscribeToJoinRequests(classId, callback) {
  const q = classId
    ? query(collection(db, COL), where('classId', '==', classId))
    : query(collection(db, COL))
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)))
  })
}
