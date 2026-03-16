// Rotas de autenticação
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/auth')

// POST /api/auth/register — não requer autenticação (chamado após Firebase Auth criar o usuário)
router.post('/register', ctrl.register)

// POST /api/auth/login — requer token válido do Firebase
router.post('/login', authMiddleware, ctrl.login)

module.exports = router
