const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth')
const ctrl   = require('../controllers/submissionsController')

router.post('/',                    authMiddleware, ctrl.submit)
router.get('/activity/:activityId', authMiddleware, requireRole('professor','administrador'), ctrl.listForActivity)
router.get('/student/:studentId',   authMiddleware, ctrl.listForStudent)
router.patch('/:id/grade',          authMiddleware, requireRole('professor','administrador'), ctrl.grade)

module.exports = router
