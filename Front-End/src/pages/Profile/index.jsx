// Perfil do Usuário — visualizar e editar dados pessoais

import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiLock, FiSave, FiCheckCircle, FiMapPin } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { getClasses } from '../../services/userService'
import './style.css'

const ROLE_LABELS = {
  administrador: { label: 'Administrador', color: '#DC2626', bg: '#FEF2F2' },
  professor:     { label: 'Professor',     color: '#D97706', bg: '#FFFBEB' },
  aluno:         { label: 'Aluno',         color: '#2563EB', bg: '#EFF6FF' }
}

export default function Profile() {
  const { userProfile, updateProfile: saveProfile, changePassword } = useAuth()

  const [classes,    setClasses]    = useState([])
  const [editMode,   setEditMode]   = useState(false)
  const [form,       setForm]       = useState({ name: '', classId: '' })
  const [passForm,   setPassForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving,     setSaving]     = useState(false)
  const [passMsg,    setPassMsg]    = useState({ type: '', text: '' })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [showPwd,    setShowPwd]    = useState(false)

  const role = userProfile?.role || 'aluno'
  const meta = ROLE_LABELS[role] || ROLE_LABELS.aluno
  const initials = (userProfile?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error)
    if (userProfile) {
      setForm({ name: userProfile.name || '', classId: userProfile.classId || '' })
    }
  }, [userProfile])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileMsg({ type: '', text: '' })
    if (!form.name.trim()) return setProfileMsg({ type: 'error', text: 'O nome é obrigatório.' })
    setSaving(true)
    try {
      await saveProfile({ name: form.name, classId: form.classId })
      setEditMode(false)
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error(err)
      setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })
    if (!passForm.current) return setPassMsg({ type: 'error', text: 'Informe a senha atual.' })
    if (passForm.next.length < 6) return setPassMsg({ type: 'error', text: 'Nova senha deve ter ao menos 6 caracteres.' })
    if (passForm.next !== passForm.confirm) return setPassMsg({ type: 'error', text: 'As senhas não coincidem.' })
    setSaving(true)
    try {
      await changePassword(passForm.current, passForm.next)
      setPassForm({ current: '', next: '', confirm: '' })
      setPassMsg({ type: 'success', text: 'Senha alterada com sucesso!' })
      setTimeout(() => setPassMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error(err)
      const msg = err.code === 'auth/wrong-password'
        ? 'Senha atual incorreta.'
        : err.message || 'Erro ao alterar senha.'
      setPassMsg({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handlePass = e => setPassForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleForm = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const className = classes.find(c => c.id === userProfile?.classId)?.name

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Meu Perfil</h1>
              <p className="page-subtitle">Visualize e edite seus dados pessoais</p>
            </div>
          </div>

          <div className="profile-grid">

            {/* Avatar + info */}
            <div className="card profile-side">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div className="profile-avatar" style={{ background: meta.color + '20', color: meta.color }}>
                  {initials}
                </div>
                <h2 className="profile-name">{userProfile?.name || '—'}</h2>
                <p className="profile-email">{userProfile?.email || '—'}</p>
                <span className="badge-role" style={{ background: meta.bg, color: meta.color, padding: '4px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-block', marginTop: 8 }}>
                  {meta.label}
                </span>
                {className && (
                  <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                    <FiMapPin size={13} /> {className}
                  </p>
                )}
                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="profile-stat-num">—</span>
                    <span className="profile-stat-label">Atividades</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-num">—</span>
                    <span className="profile-stat-label">Cursos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editar perfil + senha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Dados pessoais */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <h3>Dados Pessoais</h3>
                  {!editMode && (
                    <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>
                      Editar
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {profileMsg.text && (
                    <div className={`alert alert-${profileMsg.type}`}>
                      {profileMsg.type === 'success' && <FiCheckCircle />}
                      {profileMsg.text}
                    </div>
                  )}

                  {editMode ? (
                    <form onSubmit={handleSaveProfile}>
                      <div className="form-group">
                        <label className="form-label">Nome completo</label>
                        <input name="name" type="text" className="form-control"
                          value={form.name} onChange={handleForm} required />
                      </div>
                      {role === 'aluno' && (
                        <div className="form-group">
                          <label className="form-label">Turma</label>
                          <select name="classId" className="form-control" value={form.classId} onChange={handleForm}>
                            <option value="">Sem turma</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)} disabled={saving}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          <FiSave size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info-list">
                      <ProfileField icon={<FiUser />}  label="Nome"  value={userProfile?.name || '—'} />
                      <ProfileField icon={<FiMail />}  label="Email" value={userProfile?.email || '—'} />
                      <ProfileField icon={<FiLock />}  label="Papel" value={meta.label} />
                      {className && <ProfileField icon={<FiMapPin />} label="Turma" value={className} />}
                    </div>
                  )}
                </div>
              </div>

              {/* Alterar senha */}
              <div className="card">
                <div className="card-header"><h3>Alterar Senha</h3></div>
                <div className="card-body">
                  {passMsg.text && (
                    <div className={`alert alert-${passMsg.type}`} style={{ marginBottom: 16 }}>
                      {passMsg.type === 'success' && <FiCheckCircle />}
                      {passMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                      <label className="form-label">Senha atual</label>
                      <input name="current" type={showPwd ? 'text' : 'password'} className="form-control"
                        placeholder="••••••••" value={passForm.current} onChange={handlePass} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nova senha</label>
                      <input name="next" type={showPwd ? 'text' : 'password'} className="form-control"
                        placeholder="Mín. 6 caracteres" value={passForm.next} onChange={handlePass} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirmar nova senha</label>
                      <input name="confirm" type={showPwd ? 'text' : 'password'} className="form-control"
                        placeholder="Repita a nova senha" value={passForm.confirm} onChange={handlePass} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(v => !v)} />
                        Mostrar senhas
                      </label>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        <FiLock size={14} /> {saving ? 'Alterando...' : 'Alterar Senha'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-icon">{icon}</span>
      <div>
        <p className="profile-field-label">{label}</p>
        <p className="profile-field-value">{value}</p>
      </div>
    </div>
  )
}
