// Serviço de usuários — Firebase Admin

const { db, auth } = require('../firebase/admin')

async function getUserById(uid) {
  const snap = await db.collection('users').doc(uid).get()
  return snap.exists ? { id: snap.id, ...snap.data() } : null
}

async function getUsersByClass(classId) {
  const snap = await db.collection('users')
    .where('classId', '==', classId)
    .where('role', '==', 'aluno')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Define o custom claim de role no token JWT do usuário
async function setUserRole(uid, role) {
  await auth.setCustomUserClaims(uid, { role })
}

module.exports = { getUserById, getUsersByClass, setUserRole }
