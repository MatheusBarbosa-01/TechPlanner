// Rotas de notificações
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/notificationsController')
const { authMiddleware } = require('../middlewares/auth')

router.use(authMiddleware)

// GET /api/notifications        — notificações do usuário logado
// PUT /api/notifications/:id    — marcar como lida
router.get('/',     ctrl.listNotifications)
router.put('/:id',  ctrl.markAsRead)

module.exports = router
