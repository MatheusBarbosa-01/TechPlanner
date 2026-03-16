// Controller de Solicitações de Turma

const svc = require('../services/joinRequestService')

async function create(req, res, next) {
  try {
    const { classId, className } = req.body
    if (!classId) return res.status(400).json({ error: 'classId é obrigatório.' })
    const id = await svc.createJoinRequest({
      userId:    req.user.uid,
      userName:  req.user.name || '',
      userEmail: req.user.email,
      classId,
      className: className || ''
    })
    res.status(201).json({ id })
  } catch (err) {
    if (err.message.includes('pendente')) return res.status(409).json({ error: err.message })
    next(err)
  }
}

async function list(req, res, next) {
  try {
    const { classId } = req.query
    const requests = await svc.getJoinRequests(classId || null)
    res.json(requests)
  } catch (err) { next(err) }
}

async function respond(req, res, next) {
  try {
    const { status } = req.body
    if (!['aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({ error: 'Status deve ser "aprovado" ou "rejeitado".' })
    }
    await svc.respondToJoinRequest(req.params.id, status, req.user.name || '')
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { create, list, respond }
