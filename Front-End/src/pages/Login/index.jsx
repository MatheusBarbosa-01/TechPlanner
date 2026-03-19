// Página de Login
// Design moderno split-screen com Firebase Auth

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiGrid, FiBookOpen, FiCalendar, FiCheckCircle, FiBell, FiUsers, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import './style.css'

const firebaseErrors = {
  'auth/user-not-found':     'Usuário não encontrado.',
  'auth/wrong-password':     'Senha incorreta.',
  'auth/invalid-email':      'E-mail inválido.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/too-many-requests':  'Muitas tentativas. Tente novamente mais tarde.',
  'auth/user-disabled':      'Conta desativada. Contate o administrador.'
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(firebaseErrors[err.code] || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      {/* ── Painel esquerdo — Hero ── */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <div className="auth-logo-icon-wrap"><FiGrid size={22} color="white" /></div>
            <span className="auth-logo-text">TechPlanner</span>
          </div>
          <h1 className="auth-hero-title">Plataforma Educacional Completa</h1>
          <p className="auth-hero-sub">
            Gerencie turmas, atividades, cursos e o desempenho dos seus alunos em um único lugar.
          </p>
          <ul className="auth-features">
            <li><span className="feat-icon"><FiBookOpen size={15} /></span> Gestão de cursos e turmas</li>
            <li><span className="feat-icon"><FiCalendar size={15} /></span> Calendário acadêmico interativo</li>
            <li><span className="feat-icon"><FiCheckCircle size={15} /></span> Atividades e entrega de trabalhos</li>
            <li><span className="feat-icon"><FiBell size={15} /></span> Notificações em tempo real</li>
            <li><span className="feat-icon"><FiUsers size={15} /></span> Níveis: Aluno, Professor, Admin</li>
          </ul>
        </div>
      </div>

      {/* ── Painel direito — Formulário ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Bem-vindo de volta</h2>
            <p>Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <FiAlertTriangle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">E-mail institucional</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" />
                <input
                  id="email" type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoFocus required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Senha</label>
              </div>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" />
                <input
                  id="password" type={showPass ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <><span>Entrar</span><FiArrowRight /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Não tem conta? <Link to="/cadastro">Criar conta gratuitamente</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
