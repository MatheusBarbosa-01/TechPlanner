// Serviço de Turmas — Firestore
// Coleção: 'classes'

import {
  collection, addDoc, getDocs, doc, getDoc,
  updateDoc, deleteDoc, query, orderBy, Timestamp,
  onSnapshot, where
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'classes'

export async function getClasses() {
  const q = query(collection(db, COL), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getClassById(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createClass(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now()
  })
  return docRef.id
}

export async function updateClass(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteClass(id) {
  await deleteDoc(doc(db, COL, id))
}

export async function getStudentsByClass(classId) {
  const q = query(
    collection(db, 'users'),
    where('classId', '==', classId),
    where('role', '==', 'aluno')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeToClasses(callback) {
  const q = query(collection(db, COL), orderBy('name', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
