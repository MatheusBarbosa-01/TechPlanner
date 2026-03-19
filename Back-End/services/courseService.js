// Serviço de Cursos — lógica de negócio com Firebase Admin

const { db } = require('../firebase/admin')
const { FieldValue } = require('firebase-admin/firestore')

const COL = 'courses'

async function createCourse(data) {
  const ref = await db.collection(COL).add({
    ...data,
    enrolledCount: 0,
    createdAt: FieldValue.serverTimestamp()
  })
  return ref.id
}

async function getCourses(teacherId = null) {
  let q = db.collection(COL).orderBy('createdAt', 'desc')
  if (teacherId) q = q.where('teacherId', '==', teacherId)
  const snap = await q.get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function getCourseById(id) {
  const snap = await db.collection(COL).doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() }
}

async function updateCourse(id, data) {
  await db.collection(COL).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  })
}

async function deleteCourse(id) {
  await db.collection(COL).doc(id).delete()
}

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse }
