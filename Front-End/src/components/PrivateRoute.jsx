// Guarda de rota privada — redireciona para login se não autenticado
// Suporte a restrição por papel (role) do usuário

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * @param {React.ReactNode} children  — componente protegido
 * @param {string[]}        roles     — papéis permitidos (opcional)
 */
function PrivateRoute({ children, roles }) {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!currentUser) return <Navigate to="/login" replace />

  // Se roles foi especificado, verifica perfil
  if (roles && userProfile && !roles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute
