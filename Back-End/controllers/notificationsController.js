// Controller de notificações
// GET  /api/notifications       — lista notificações do usuário autenticado
// PUT  /api/notifications/:id   — marca notificação como lida

const svc = require('../services/notificationService')

async function listNotifications(req, res, next) {
  try {
    const notifications = await svc.getNotificationsByUser(req.user.uid)
    res.json({ notifications })
  } catch (err) {
    next(err)
  }
}

async function markAsRead(req, res, next) {
  try {
    await svc.markAsRead(req.params.id)
    res.json({ message: 'Notificação marcada como lida.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listNotifications, markAsRead }
