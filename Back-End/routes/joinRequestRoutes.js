const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth')
const ctrl   = require('../controllers/joinRequestsController')

router.post('/',     authMiddleware, ctrl.create)
router.get('/',      authMiddleware, requireRole('professor','administrador'), ctrl.list)
router.patch('/:id', authMiddleware, requireRole('professor','administrador'), ctrl.respond)

module.exports = router
