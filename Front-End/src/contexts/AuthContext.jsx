// Contexto global de autenticação
// Gerencia login, cadastro, logout e perfil do usuário via Firebase Auth + Firestore

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null)
  const [userProfile, setUserProfile]   = useState(null)
  const [loading, setLoading]           = useState(true)

  // Cria conta no Firebase Auth e salva perfil no Firestore
  async function register(email, password, name, role, classId = null) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const user = credential.user

    const profile = {
      id: user.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      classId: classId || null,
      avatar: null,
      bio: '',
      createdAt: new Date().toISOString()
    }

    await setDoc(doc(db, 'users', user.uid), profile)
    setUserProfile(profile)
    return credential
  }

  // Login via Firebase Auth
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Logout — limpa estado local
  async function logout() {
    await signOut(auth)
    setUserProfile(null)
    setCurrentUser(null)
  }

  // Carrega perfil do Firestore após autenticação
  const fetchUserProfile = useCallback(async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        setUserProfile({ id: snap.id, ...snap.data() })
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }, [])

  // Atualiza perfil do usuário no Firestore
  async function updateProfile(data) {
    if (!currentUser) return
    const ref = doc(db, 'users', currentUser.uid)
    await updateDoc(ref, { ...data, updatedAt: Timestamp.now() })
    setUserProfile(prev => ({ ...prev, ...data }))
  }

  // Altera senha
  async function changePassword(currentPassword, newPassword) {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
    await reauthenticateWithCredential(currentUser, credential)
    await updatePassword(currentUser, newPassword)
  }

  // Recarrega perfil manualmente (ex: após mudança de turma)
  async function refreshProfile() {
    if (currentUser) await fetchUserProfile(currentUser.uid)
  }

  // Observa mudanças de estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [fetchUserProfile])

  const isAdmin     = userProfile?.role === 'administrador'
  const isProfessor = userProfile?.role === 'professor' || isAdmin
  const isAluno     = userProfile?.role === 'aluno'

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    isProfessor,
    isAluno,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
