// Cursos — lista de cursos com cards, filtro e criação

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiBook, FiUsers, FiTrash2, FiEdit2, FiLock } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToCourses, deleteCourse } from '../../services/courseService'
import { getUsersByClass } from '../../services/userService'
import './style.css'

export default function Courses() {
  const navigate            = useNavigate()
  const { userProfile, isProfessor, isAdmin } = useAuth()
  const canManage           = isProfessor || isAdmin

  const [courses,  setCourses]  = useState([])
  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const unsub = subscribeToCourses(list => {
      setCourses(list)
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleDelete(courseId) {
    if (!window.confirm('Deseja excluir este curso permanentemente?')) return
    setDeleting(courseId)
    try {
      await deleteCourse(courseId)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase()) ||
    c.subject?.toLowerCase().includes(query.toLowerCase()) ||
    c.code?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Cursos</h1>
              <p className="page-subtitle">
                {canManage ? 'Gerencie e organize os cursos da plataforma' : 'Cursos disponíveis para você'}
              </p>
            </div>
            {canManage && (
              <button className="btn btn-primary" onClick={() => navigate('/cursos/criar')}>
                <FiPlus /> Novo Curso
              </button>
            )}
          </div>

          {/* Filtro */}
          <div className="filter-bar">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                className="search-input"
                placeholder="Buscar por nome, disciplina ou código..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FiBookOpen size={32} /></div>
              <h3>{query ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'}</h3>
              <p>{query ? 'Tente outro termo de busca.' : canManage ? 'Clique em "Novo Curso" para começar.' : 'Aguarde seu professor adicionar cursos.'}</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filtered.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  canManage={canManage}
                  userId={userProfile?.id}
                  deleting={deleting === course.id}
                  onEdit={() => navigate(`/cursos/editar/${course.id}`)}
                  onDelete={() => handleDelete(course.id)}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, canManage, userId, deleting, onEdit, onDelete }) {
  const colorMap = {
    matematica: '#3B82F6', programacao: '#7C3AED', ciencias: '#10B981',
    historia: '#F59E0B', lingua: '#EF4444', default: '#6366F1'
  }
  const key   = Object.keys(colorMap).find(k => course.subject?.toLowerCase().includes(k)) || 'default'
  const color = colorMap[key]

  return (
    <div className="course-card">
      <div className="course-card-accent" style={{ background: color }} />
      <div className="course-card-body">
        <div className="course-card-header">
          <div className="course-icon" style={{ background: color + '20', color }}>
            <FiBook size={22} />
          </div>
          {canManage && (
            <div className="course-card-actions">
              <button className="icon-btn" title="Editar" onClick={onEdit}><FiEdit2 size={15} /></button>
              <button className="icon-btn danger" title="Excluir" disabled={deleting} onClick={onDelete}><FiTrash2 size={15} /></button>
            </div>
          )}
        </div>

        <h3 className="course-name">{course.name}</h3>
        {course.subject && <p className="course-subject">{course.subject}</p>}
        {course.description && (
          <p className="course-desc">{course.description.slice(0, 100)}{course.description.length > 100 ? '…' : ''}</p>
        )}

        <div className="course-footer">
          {course.code && (
            <span className="course-code"><FiLock size={11} /> {course.code}</span>
          )}
          <span className="course-meta"><FiUsers size={12} /> {course.enrolledCount || 0} alunos</span>
        </div>
      </div>
    </div>
  )
}
