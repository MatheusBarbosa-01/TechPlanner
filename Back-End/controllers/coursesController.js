// Controller de Cursos

const svc = require('../services/courseService')

async function listCourses(req, res, next) {
  try {
    const { teacherId } = req.query
    const courses = await svc.getCourses(teacherId || null)
    res.json(courses)
  } catch (err) { next(err) }
}

async function getCourse(req, res, next) {
  try {
    const course = await svc.getCourseById(req.params.id)
    if (!course) return res.status(404).json({ error: 'Curso não encontrado.' })
    res.json(course)
  } catch (err) { next(err) }
}

async function createCourse(req, res, next) {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'O campo "name" é obrigatório.' })
    const id = await svc.createCourse({ ...req.body, teacherId: req.user.uid })
    res.status(201).json({ id })
  } catch (err) { next(err) }
}

async function updateCourse(req, res, next) {
  try {
    await svc.updateCourse(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) { next(err) }
}

async function deleteCourse(req, res, next) {
  try {
    await svc.deleteCourse(req.params.id)
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse }
