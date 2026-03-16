// Configuração do Firebase para o TechPlanner
// Inicializa Authentication, Firestore e Analytics

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAjb43I2oPqUl87Vne6c7dSxHqOT-kQTN4",
  authDomain: "techplanner-95274.firebaseapp.com",
  projectId: "techplanner-95274",
  storageBucket: "techplanner-95274.firebasestorage.app",
  messagingSenderId: "487734376240",
  appId: "1:487734376240:web:241cf6fc28cfb02d76baf5",
  measurementId: "G-Y322M2FBPZ"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app
