// Painel do Administrador — gerenciar usuários e turmas

import { useState, useEffect, useCallback } from 'react'
import { FiUsers, FiBookOpen, FiPlus, FiTrash2, FiSearch, FiRefreshCw, FiSettings } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAllUsers, getClasses, createClass, deleteClass, updateUserProfile
} from '../../services/userService'
import './style.css'

const ROLE_LABELS = {
  administrador: { label: 'Admin',     color: '#DC2626' },
  professor:     { label: 'Professor', color: '#D97706' },
  aluno:         { label: 'Aluno',     color: '#2563EB' }
}

export default function Admin() {
  const { userProfile } = useAuth()

  const [tab,       setTab]     = useState('users')
  const [users,     setUsers]   = useState([])
  const [classes,   setClasses] = useState([])
  const [query,     setQuery]   = useState('')
  const [loading,   setLoading] = useState(true)
  const [newClass,  setNewClass]  = useState('')
  const [addingCls, setAddingCls] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [u, c] = await Promise.all([getAllUsers(), getClasses()])
      setUsers(u)
      setClasses(c)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAddClass(e) {
    e.preventDefault()
    if (!newClass.trim() || !userProfile) return
    setAddingCls(true)
    try {
      await createClass({ name: newClass.trim(), createdBy: userProfile.id })
      setNewClass('')
      const c = await getClasses()
      setClasses(c)
    } catch (err) { console.error(err) }
    finally { setAddingCls(false) }
  }

  async function handleDeleteClass(classId) {
    if (!window.confirm('Excluir esta turma? Alunos vinculados não serão removidos.')) return
    try {
      await deleteClass(classId)
      setClasses(prev => prev.filter(c => c.id !== classId))
    } catch (err) { console.error(err) }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await updateUserProfile(userId, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) { console.error(err) }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  )

  const stats = {
    total:    users.length,
    alunos:   users.filter(u => u.role === 'aluno').length,
    prof:     users.filter(u => u.role === 'professor').length,
    admin:    users.filter(u => u.role === 'administrador').length,
    turmas:   classes.length
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Painel Administrativo</h1>
              <p className="page-subtitle">Gerencie usuários e turmas da plataforma</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
              <FiRefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
              Atualizar
            </button>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            {[
              { label: 'Total Usuários',  value: stats.total,  color: '#6366F1' },
              { label: 'Alunos',          value: stats.alunos, color: '#2563EB' },
              { label: 'Professores',     value: stats.prof,   color: '#D97706' },
              { label: 'Administradores', value: stats.admin,  color: '#DC2626' },
              { label: 'Turmas',          value: stats.turmas, color: '#10B981' }
            ].map(s => (
              <div key={s.label} className="admin-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <span className="admin-stat-num" style={{ color: s.color }}>{s.value}</span>
                <span className="admin-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs-bar">
            <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
              <FiUsers size={14} /> Usuários
            </button>
            <button className={`tab-btn ${tab === 'classes' ? 'active' : ''}`} onClick={() => setTab('classes')}>
              <FiBookOpen size={14} /> Turmas
            </button>
          </div>

          {/* Users Table */}
          {tab === 'users' && (
            <div className="card">
              <div className="card-body" style={{ padding: '12px 20px' }}>
                <div className="search-wrapper" style={{ marginBottom: 16 }}>
                  <FiSearch className="search-icon" />
                  <input className="search-input" placeholder="Buscar por nome ou email..."
                    value={query} onChange={e => setQuery(e.target.value)} />
                </div>

                {loading ? (
                  <div className="empty-state"><div className="spinner" /></div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Email</th>
                          <th>Papel</th>
                          <th>Turma</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>Nenhum usuário encontrado</td></tr>
                        ) : filteredUsers.map(u => {
                          const meta = ROLE_LABELS[u.role] || ROLE_LABELS.aluno
                          const cls  = classes.find(c => c.id === u.classId)
                          return (
                            <tr key={u.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="admin-avatar" style={{ background: meta.color + '20', color: meta.color }}>
                                    {(u.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                              <td>
                                <select
                                  value={u.role || 'aluno'}
                                  className="role-select"
                                  style={{ color: meta.color, borderColor: meta.color + '40' }}
                                  onChange={e => handleChangeRole(u.id, e.target.value)}
                                  disabled={u.id === userProfile?.id}
                                >
                                  <option value="aluno">Aluno</option>
                                  <option value="professor">Professor</option>
                                  <option value="administrador">Administrador</option>
                                </select>
                              </td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {cls?.name || '—'}
                              </td>
                              <td>
                                {u.id !== userProfile?.id && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {u.createdAt
                                      ? new Date(u.createdAt.toDate?.() || u.createdAt).toLocaleDateString('pt-BR')
                                      : '—'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {tab === 'classes' && (
            <div>
              {/* Add class form */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                  <form onSubmit={handleAddClass} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Nova Turma</label>
                      <input className="form-control" placeholder="Ex: Turma A — 2025"
                        value={newClass} onChange={e => setNewClass(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={addingCls}>
                      <FiPlus /> {addingCls ? 'Criando...' : 'Criar Turma'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Classes list */}
              {loading ? (
                <div className="empty-state"><div className="spinner" /></div>
              ) : classes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><FiUsers size={32} /></div>
                  <h3>Nenhuma turma cadastrada</h3>
                  <p>Crie a primeira turma acima.</p>
                </div>
              ) : (
                <div className="classes-list-admin">
                  {classes.map(c => {
                    const count = users.filter(u => u.classId === c.id).length
                    return (
                      <div key={c.id} className="card class-admin-card">
                        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: 700, margin: 0 }}>{c.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                              {count} aluno{count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <button className="icon-btn danger" onClick={() => handleDeleteClass(c.id)} title="Excluir turma">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
