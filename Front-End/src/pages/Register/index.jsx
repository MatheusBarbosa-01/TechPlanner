import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight,
  FiUsers, FiShield, FiAlertTriangle
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { getClasses } from '../../services/userService'
import '../Login/style.css'
import './style.css'

const ROLES = [
  { value: 'aluno',         label: 'Aluno',         Icon: FiUser   },
  { value: 'professor',     label: 'Professor',     Icon: FiUsers  },
  { value: 'administrador', label: 'Administrador', Icon: FiShield }
]

const firebaseErrors = {
  'auth/email-already-in-use':  'Este e-mail já está em uso.',
  'auth/invalid-email':          'E-mail inválido.',
  'auth/weak-password':          'Senha muito fraca (mínimo 6 caracteres).',
  'auth/operation-not-allowed':  'Login por e-mail/senha não está habilitado no Firebase.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/too-many-requests':      'Muitas tentativas. Aguarde alguns minutos.',
  'permission-denied':           'Permissão negada. Configure as regras do Firestore.'
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'aluno', classId: ''
  })
  const [classes,  setClasses]  = useState([])
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    getClasses().then(setClasses).catch()
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function selectRole(role) {
    setForm(prev => ({ ...prev, role, classId: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())                      return setError('Nome é obrigatório.')
    if (form.password !== form.confirmPassword) return setError('As senhas não coincidem.')
    if (form.password.length < 6)              return setError('A senha deve ter pelo menos 6 caracteres.')
    if (form.role === 'aluno' && !form.classId) return setError('Selecione sua turma.')

    setLoading(true)
    try {
      await register(form.email.trim(), form.password, form.name.trim(), form.role, form.classId || null)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(firebaseErrors[err.code] || `Erro ao criar conta. (${err.code || err.message})`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <div className="auth-logo-icon-wrap">
              <FiUser size={22} color="white" />
            </div>
            <span className="auth-logo-text">TechPlanner</span>
          </div>
          <h1 className="auth-hero-title">Comece sua jornada educacional</h1>
          <p className="auth-hero-sub">
            Crie sua conta e acesse turmas, atividades, calendário acadêmico e muito mais.
          </p>
          <ul className="auth-features">
            <li><span className="feat-icon"><FiUser size={15} /></span> Alunos: acompanhe atividades e notas</li>
            <li><span className="feat-icon"><FiUsers size={15} /></span> Professores: crie cursos e avalie entregas</li>
            <li><span className="feat-icon"><FiShield size={15} /></span> Admins: gerencie toda a instituição</li>
            <li><span className="feat-icon"><FiArrowRight size={15} /></span> Dashboards personalizados por perfil</li>
          </ul>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel register-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Criar uma conta</h2>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <FiAlertTriangle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Nome */}
            <div className="auth-field">
              <label>Nome completo</label>
              <div className="auth-input-wrap">
                <FiUser className="auth-input-icon" />
                <input name="name" type="text" placeholder="Seu nome completo"
                  value={form.name} onChange={handleChange} required autoFocus />
              </div>
            </div>

            {/* E-mail */}
            <div className="auth-field">
              <label>E-mail</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" />
                <input name="email" type="email" placeholder="seu@email.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>

            {/* Tipo de conta */}
            <div className="auth-field">
              <label>Tipo de conta</label>
              <div className="role-cards">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                    onClick={() => selectRole(r.value)}
                  >
                    <r.Icon size={17} className="role-card-icon" />
                    <span className="role-card-label">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Turma (apenas aluno) */}
            {form.role === 'aluno' && (
              <div className="auth-field">
                <label>Turma <span style={{ color: '#EF4444' }}>*</span></label>
                <div className="auth-input-wrap auth-no-icon">
                  <select name="classId" value={form.classId} onChange={handleChange} required>
                    <option value="">Selecione sua turma...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Senhas */}
            <div className="register-pass-row">
              <div className="auth-field">
                <label>Senha</label>
                <div className="auth-input-wrap">
                  <FiLock className="auth-input-icon" />
                  <input name="password" type={showPass ? 'text' : 'password'}
                    placeholder="Mín. 6 caracteres"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" className="auth-toggle-pass"
                    onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>Confirmar senha</label>
                <div className="auth-input-wrap">
                  <FiLock className="auth-input-icon" />
                  <input name="confirmPassword" type={showPass ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <><span>Criar Conta</span><FiArrowRight /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Já tem conta? <Link to="/login">Entrar agora</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
