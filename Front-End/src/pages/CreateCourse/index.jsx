// Criar / Editar Curso

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { createCourse, updateCourse, getCourseById } from '../../services/courseService'
import { getClasses } from '../../services/userService'
import './style.css'

const SUBJECTS = [
  'Matemática', 'Programação', 'Ciências', 'História', 'Geografia',
  'Língua Portuguesa', 'Inglês', 'Física', 'Química', 'Biologia',
  'Educação Física', 'Arte', 'Filosofia', 'Sociologia', 'Outro'
]

export default function CreateCourse() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { userProfile } = useAuth()
  const isEditing   = Boolean(id)

  const [form, setForm] = useState({
    name: '', description: '', subject: '', code: '', classId: ''
  })
  const [classes, setClasses]   = useState([])
  const [error,   setError]     = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error)
    if (isEditing) {
      getCourseById(id).then(c => {
        if (c) setForm({
          name:        c.name        || '',
          description: c.description || '',
          subject:     c.subject     || '',
          code:        c.code        || '',
          classId:     c.classId     || ''
        })
      }).catch(console.error)
    }
  }, [id, isEditing])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!userProfile)      return setError('Usuário não autenticado. Faça login novamente.')
    if (!form.name.trim()) return setError('O nome do curso é obrigatório.')

    setLoading(true)
    try {
      const payload = {
        ...form,
        teacherId:   userProfile.id,
        teacherName: userProfile.name
      }
      if (isEditing) {
        await updateCourse(id, payload)
      } else {
        await createCourse(payload)
      }
      setSuccess(true)
      setTimeout(() => navigate('/cursos'), 1600)
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar curso. Verifique as permissões do Firestore.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}
            onClick={() => navigate('/cursos')}>
            <FiArrowLeft /> Voltar
          </button>

          <div className="create-course-wrap">
            <div className="card">
              <div className="card-header">
                <h2>{isEditing ? '✏️ Editar Curso' : '📚 Novo Curso'}</h2>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-error">{error}</div>
                )}
                {success && (
                  <div className="alert alert-success">
                    <FiCheckCircle /> Curso {isEditing ? 'atualizado' : 'criado'} com sucesso! Redirecionando...
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Nome */}
                  <div className="form-group">
                    <label className="form-label">Nome do Curso <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input name="name" type="text" className="form-control"
                      placeholder="Ex: Introdução à Programação"
                      value={form.name} onChange={handle} required />
                  </div>

                  {/* Disciplina + Código */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Disciplina</label>
                      <select name="subject" className="form-control" value={form.subject} onChange={handle}>
                        <option value="">Selecione...</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Código do Curso</label>
                      <input name="code" type="text" className="form-control"
                        placeholder="Ex: PROG101"
                        value={form.code} onChange={handle} />
                    </div>
                  </div>

                  {/* Turma */}
                  <div className="form-group">
                    <label className="form-label">Turma Associada</label>
                    <select name="classId" className="form-control" value={form.classId} onChange={handle}>
                      <option value="">Sem turma específica</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Descrição */}
                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea name="description" className="form-control" rows={5}
                      style={{ resize: 'vertical' }}
                      placeholder="Descreva os objetivos, conteúdo e pré-requisitos do curso..."
                      value={form.description} onChange={handle} />
                  </div>

                  {/* Botões */}
                  <div className="create-act-btns">
                    <button type="button" className="btn btn-secondary" disabled={loading}
                      onClick={() => navigate('/cursos')}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || success}>
                      <FiSave size={15} />
                      {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Curso'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
