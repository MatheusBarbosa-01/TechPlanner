// Middleware de autenticação
// Verifica o token JWT do Firebase em cada rota protegida

const { auth, adminReady } = require('../firebase/admin')

async function authMiddleware(req, res, next) {
  // Se o Admin SDK não foi configurado, informa ao cliente
  if (!adminReady) {
    return res.status(503).json({
      error: 'Firebase Admin SDK não configurado. Configure o arquivo .env com as credenciais do Firebase Admin.'
    })
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' })
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await auth.verifyIdToken(idToken)
    req.user = decoded           // uid, email, role (custom claim)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

// Fábrica de middleware para verificar papel (role) do usuário
function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: `Acesso negado. Requerido: ${roles.join(' ou ')}.`
      })
    }
    next()
  }
}

module.exports = { authMiddleware, requireRole }
