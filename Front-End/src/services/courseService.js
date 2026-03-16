// Serviço de Cursos — Firestore
// Coleção: 'courses'

import {
  collection, addDoc, getDocs, doc, getDoc,
  updateDoc, deleteDoc, query, where, orderBy,
  Timestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'courses'

export async function createCourse(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    enrolledCount: 0,
    createdAt: Timestamp.now()
  })
  return docRef.id
}

export async function getCourses() {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getCoursesByTeacher(teacherId) {
  const q = query(
    collection(db, COL),
    where('teacherId', '==', teacherId)
  )
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

export async function getCourseById(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateCourse(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteCourse(id) {
  await deleteDoc(doc(db, COL, id))
}

export function subscribeToCourses(callback) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
