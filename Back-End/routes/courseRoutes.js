const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth')
const ctrl   = require('../controllers/coursesController')

router.get('/',       authMiddleware, ctrl.listCourses)
router.get('/:id',    authMiddleware, ctrl.getCourse)
router.post('/',      authMiddleware, requireRole('professor','administrador'), ctrl.createCourse)
router.put('/:id',    authMiddleware, requireRole('professor','administrador'), ctrl.updateCourse)
router.delete('/:id', authMiddleware, requireRole('professor','administrador'), ctrl.deleteCourse)

module.exports = router
