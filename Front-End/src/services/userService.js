// Serviço de usuários e turmas — Firestore
// Coleções: 'users', 'classes'

import {
  collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc,
  query, where, orderBy, onSnapshot, Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ── Turmas ───────────────────────────────────────────────────────

export async function getClasses() {
  const q = query(collection(db, 'classes'), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getClassById(id) {
  if (!id) return null
  const snap = await getDoc(doc(db, 'classes', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createClass(data) {
  const ref = await addDoc(collection(db, 'classes'), {
    ...data,
    createdAt: Timestamp.now()
  })
  return ref.id
}

export async function deleteClass(id) {
  await deleteDoc(doc(db, 'classes', id))
}

export function subscribeToClasses(callback) {
  const q = query(collection(db, 'classes'), orderBy('name', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ── Usuários ─────────────────────────────────────────────────────

export async function getUsersByClass(classId) {
  const q = query(
    collection(db, 'users'),
    where('classId', '==', classId),
    where('role', '==', 'aluno')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getUserById(id) {
  if (!id) return null
  const snap = await getDoc(doc(db, 'users', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: Timestamp.now() }, { merge: true })
}

export function subscribeToUsers(callback) {
  const q = query(collection(db, 'users'), orderBy('name', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
