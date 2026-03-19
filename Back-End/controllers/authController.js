// Controller de autenticação
// POST /api/auth/register — registra usuário no Firestore + define custom claim
// POST /api/auth/login    — retorna perfil do usuário autenticado

const { db, adminReady } = require('../firebase/admin')
const { setUserRole }    = require('../services/userService')

// POST /api/auth/register
// Body: { uid, name, email, role, classId }
async function register(req, res, next) {
  if (!adminReady) {
    return res.status(503).json({ error: 'Firebase Admin SDK não configurado. Configure o .env.' })
  }

  try {
    const { uid, name, email, role, classId } = req.body

    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: 'uid, name, email e role são obrigatórios.' })
    }

    const allowedRoles = ['aluno', 'professor', 'administrador']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' })
    }

    // Salva perfil no Firestore
    await db.collection('users').doc(uid).set({
      id: uid,
      name,
      email,
      role,
      classId: classId || null,
      createdAt: new Date().toISOString()
    })

    // Define custom claim para controle de acesso via token
    await setUserRole(uid, role)

    res.status(201).json({ message: 'Usuário registrado com sucesso.', uid })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
// Requer: Authorization: Bearer <idToken>
// O token já foi verificado pelo authMiddleware
async function login(req, res, next) {
  if (!adminReady) {
    return res.status(503).json({ error: 'Firebase Admin SDK não configurado. Configure o .env.' })
  }

  try {
    const snap = await db.collection('users').doc(req.user.uid).get()

    if (!snap.exists) {
      return res.status(404).json({ error: 'Perfil não encontrado.' })
    }

    res.json({ user: { id: snap.id, ...snap.data() } })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login }

// POST /api/auth/register
// Body: { uid, name, email, role, classId }
async function register(req, res, next) {
  try {
    const { uid, name, email, role, classId } = req.body

    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: 'uid, name, email e role são obrigatórios.' })
    }

    const allowedRoles = ['aluno', 'professor', 'administrador']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' })
    }

    // Salva perfil no Firestore
    await db.collection('users').doc(uid).set({
      id: uid,
      name,
      email,
      role,
      classId: classId || null,
      createdAt: new Date().toISOString()
    })

    // Define custom claim para controle de acesso via token
    await setUserRole(uid, role)

    res.status(201).json({ message: 'Usuário registrado com sucesso.', uid })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
// Requer: Authorization: Bearer <idToken>
// O token já foi verificado pelo authMiddleware
async function login(req, res, next) {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get()

    if (!snap.exists) {
      return res.status(404).json({ error: 'Perfil não encontrado.' })
    }

    res.json({ user: { id: snap.id, ...snap.data() } })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login }
