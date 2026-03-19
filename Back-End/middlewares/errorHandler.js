// Middleware global de tratamento de erros
// Centraliza respostas de erro para toda a API

function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message)

  // Erros de validação do Firebase Admin
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(400).json({ error: err.message })
  }

  const statusCode = err.statusCode || 500
  const message    = statusCode === 500
    ? 'Erro interno do servidor.'
    : err.message

  res.status(statusCode).json({ error: message })
}

module.exports = errorHandler
