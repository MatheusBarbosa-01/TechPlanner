// Solicitações de entrada em turma — Professor/Admin gerencia pedidos

import { useState, useEffect } from 'react'
import { FiCheckCircle, FiXCircle, FiClock, FiUsers, FiSearch } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToJoinRequests, respondToJoinRequest } from '../../services/joinRequestService'
import { getClasses } from '../../services/userService'
import './style.css'

const STATUS_META = {
  pendente:  { label: 'Pendente',  icon: <FiClock />,       color: '#D97706', bg: '#FFFBEB' },
  aprovado:  { label: 'Aprovado',  icon: <FiCheckCircle />, color: '#16A34A', bg: '#F0FDF4' },
  rejeitado: { label: 'Rejeitado', icon: <FiXCircle />,     color: '#DC2626', bg: '#FEF2F2' }
}

export default function JoinRequests() {
  const { userProfile } = useAuth()

  const [requests, setRequests] = useState([])
  const [classes,  setClasses]  = useState([])
  const [filter,   setFilter]   = useState('pendente')
  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [acting,   setActing]   = useState(null)

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error)
    const unsub = subscribeToJoinRequests(null, list => {
      setRequests(list)
      setLoading(false)
    })
    return unsub
  }, [])

  async function respond(requestId, status) {
    setActing(requestId)
    try {
      await respondToJoinRequest(requestId, status, userProfile?.name || '')
    } catch (err) {
      console.error(err)
    } finally {
      setActing(null)
    }
  }

  const filtered = requests.filter(r => {
    if (filter !== 'todos' && r.status !== filter) return false
    if (query) {
      const q = query.toLowerCase()
      return r.userName?.toLowerCase().includes(q) || r.userEmail?.toLowerCase().includes(q) ||
        classes.find(c => c.id === r.classId)?.name?.toLowerCase().includes(q)
    }
    return true
  })

  const pending = requests.filter(r => r.status === 'pendente').length

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          <div className="page-header">
            <div>
              <h1 className="page-title">
                📬 Solicitações de Turma
                {pending > 0 && <span className="notif-badge">{pending}</span>}
              </h1>
              <p className="page-subtitle">Aprove ou rejeite pedidos de entrada em turmas</p>
            </div>
          </div>

          {/* Filtro + busca */}
          <div className="filter-bar">
            <div className="tabs-bar" style={{ margin: 0, border: 'none', padding: 0 }}>
              {['pendente', 'aprovado', 'rejeitado', 'todos'].map(s => (
                <button
                  key={s}
                  className={`tab-btn ${filter === s ? 'active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s === 'todos' ? 'Todos' : STATUS_META[s]?.label}
                  {s !== 'todos' && (
                    <span className="tab-count">{requests.filter(r => r.status === s).length}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar aluno ou turma..."
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📬</div>
              <h3>Nenhuma solicitação {filter !== 'todos' ? STATUS_META[filter]?.label?.toLowerCase() : ''}</h3>
              <p>As solicitações enviadas pelos alunos aparecerão aqui.</p>
            </div>
          ) : (
            <div className="requests-list">
              {filtered.map(req => {
                const cls  = classes.find(c => c.id === req.classId)
                const meta = STATUS_META[req.status] || STATUS_META.pendente
                const date = req.createdAt
                  ? new Date(req.createdAt.toDate?.() || req.createdAt).toLocaleDateString('pt-BR')
                  : '—'
                const initials = (req.userName || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

                return (
                  <div key={req.id} className="request-card card">
                    <div className="card-body request-card-body">
                      {/* Aluno */}
                      <div className="req-user">
                        <div className="req-avatar">{initials}</div>
                        <div>
                          <p className="req-name">{req.userName || '—'}</p>
                          <p className="req-email">{req.userEmail || '—'}</p>
                        </div>
                      </div>

                      {/* Turma */}
                      <div className="req-class">
                        <FiUsers size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{cls?.name || req.classId}</span>
                      </div>

                      {/* Data */}
                      <div className="req-date">{date}</div>

                      {/* Status */}
                      <div className="req-status">
                        <span className="status-pill" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="req-actions">
                        {req.status === 'pendente' ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              disabled={acting === req.id}
                              onClick={() => respond(req.id, 'aprovado')}
                            >
                              <FiCheckCircle /> Aprovar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={acting === req.id}
                              onClick={() => respond(req.id, 'rejeitado')}
                            >
                              <FiXCircle /> Rejeitar
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Respondido por {req.respondedByName || '—'}
                          </span>
                        )}
                      </div>
                    </div>
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
