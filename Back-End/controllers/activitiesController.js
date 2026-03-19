// Controller de atividades
// GET    /api/activities       — lista atividades (filtro opcional: ?classId=xxx)
// POST   /api/activities       — cria atividade (professor/admin)
// PUT    /api/activities/:id   — atualiza atividade (professor/admin)
// DELETE /api/activities/:id   — exclui atividade (professor/admin)

const svc                    = require('../services/activityService')
const notifSvc               = require('../services/notificationService')
const { getUsersByClass }    = require('../services/userService')

async function listActivities(req, res, next) {
  try {
    const { classId } = req.query
    const activities = await svc.getActivities(classId || null)
    res.json({ activities })
  } catch (err) {
    next(err)
  }
}

async function createActivity(req, res, next) {
  try {
    const { title, description, dueDate, classId, type } = req.body

    if (!title || !dueDate || !classId) {
      return res.status(400).json({ error: 'title, dueDate e classId são obrigatórios.' })
    }

    const id = await svc.createActivity({
      title,
      description: description || '',
      dueDate,
      classId,
      type:          type || 'atividade',
      createdBy:     req.user.uid,
      createdByName: req.user.name || ''
    })

    // Notifica os alunos da turma
    const alunos = await getUsersByClass(classId)
    const msg    = `Nova ${type || 'atividade'}: "${title}" — Vence em ${new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
    await Promise.all(alunos.map(a => notifSvc.createNotification(a.id, msg)))

    res.status(201).json({ id, message: 'Atividade criada com sucesso.' })
  } catch (err) {
    next(err)
  }
}

async function updateActivity(req, res, next) {
  try {
    const { id } = req.params
    const existing = await svc.getActivityById(id)

    if (!existing) {
      return res.status(404).json({ error: 'Atividade não encontrada.' })
    }

    await svc.updateActivity(id, req.body)
    res.json({ message: 'Atividade atualizada com sucesso.' })
  } catch (err) {
    next(err)
  }
}

async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params
    const existing = await svc.getActivityById(id)

    if (!existing) {
      return res.status(404).json({ error: 'Atividade não encontrada.' })
    }

    await svc.deleteActivity(id)
    res.json({ message: 'Atividade excluída com sucesso.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listActivities, createActivity, updateActivity, deleteActivity }
