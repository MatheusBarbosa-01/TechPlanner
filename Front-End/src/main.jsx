// TechPlanner — Ponto de entrada da aplicação
// Sistema Educacional Completo

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from './components/ui/provider'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Páginas de autenticação
import Login    from './pages/Login'
import Register from './pages/Register'

// Páginas protegidas
import Dashboard      from './pages/Dashboard'
import Calendar       from './pages/Calendar'
import Activities     from './pages/Activities'
import CreateActivity from './pages/CreateActivity'
import Courses        from './pages/Courses'
import CreateCourse   from './pages/CreateCourse'
import Profile        from './pages/Profile'
import Admin          from './pages/Admin'
import JoinRequests   from './pages/JoinRequests'

// Estilos globais
import './styles/estilosGlobais.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ── Rotas públicas ── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/"         element={<Navigate to="/login" replace />} />

            {/* ── Rotas privadas (todos autenticados) ── */}
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/calendario" element={
              <PrivateRoute><Calendar /></PrivateRoute>
            } />
            <Route path="/atividades" element={
              <PrivateRoute><Activities /></PrivateRoute>
            } />
            <Route path="/cursos" element={
              <PrivateRoute><Courses /></PrivateRoute>
            } />
            <Route path="/perfil" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />

            {/* ── Rotas professor / administrador ── */}
            <Route path="/criar-atividade" element={
              <PrivateRoute roles={['professor', 'administrador']}>
                <CreateActivity />
              </PrivateRoute>
            } />
            <Route path="/editar-atividade/:id" element={
              <PrivateRoute roles={['professor', 'administrador']}>
                <CreateActivity />
              </PrivateRoute>
            } />
            <Route path="/cursos/criar" element={
              <PrivateRoute roles={['professor', 'administrador']}>
                <CreateCourse />
              </PrivateRoute>
            } />
            <Route path="/cursos/editar/:id" element={
              <PrivateRoute roles={['professor', 'administrador']}>
                <CreateCourse />
              </PrivateRoute>
            } />
            <Route path="/solicitacoes" element={
              <PrivateRoute roles={['professor', 'administrador']}>
                <JoinRequests />
              </PrivateRoute>
            } />

            {/* ── Rota exclusiva do administrador ── */}
            <Route path="/admin" element={
              <PrivateRoute roles={['administrador']}>
                <Admin />
              </PrivateRoute>
            } />

            {/* Rota curinga */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)

