// Sidebar de navegação — Sistema Educacional TechPlanner
// Navegação adaptativa por papel (aluno, professor, administrador)

import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiHome, FiCalendar, FiBookOpen, FiClipboard,
  FiPlusCircle, FiLogOut, FiUser,
  FiShield, FiUsers, FiBook, FiGrid
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import './style.css'

const ROLE_LABELS = {
  aluno:         'Aluno',
  professor:     'Professor',
  administrador: 'Administrador'
}

const ROLE_COLORS = {
  aluno:         '#059669',
  professor:     '#2563EB',
  administrador: '#7C3AED'
}

function NavItem({ icon: Icon, label, path, active, onClick, badge }) {
  return (
    <button
      className={`nav-item ${active ? 'nav-item-active' : ''}`}
      onClick={onClick}
      title={label}
    >
      <span className="nav-item-icon"><Icon size={18} /></span>
      <span className="nav-item-label">{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  )
}

function NavGroup({ title }) {
  return <div className="nav-group-title">{title}</div>
}

function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { userProfile, logout, isProfessor, isAdmin } = useAuth()

  const is = (path) => pathname === path || pathname.startsWith(path + '/')

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const role      = userProfile?.role
  const name      = userProfile?.name || ''
  const initials  = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><FiGrid size={19} color="white" /></div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">TechPlanner</span>
          <span className="sidebar-logo-sub">Sistema Educacional</span>
        </div>
      </div>

      {/* ── Perfil do usuário ── */}
      <div className="sidebar-user" onClick={() => navigate('/perfil')}>
        <div
          className="sidebar-avatar"
          style={{ background: ROLE_COLORS[role] || '#4F46E5' }}
        >
          {initials || '?'}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name" title={name}>{name}</p>
          <span
            className="sidebar-user-role"
            style={{ color: ROLE_COLORS[role] || '#4F46E5' }}
          >
            {ROLE_LABELS[role] || role}
          </span>
        </div>
      </div>

      {/* ── Navegação ── */}
      <nav className="sidebar-nav">
        <NavGroup title="GERAL" />
        <NavItem icon={FiHome}      label="Dashboard"  path="/dashboard"  active={is('/dashboard')}  onClick={() => navigate('/dashboard')} />
        <NavItem icon={FiCalendar}  label="Calendário" path="/calendario" active={is('/calendario')} onClick={() => navigate('/calendario')} />
        <NavItem icon={FiClipboard} label="Atividades" path="/atividades" active={is('/atividades')} onClick={() => navigate('/atividades')} />
        <NavItem icon={FiBookOpen}  label="Cursos"     path="/cursos"     active={is('/cursos')}     onClick={() => navigate('/cursos')} />

        {/* Seção professor/admin */}
        {isProfessor && (
          <>
            <NavGroup title="PROFESSOR" />
            <NavItem
              icon={FiPlusCircle}
              label="Nova Atividade"
              path="/criar-atividade"
              active={is('/criar-atividade') || is('/editar-atividade')}
              onClick={() => navigate('/criar-atividade')}
            />
            <NavItem
              icon={FiBook}
              label="Novo Curso"
              path="/cursos/criar"
              active={is('/cursos/criar') || is('/cursos/editar')}
              onClick={() => navigate('/cursos/criar')}
            />
            <NavItem
              icon={FiUsers}
              label="Solicitações"
              path="/solicitacoes"
              active={is('/solicitacoes')}
              onClick={() => navigate('/solicitacoes')}
            />
          </>
        )}

        {/* Seção admin */}
        {isAdmin && (
          <>
            <NavGroup title="ADMINISTRAÇÃO" />
            <NavItem
              icon={FiShield}
              label="Painel Admin"
              path="/admin"
              active={is('/admin')}
              onClick={() => navigate('/admin')}
            />
          </>
        )}

        <NavGroup title="CONTA" />
        <NavItem icon={FiUser} label="Meu Perfil" path="/perfil" active={is('/perfil')} onClick={() => navigate('/perfil')} />
      </nav>

      {/* ── Logout ── */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={17} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
