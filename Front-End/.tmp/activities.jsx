import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiEdit2, FiTrash2, FiSearch, FiPlus,
  FiChevronDown, FiChevronUp, FiSend, FiEye,
  FiCheckCircle, FiClock, FiAlertCircle,
  FiCalendar, FiUser, FiUpload, FiX, FiClipboard
} from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToActivities, deleteActivity } from '../../services/activityService'
import {
  submitActivity, getStudentSubmission,
  getSubmissionsForActivity, gradeSubmission
} from '../../services/submissionService'
import { getClassById } from '../../services/userService'
import './style.css'

function TypeBadge({ type }) {
  return <span className={`badge badge-${type || 'atividade'}`}>{type || 'Atividade'}</span>
}

function StatusBadge({ status }) {
  const map = {
    entregue: { label: 'Entregue', cls: 'badge-success' },
    avaliado: { label: 'Avaliado', cls: 'badge-primary' },
    pendente:  { label: 'Pendente',  cls: 'badge-warning' }
  }
  const { label, cls } = map[status] || map.pendente
  return <span className={`badge ${cls}`}>{label}</span>
}

// Painel de submissão para aluno
function SubmissionPanel({ activity, studentId, studentName, onClose }) {
  const [content,  setContent]  = useState('')
  const [existing, setExisting] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => {
    getStudentSubmission(activity.id, studentId).then(s => {
      if (s) { setExisting(s); setContent(s.content || '') }
    })
  }, [activity.id, studentId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return setMsg('Descreva sua entrega.')
    setLoading(true)
    try {
      await submitActivity({ activityId: activity.id, studentId, studentName, content: content.trim() })
      setMsg('Entregue com sucesso!')
      setExisting({ content, status: 'entregue' })
    } catch {
      setMsg('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="submission-panel">
      <div className="submission-panel-header">
        <h4><FiUpload size={15} /> {existing ? 'Minha Entrega' : 'Entregar Atividade'}</h4>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX size={16} /></button>
      </div>
      {existing?.grade !== undefined && existing?.grade !== null && (
        <div className="submission-grade-info">
          <strong>Nota: {existing.grade}/10</strong>
          {existing.feedback && <p>{existing.feedback}</p>}
        </div>
      )}
      {msg && <p className={`submission-msg ${msg.includes('sucesso') ? 'success' : 'error'}`}>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control form-control-textarea"
          placeholder="Descreva sua entrega, cole um link ou explique o que foi feito..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          required
        />
        <div className="submission-panel-actions">
          {existing?.status && <StatusBadge status={existing.status} />}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            <FiSend size={14} /> {existing ? 'Reenviar' : 'Enviar Entrega'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Painel de submissões para professor
function TeacherSubmissionsPanel({ activity, onClose }) {
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    getSubmissionsForActivity(activity.id).then(setSubmissions)
  }, [activity.id])

  async function handleGrade(sub, grade, feedback) {
    await gradeSubmission(sub.id, Number(grade), feedback)
    setSubmissions(prev => prev.map(s =>
      s.id === sub.id ? { ...s, grade: Number(grade), feedback, status: 'avaliado' } : s
    ))
  }

  return (
    <div className="submission-panel">
      <div className="submission-panel-header">
        <h4><FiClipboard size={15} /> Entregas — {activity.title}</h4>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX size={16} /></button>
      </div>
      {submissions.length === 0 ? (
        <p className="vazio-msg" style={{ padding: '20px 0' }}>Nenhuma entrega ainda.</p>
      ) : (
        <div className="teacher-submissions-list">
          {submissions.map(s => (
            <div key={s.id} className="teacher-sub-item">
              <div className="teacher-sub-header">
                <strong>{s.studentName}</strong>
                <StatusBadge status={s.status} />
              </div>
              <p className="teacher-sub-content">{s.content}</p>
              {s.grade !== null && s.grade !== undefined ? (
                <p className="teacher-sub-grade">Nota: <strong>{s.grade}/10</strong> — {s.feedback}</p>
              ) : (
                <form
                  className="grade-form"
                  onSubmit={e => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    handleGrade(s, fd.get('grade'), fd.get('feedback'))
                    e.target.reset()
                  }}
                >
                  <input name="grade" type="number" min="0" max="10" step="0.1"
                    placeholder="Nota (0-10)" className="form-control" style={{ width: '110px' }} required />
                  <input name="feedback" type="text"
                    placeholder="Comentário (opcional)" className="form-control" style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-success btn-sm">
                    <FiCheckCircle size={14} /> Avaliar
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Activities() {
  const { userProfile, isProfessor } = useAuth()
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('todos')
  const [expanded,   setExpanded]   = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const [viewSubs,   setViewSubs]   = useState(null)

  useEffect(() => {
    if (!userProfile) return
    const classId = userProfile.role === 'aluno' ? userProfile.classId : null
    return subscribeToActivities(classId, data => {
      setActivities(data)
      setLoading(false)
    })
  }, [userProfile])

  async function handleDelete(id, title) {
    if (!window.confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return
    try { await deleteActivity(id) }
    catch { alert('Erro ao excluir. Tente novamente.') }
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = activities.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
    const matchType   = filter === 'todos' || a.type === filter
    return matchSearch && matchType
  })

  const isOverdue = d => new Date(d + 'T23:59:59') < new Date()

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Atividades</h1>
              <p className="page-subtitle">{activities.length} atividade(s) cadastrada(s)</p>
            </div>
            <div className="page-header-actions">
              {isProfessor && (
                <button className="btn btn-primary" onClick={() => navigate('/criar-atividade')}>
                  <FiPlus /> Nova Atividade
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="todos">Todos os tipos</option>
              <option value="atividade">Atividade</option>
              <option value="prova">Prova</option>
              <option value="trabalho">Trabalho</option>
              <option value="projeto">Projeto</option>
              <option value="evento">Evento</option>
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="vazio-msg">Carregando atividades...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FiClipboard size={32} /></div>
              <h3>Nenhuma atividade encontrada</h3>
              <p>
                {search || filter !== 'todos'
                  ? 'Tente limpar os filtros ou buscar outro termo.'
                  : 'Nenhuma atividade foi cadastrada ainda.'}
              </p>
              {isProfessor && (
                <button className="btn btn-primary" onClick={() => navigate('/criar-atividade')}>
                  + Criar atividade
                </button>
              )}
            </div>
          ) : (
            <div className="activities-list">
              {filtered.map(a => {
                const overdue = isOverdue(a.dueDate)
                const isToday = a.dueDate === today
                const open    = expanded === a.id

                return (
                  <div key={a.id} className={`activity-card ${overdue ? 'overdue' : ''} ${isToday ? 'due-today' : ''}`}>
                    <div className="activity-card-main" onClick={() => setExpanded(open ? null : a.id)}>
                      <div className="activity-card-left">
                        <div className="activity-card-badges">
                          <TypeBadge type={a.type} />
                          {overdue && <span className="badge badge-danger">Vencida</span>}
                          {isToday && !overdue && <span className="badge badge-warning">Hoje!</span>}
                        </div>
                        <h3 className="activity-title">{a.title}</h3>
                        <p className="activity-meta">
                          <FiCalendar size={12} /> Entrega: <strong>
                            {new Date(a.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </strong>
                          {a.createdByName && (
                            <> &nbsp;·&nbsp; <FiUser size={12} /> {a.createdByName}</>
                          )}
                        </p>
                      </div>
                      <div className="activity-card-right">
                        <div className="activity-card-actions" onClick={e => e.stopPropagation()}>
                          {!isProfessor && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setSubmitting(submitting === a.id ? null : a.id)}
                            >
                              <FiSend size={13} /> Entregar
                            </button>
                          )}
                          {isProfessor && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Ver entregas"
                                onClick={() => setViewSubs(viewSubs === a.id ? null : a.id)}
                              >
                                <FiEye size={15} />
                              </button>
                              <button
                                className="btn-icon btn-icon-primary"
                                title="Editar"
                                onClick={() => navigate(`/editar-atividade/${a.id}`)}
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                className="btn-icon btn-icon-danger"
                                title="Excluir"
                                onClick={() => handleDelete(a.id, a.title)}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                        {open ? <FiChevronUp className="expand-icon" /> : <FiChevronDown className="expand-icon" />}
                      </div>
                    </div>

                    {open && a.description && (
                      <div className="activity-desc">
                        <p>{a.description}</p>
                      </div>
                    )}

                    {submitting === a.id && !isProfessor && (
                      <SubmissionPanel
                        activity={a}
                        studentId={userProfile.id}
                        studentName={userProfile.name}
                        onClose={() => setSubmitting(null)}
                      />
                    )}

                    {viewSubs === a.id && isProfessor && (
                      <TeacherSubmissionsPanel activity={a} onClose={() => setViewSubs(null)} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
