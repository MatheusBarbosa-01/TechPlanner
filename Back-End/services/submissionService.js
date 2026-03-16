// Serviço de Submissões — lógica de negócio com Firebase Admin

const { db } = require('../firebase/admin')
const { FieldValue } = require('firebase-admin/firestore')

const COL = 'submissions'

async function submitActivity({ activityId, studentId, studentName, content, fileUrl }) {
  // Upsert: one submission per (student, activity)
  const existing = await db.collection(COL)
    .where('activityId', '==', activityId)
    .where('studentId', '==', studentId)
    .get()

  if (!existing.empty) {
    const docId = existing.docs[0].id
    await db.collection(COL).doc(docId).update({
      content, fileUrl: fileUrl || null,
      status: 'entregue',
      submittedAt: FieldValue.serverTimestamp()
    })
    return docId
  }

  const ref = await db.collection(COL).add({
    activityId, studentId, studentName,
    content, fileUrl: fileUrl || null,
    status: 'entregue',
    grade: null, feedback: null,
    submittedAt: FieldValue.serverTimestamp()
  })
  return ref.id
}

async function getSubmissionsForActivity(activityId) {
  const snap = await db.collection(COL)
    .where('activityId', '==', activityId)
    .orderBy('submittedAt', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function getStudentSubmissions(studentId) {
  const snap = await db.collection(COL)
    .where('studentId', '==', studentId)
    .orderBy('submittedAt', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function gradeSubmission(submissionId, { grade, feedback }) {
  if (grade === undefined || grade === null) throw new Error('Nota é obrigatória.')
  await db.collection(COL).doc(submissionId).update({
    grade: Number(grade),
    feedback: feedback || '',
    status: 'avaliado',
    gradedAt: FieldValue.serverTimestamp()
  })
}

module.exports = { submitActivity, getSubmissionsForActivity, getStudentSubmissions, gradeSubmission }
