import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBell, FiCalendar, FiClipboard, FiAlertCircle,
  FiUsers, FiPlus, FiArrowRight, FiClock, FiBookOpen, FiBook
} from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToActivities } from '../../services/activityService'
import { subscribeToNotifications, markAsRead } from '../../services/notificationService'
import { subscribeToCourses } from '../../services/courseService'
import { getClasses } from '../../services/userService'
import './style.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short'
  })
}

function TypeBadge({ type }) {
  return <span className={`badge badge-${type || 'atividade'}`}>{type || 'Atividade'}</span>
}

export default function Dashboard() {
  const { userProfile, isProfessor, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [activities,        setActivities]        = useState([])
  const [notifications,     setNotifications]     = useState([])
  const [courses,           setCourses]           = useState([])
  const [classes,           setClasses]           = useState([])
  const [showNotif,         setShowNotif]         = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(true)

  useEffect(() => {
    if (!userProfile) return
    const classId = userProfile.role === 'aluno' ? userProfile.classId : null

    const unsubAct    = subscribeToActivities(classId, (data) => {
      setActivities(data)
      setLoadingActivities(false)
    })
    const unsubNotif   = subscribeToNotifications(userProfile.id, setNotifications)
    const unsubCourses = subscribeToCourses(setCourses)
    getClasses().then(setClasses).catch(() => {})

    return () => { unsubAct(); unsubNotif(); unsubCourses() }
  }, [userProfile])

  const today       = new Date().toISOString().split('T')[0]
  const unreadCount = notifications.filter(n => !n.read).length
  const todayList   = activities.filter(a => a.dueDate === today)
  const upcoming    = activities.filter(a => a.dueDate >= today).slice(0, 6)
  const overdue     = activities.filter(a => a.dueDate < today)

  async function handleNotifClick(n) {
    if (!n.read) await markAsRead(n.id)
  }

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1 className="dash-greeting">
                {greet()}, {userProfile?.name?.split(' ')[0]}!
              </h1>
              <p className="dash-date">{dateLabel}</p>
            </div>
            <div className="dash-header-actions">
              <button
                className={`dash-bell ${unreadCount > 0 ? 'has-notif' : ''}`}
                onClick={() => setShowNotif(v => !v)}
                title="Notificações"
              >
                <FiBell size={20} />
                {unreadCount > 0 && <span className="dash-bell-badge">{unreadCount}</span>}
              </button>
              {isProfessor && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/criar-atividade')}>
                  <FiPlus size={15} /> Nova Atividade
                </button>
              )}
            </div>
          </div>

          {/* Notification Panel */}
          {showNotif && (
            <div className="dash-notif-panel">
              <div className="dash-notif-header">
                <h3>Notificações</h3>
                <span className="badge badge-primary">{unreadCount} novas</span>
              </div>
              {notifications.length === 0 ? (
                <p className="vazio-msg">Nenhuma notificação.</p>
              ) : (
                <div className="dash-notif-list">
                  {notifications.slice(0, 8).map(n => (
                    <div
                      key={n.id}
                      className={`dash-notif-item ${n.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className="notif-dot" />
                      <div className="notif-body">
                        <p>{n.message}</p>
                        <small>
                          {n.createdAt?.toDate?.().toLocaleDateString('pt-BR') ?? ''}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-blue"><FiClipboard /></div>
              <div className="stat-info">
                <h3>{activities.length}</h3>
                <p>Atividades</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-orange"><FiAlertCircle /></div>
              <div className="stat-info">
                <h3>{todayList.length}</h3>
                <p>Vencem hoje</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-green"><FiBookOpen /></div>
              <div className="stat-info">
                <h3>{courses.length}</h3>
                <p>Cursos</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-purple"><FiBell /></div>
              <div className="stat-info">
                <h3>{unreadCount}</h3>
                <p>Notificações</p>
              </div>
            </div>
            {isAdmin && (
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-cyan"><FiUsers /></div>
                <div className="stat-info">
                  <h3>{classes.length}</h3>
                  <p>Turmas</p>
                </div>
              </div>
            )}
            {activities.length > 0 && (
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-red"><FiClock /></div>
                <div className="stat-info">
                  <h3>{overdue.length}</h3>
                  <p>Atrasadas</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="dash-grid">

            {/* Próximas Atividades */}
            <section className="card dash-card-main">
              <div className="card-header">
                <h2><FiCalendar size={17} /> Próximas Atividades</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/atividades')}>
                  Ver todas <FiArrowRight size={14} />
                </button>
              </div>
              <div className="card-body dash-activity-list">
                {loadingActivities ? (
                  <div className="vazio-msg">Carregando...</div>
                ) : upcoming.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><FiClipboard size={32} /></div>
                    <p>Nenhuma atividade próxima.</p>
                    {isProfessor && (
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/criar-atividade')}>
                        <FiPlus size={13} /> Criar atividade
                      </button>
                    )}
                  </div>
                ) : (
                  upcoming.map(a => {
                    const isToday = a.dueDate === today
                    return (
                      <div key={a.id} className={`dash-act-item ${isToday ? 'today' : ''}`}>
                        <div className="dash-act-date">
                          <span className={isToday ? 'date-urgent' : ''}>{formatDate(a.dueDate)}</span>
                          {isToday && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Hoje</span>}
                        </div>
                        <div className="dash-act-info">
                          <TypeBadge type={a.type} />
                          <p className="dash-act-title">{a.title}</p>
                          {a.description && (
                            <p className="dash-act-desc">
                              {a.description.length > 70 ? a.description.slice(0, 70) + '...' : a.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Cursos */}
            <section className="card">
              <div className="card-header">
                <h2><FiBookOpen size={17} /> Cursos</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cursos')}>
                  Ver todos <FiArrowRight size={14} />
                </button>
              </div>
              <div className="card-body">
                {courses.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><FiBookOpen size={32} /></div>
                    <p>Nenhum curso cadastrado.</p>
                    {isProfessor && (
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/cursos/criar')}>
                        + Criar curso
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="dash-courses-list">
                    {courses.slice(0, 4).map(c => (
                      <div key={c.id} className="dash-course-item" onClick={() => navigate('/cursos')}>
                        <div className="dash-course-avatar">{c.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="dash-course-name">{c.name}</p>
                          <small className="dash-course-teacher">{c.teacherName}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isProfessor && (
                <div className="card-body" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <div className="dash-quick-actions">
                    <button className="dash-quick-btn" onClick={() => navigate('/criar-atividade')}>
                      <FiPlus /> Nova Atividade
                    </button>
                    <button className="dash-quick-btn" onClick={() => navigate('/cursos/criar')}>
                      <FiBook /> Novo Curso
                    </button>
                    <button className="dash-quick-btn" onClick={() => navigate('/solicitacoes')}>
                      <FiUsers /> Solicitações
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>

        </div>
      </div>
    </div>
  )
}
