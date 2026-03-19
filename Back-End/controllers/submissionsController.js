// Controller de Submissões

const svc = require('../services/submissionService')

async function submit(req, res, next) {
  try {
    const { activityId, content, fileUrl } = req.body
    if (!activityId || !content?.trim()) {
      return res.status(400).json({ error: 'activityId e content são obrigatórios.' })
    }
    const id = await svc.submitActivity({
      activityId,
      studentId:   req.user.uid,
      studentName: req.user.name || req.user.email,
      content,
      fileUrl: fileUrl || null
    })
    res.status(201).json({ id })
  } catch (err) { next(err) }
}

async function listForActivity(req, res, next) {
  try {
    const subs = await svc.getSubmissionsForActivity(req.params.activityId)
    res.json(subs)
  } catch (err) { next(err) }
}

async function listForStudent(req, res, next) {
  try {
    const subs = await svc.getStudentSubmissions(req.params.studentId)
    res.json(subs)
  } catch (err) { next(err) }
}

async function grade(req, res, next) {
  try {
    const { grade: g, feedback } = req.body
    if (g === undefined) return res.status(400).json({ error: 'Nota é obrigatória.' })
    await svc.gradeSubmission(req.params.id, { grade: g, feedback })
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { submit, listForActivity, listForStudent, grade }
