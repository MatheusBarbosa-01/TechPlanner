import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiSave, FiCheckCircle,
  FiFileText, FiBook, FiFolder, FiLayers, FiCalendar, FiInfo, FiUsers
} from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { createActivity, updateActivity, getActivityById } from '../../services/activityService'
import { createNotification } from '../../services/notificationService'
import { getClasses, getUsersByClass } from '../../services/userService'
import './style.css'

const TIPOS = [
  { value: 'atividade', label: 'Atividade', color: '#3B82F6', Icon: FiFileText },
  { value: 'prova',     label: 'Prova',     color: '#EF4444', Icon: FiBook     },
  { value: 'trabalho',  label: 'Trabalho',  color: '#F59E0B', Icon: FiFolder   },
  { value: 'projeto',   label: 'Projeto',   color: '#7C3AED', Icon: FiLayers   },
  { value: 'evento',    label: 'Evento',    color: '#10B981', Icon: FiCalendar }
]

export default function CreateActivity() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { userProfile } = useAuth()
  const isEditing       = Boolean(id)

  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', classId: '', type: 'atividade', points: ''
  })
  const [classes,  setClasses]  = useState([])
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error)
    if (isEditing) {
      getActivityById(id).then(a => {
        if (a) setForm({
          title:       a.title       || '',
          description: a.description || '',
          dueDate:     a.dueDate     || '',
          classId:     a.classId     || '',
          type:        a.type        || 'atividade',
          points:      a.points      || ''
        })
      }).catch(console.error)
    }
  }, [id, isEditing])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!form.title.trim()) return setError('O título é obrigatório.')
    if (!form.dueDate)      return setError('A data de entrega é obrigatória.')
    if (!form.classId)      return setError('Selecione uma turma.')

    setLoading(true)
    try {
      const payload = {
        ...form,
        points:        form.points ? Number(form.points) : null,
        createdBy:     userProfile.id,
        createdByName: userProfile.name
      }

      if (isEditing) {
        await updateActivity(id, payload)
      } else {
        const actId  = await createActivity(payload)
        const alunos = await getUsersByClass(form.classId)
        const turma  = classes.find(c => c.id === form.classId)
        const msg    = `Nova ${form.type}: "${form.title}" — Turma ${turma?.name ?? ''} — Vence em ${new Date(form.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
        await Promise.all(alunos.map(a => createNotification(a.id, msg)))
      }

      setSuccess(true)
      setTimeout(() => navigate('/atividades'), 1800)
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar atividade. Verifique as permissões do Firestore.')
    } finally {
      setLoading(false)
    }
  }

  const tipoAtual = TIPOS.find(t => t.value === form.type)

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">

          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}
            onClick={() => navigate('/atividades')}>
            <FiArrowLeft /> Voltar
          </button>

          <div className="create-act-grid">
            {/* Form */}
            <div className="card">
              <div className="card-header">
                <h2>{isEditing ? 'Editar Atividade' : 'Nova Atividade'}</h2>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && (
                  <div className="alert alert-success">
                    <FiCheckCircle /> Atividade {isEditing ? 'atualizada' : 'criada'} com sucesso! Redirecionando...
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Título */}
                  <div className="form-group">
                    <label className="form-label">Título <span className="required">*</span></label>
                    <input name="title" type="text" className="form-control"
                      placeholder="Ex: Prova de Algoritmos — AV1"
                      value={form.title} onChange={handle} required />
                  </div>

                  {/* Tipo */}
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <div className="tipo-selector">
                      {TIPOS.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          className={`tipo-btn ${form.type === t.value ? 'selected' : ''}`}
                          style={form.type === t.value
                            ? { borderColor: t.color, color: t.color, background: t.color + '15' }
                            : {}}
                          onClick={() => setForm(p => ({ ...p, type: t.value }))}
                        >
                          <t.Icon size={14} /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turma + Pontos */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Turma <span className="required">*</span></label>
                      <select name="classId" className="form-control"
                        value={form.classId} onChange={handle} required>
                        <option value="">Selecione a turma...</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pontuação (opcional)</label>
                      <input name="points" type="number" className="form-control" min="0" max="100"
                        placeholder="Ex: 10"
                        value={form.points} onChange={handle} />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea name="description" className="form-control form-control-textarea"
                      placeholder="Detalhe a atividade, critérios de avaliação, materiais necessários..."
                      value={form.description} onChange={handle} rows={5} />
                  </div>

                  {/* Data */}
                  <div className="form-group" style={{ maxWidth: '240px' }}>
                    <label className="form-label">Data de entrega <span className="required">*</span></label>
                    <input name="dueDate" type="date" className="form-control"
                      value={form.dueDate} onChange={handle} required />
                  </div>

                  <div className="create-act-btns">
                    <button type="button" className="btn btn-secondary"
                      onClick={() => navigate('/atividades')} disabled={loading}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || success}>
                      <FiSave size={15} />
                      {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Publicar Atividade'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="card create-act-preview">
                <div className="card-header"><h3>Pré-visualização</h3></div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${form.type || 'atividade'}`}>
                      {form.type || 'Atividade'}
                    </span>
                    {form.points && (
                      <span className="badge badge-secondary">{form.points} pts</span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
                    {form.title || 'Título da atividade'}
                  </h3>
                  {form.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
                      {form.description.slice(0, 150)}{form.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                  {form.dueDate && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiCalendar size={12} /> Vence em: <strong>
                        {new Date(form.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </strong>
                    </p>
                  )}
                  {form.classId && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiUsers size={12} /> {classes.find(c => c.id === form.classId)?.name || ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginTop: '14px' }}>
                <div className="card-body">
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                    <FiInfo size={14} style={{ marginTop: 2, color: 'var(--primary)', flexShrink: 0 }} />
                    <span><strong>Dica:</strong> Após publicar, todos os alunos da turma receberão uma notificação automática.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
