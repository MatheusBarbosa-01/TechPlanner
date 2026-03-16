import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiPlus, FiCalendar, FiSearch } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToActivities } from '../../services/activityService'
import './style.css'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const TYPE_COLORS = {
  atividade: '#3B82F6',
  prova:     '#EF4444',
  trabalho:  '#F59E0B',
  evento:    '#10B981',
  projeto:   '#7C3AED'
}

export default function Calendar() {
  const { userProfile, isProfessor } = useAuth()
  const navigate = useNavigate()
  const hoje = new Date()

  const [mes,        setMes]        = useState(hoje.getMonth())
  const [ano,        setAno]        = useState(hoje.getFullYear())
  const [activities, setActivities] = useState([])
  const [selected,   setSelected]   = useState(null)

  useEffect(() => {
    if (!userProfile) return
    const classId = userProfile.role === 'aluno' ? userProfile.classId : null
    return subscribeToActivities(classId, setActivities)
  }, [userProfile])

  function changeMes(delta) {
    let m = mes + delta, a = ano
    if (m > 11) { m = 0; a++ }
    if (m < 0)  { m = 11; a-- }
    setMes(m); setAno(a); setSelected(null)
  }

  function getDias() {
    const first = new Date(ano, mes, 1).getDay()
    const total = new Date(ano, mes + 1, 0).getDate()
    const arr   = Array(first).fill(null)
    for (let d = 1; d <= total; d++) arr.push(d)
    return arr
  }

  function actForDay(d) {
    const key = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return activities.filter(a => a.dueDate === key)
  }

  const isToday = d =>
    d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()

  const dias = getDias()
  const selectedActs = selected ? actForDay(selected) : []

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          <div className="page-header">
            <div>
              <h1 className="page-title">Calendário</h1>
              <p className="page-subtitle">Visualize prazos e eventos do mês</p>
            </div>
            <div className="page-header-actions">
              {isProfessor && (
                <button className="btn btn-primary" onClick={() => navigate('/criar-atividade')}>
                  <FiPlus /> Nova Atividade
                </button>
              )}
            </div>
          </div>

          <div className="cal-wrapper">
            {/* Calendário principal */}
            <div className="cal-main card">
              <div className="cal-nav">
                <button className="cal-nav-btn" onClick={() => changeMes(-1)}><FiChevronLeft /></button>
                <div className="cal-title">
                  <h2>{MESES[mes]}</h2>
                  <span>{ano}</span>
                </div>
                <button className="cal-nav-btn" onClick={() => changeMes(1)}><FiChevronRight /></button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setMes(hoje.getMonth())
                    setAno(hoje.getFullYear())
                    setSelected(hoje.getDate())
                  }}
                >
                  Hoje
                </button>
              </div>

              <div className="cal-weekdays">
                {DIAS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
              </div>

              <div className="cal-grid">
                {dias.map((d, i) =>
                  d === null ? (
                    <div key={`e${i}`} className="cal-cell empty" />
                  ) : (
                    <div
                      key={d}
                      className={[
                        'cal-cell',
                        isToday(d)     ? 'cal-today'    : '',
                        selected === d ? 'cal-selected' : '',
                        actForDay(d).length > 0 ? 'has-events' : ''
                      ].join(' ').trim()}
                      onClick={() => setSelected(selected === d ? null : d)}
                    >
                      <span className="cal-day-num">{d}</span>
                      <div className="cal-event-dots">
                        {actForDay(d).slice(0, 3).map(a => (
                          <span
                            key={a.id}
                            className="cal-dot"
                            style={{ background: TYPE_COLORS[a.type] || '#3B82F6' }}
                            title={a.title}
                          />
                        ))}
                        {actForDay(d).length > 3 && (
                          <span className="cal-dot-more">+{actForDay(d).length - 3}</span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="cal-legend">
                {Object.entries(TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="cal-legend-item">
                    <span className="cal-dot" style={{ background: color }} />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel lateral */}
            <div className="cal-sidebar">
              {selected ? (
                <div className="card cal-detail-card">
                  <div className="card-header">
                    <h3>
                      {selected} de {MESES[mes]}
                      {isToday(selected) && (
                        <span className="badge badge-primary" style={{ marginLeft: 8 }}>Hoje</span>
                      )}
                    </h3>
                  </div>
                  <div className="card-body">
                    {selectedActs.length === 0 ? (
                      <div className="empty-state" style={{ padding: '30px 0' }}>
                        <div className="empty-icon"><FiSearch size={28} /></div>
                        <p>Nenhum evento neste dia.</p>
                      </div>
                    ) : (
                      <div className="cal-day-events">
                        {selectedActs.map(a => (
                          <div
                            key={a.id}
                            className="cal-event-item"
                            style={{ borderLeft: `3px solid ${TYPE_COLORS[a.type] || '#3B82F6'}` }}
                          >
                            <span className={`badge badge-${a.type || 'atividade'}`}>{a.type || 'Atividade'}</span>
                            <h4>{a.title}</h4>
                            {a.description && (
                              <p>{a.description.slice(0, 100)}{a.description.length > 100 ? '...' : ''}</p>
                            )}
                            {a.createdByName && <small>Por: {a.createdByName}</small>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card cal-detail-card">
                  <div className="card-body">
                    <div className="empty-state" style={{ padding: '30px 0' }}>
                      <div className="empty-icon"><FiCalendar size={28} /></div>
                      <p>Clique em um dia para ver os eventos.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo do mês */}
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-header">
                  <h3>Este mês</h3>
                </div>
                <div className="card-body">
                  {activities.filter(a => {
                    const [y, m] = (a.dueDate || '').split('-')
                    return parseInt(y) === ano && parseInt(m) === mes + 1
                  }).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Nenhum evento neste mês.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activities
                        .filter(a => {
                          const [y, m] = (a.dueDate || '').split('-')
                          return parseInt(y) === ano && parseInt(m) === mes + 1
                        })
                        .slice(0, 5)
                        .map(a => (
                          <div key={a.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className={`badge badge-${a.type || 'atividade'}`} style={{ flexShrink: 0 }}>
                              {a.type || 'Ativ.'}
                            </span>
                            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.title}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                              {a.dueDate?.split('-')[2]}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
