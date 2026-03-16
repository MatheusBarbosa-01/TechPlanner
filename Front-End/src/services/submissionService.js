// Serviço de Entregas/Submissões — Firestore
// Coleção: 'submissions'

import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, where, Timestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'submissions'

export async function submitActivity({ activityId, studentId, studentName, content, fileUrl = null }) {
  // Verifica se aluno já entregou
  const existing = await getDocs(query(
    collection(db, COL),
    where('activityId', '==', activityId),
    where('studentId', '==', studentId)
  ))
  if (!existing.empty) {
    // Atualiza a submissão existente (reentrega)
    const docId = existing.docs[0].id
    await updateDoc(doc(db, COL, docId), {
      content, fileUrl,
      status: 'entregue',
      submittedAt: Timestamp.now()
    })
    return docId
  }

  const docRef = await addDoc(collection(db, COL), {
    activityId, studentId, studentName,
    content, fileUrl,
    status: 'entregue',
    grade: null,
    feedback: null,
    submittedAt: Timestamp.now()
  })
  return docRef.id
}

export async function getSubmissionsForActivity(activityId) {
  const q = query(
    collection(db, COL),
    where('activityId', '==', activityId)
  )
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0))
}

export async function getStudentSubmission(activityId, studentId) {
  const q = query(
    collection(db, COL),
    where('activityId', '==', activityId),
    where('studentId', '==', studentId)
  )
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getStudentSubmissions(studentId) {
  const q = query(
    collection(db, COL),
    where('studentId', '==', studentId)
  )
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0))
}

export async function gradeSubmission(submissionId, grade, feedback) {
  await updateDoc(doc(db, COL, submissionId), {
    grade,
    feedback,
    status: 'avaliado',
    gradedAt: Timestamp.now()
  })
}

export function subscribeToActivitySubmissions(activityId, callback) {
  const q = query(
    collection(db, COL),
    where('activityId', '==', activityId)
  )
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(docs.sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0)))
  })
}
