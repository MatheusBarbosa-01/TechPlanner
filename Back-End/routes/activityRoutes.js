// Rotas de atividades
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/activitiesController')
const { authMiddleware, requireRole } = require('../middlewares/auth')

// Todas as rotas exigem autenticação
router.use(authMiddleware)

// GET  /api/activities          — todos os usuários autenticados
// POST /api/activities          — apenas professor ou administrador
// PUT  /api/activities/:id      — apenas professor ou administrador
// DELETE /api/activities/:id    — apenas professor ou administrador

router.get('/',    ctrl.listActivities)
router.post('/',   requireRole('professor', 'administrador'), ctrl.createActivity)
router.put('/:id', requireRole('professor', 'administrador'), ctrl.updateActivity)
router.delete('/:id', requireRole('professor', 'administrador'), ctrl.deleteActivity)

module.exports = router
