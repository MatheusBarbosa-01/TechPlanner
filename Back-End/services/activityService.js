// Serviço de atividades — lógica de negócio com Firebase Admin
// Usado pelos controllers da API REST

const { db } = require('../firebase/admin')
const { FieldValue, Timestamp } = require('firebase-admin/firestore')

const COL = 'activities'

async function createActivity(data) {
  const ref = await db.collection(COL).add({
    ...data,
    dueDate:   Timestamp.fromDate(new Date(data.dueDate)),
    createdAt: FieldValue.serverTimestamp()
  })
  return ref.id
}

async function getActivities(classId = null) {
  let q = db.collection(COL).orderBy('dueDate', 'asc')
  if (classId) q = q.where('classId', '==', classId)

  const snap = await q.get()
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    dueDate:   d.data().dueDate?.toDate().toISOString().split('T')[0],
    createdAt: d.data().createdAt?.toDate().toISOString()
  }))
}

async function getActivityById(id) {
  const snap = await db.collection(COL).doc(id).get()
  if (!snap.exists) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    dueDate: data.dueDate?.toDate().toISOString().split('T')[0]
  }
}

async function updateActivity(id, data) {
  await db.collection(COL).doc(id).update({
    ...data,
    dueDate:   Timestamp.fromDate(new Date(data.dueDate)),
    updatedAt: FieldValue.serverTimestamp()
  })
}

async function deleteActivity(id) {
  await db.collection(COL).doc(id).delete()
}

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
}
