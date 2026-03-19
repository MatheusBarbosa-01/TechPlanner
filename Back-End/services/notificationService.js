// Serviço de notificações — Firebase Admin

const { db } = require('../firebase/admin')
const { FieldValue } = require('firebase-admin/firestore')

const COL = 'notifications'

async function createNotification(userId, message) {
  await db.collection(COL).add({
    userId,
    message,
    read: false,
    createdAt: FieldValue.serverTimestamp()
  })
}

async function getNotificationsByUser(userId) {
  const snap = await db.collection(COL)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function markAsRead(notifId) {
  await db.collection(COL).doc(notifId).update({ read: true })
}

module.exports = { createNotification, getNotificationsByUser, markAsRead }
