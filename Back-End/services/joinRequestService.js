// Serviço de Solicitações de Turma — Firebase Admin

const { db } = require('../firebase/admin')
const { FieldValue } = require('firebase-admin/firestore')

const COL = 'classJoinRequests'

async function createJoinRequest({ userId, userName, userEmail, classId, className }) {
  const dup = await db.collection(COL)
    .where('userId', '==', userId)
    .where('classId', '==', classId)
    .where('status', '==', 'pendente')
    .get()
  if (!dup.empty) throw new Error('Já existe uma solicitação pendente para esta turma.')

  const ref = await db.collection(COL).add({
    userId, userName, userEmail,
    classId, className,
    status: 'pendente',
    createdAt: FieldValue.serverTimestamp()
  })
  return ref.id
}

async function getJoinRequests(classId = null) {
  let q = db.collection(COL).orderBy('createdAt', 'desc')
  if (classId) q = q.where('classId', '==', classId)
  const snap = await q.get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function respondToJoinRequest(requestId, status, respondedByName = '') {
  if (!['aprovado', 'rejeitado'].includes(status)) throw new Error('Status inválido.')
  await db.collection(COL).doc(requestId).update({
    status, respondedByName,
    respondedAt: FieldValue.serverTimestamp()
  })
}

module.exports = { createJoinRequest, getJoinRequests, respondToJoinRequest }
