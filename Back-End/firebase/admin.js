// Inicialização do Firebase Admin SDK
// Usa variáveis de ambiente para autenticação segura

const admin = require('firebase-admin')

let db   = null
let auth = null
let adminReady = false

if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey      = process.env.FIREBASE_PRIVATE_KEY || ''
  // Variáveis de ambiente armazenam \n como literal — convertemos para quebra real
  const privateKey  = rawKey.replace(/\\n/g, '\n')

  const credenciaisValidas =
    projectId &&
    clientEmail &&
    privateKey &&
    privateKey.includes('BEGIN PRIVATE KEY')

  if (credenciaisValidas) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey })
      })
      db         = admin.firestore()
      auth       = admin.auth()
      adminReady = true
      console.log('✅ Firebase Admin SDK inicializado com sucesso.')
    } catch (err) {
      console.error('❌ Firebase Admin SDK: erro ao inicializar —', err.message)
      console.error('   Verifique se FIREBASE_PRIVATE_KEY no .env está correta.')
    }
  } else {
    console.warn('⚠️  Firebase Admin SDK: credenciais não configuradas.')
    console.warn('   1. Copie .env.example para .env')
    console.warn('   2. No Firebase Console → Configurações → Contas de Serviço')
    console.warn('   3. Clique em "Gerar nova chave privada" e preencha o .env')
    console.warn('   O servidor iniciará, mas rotas protegidas retornarão 503.')
  }
}

module.exports = { admin, db, auth, adminReady }
