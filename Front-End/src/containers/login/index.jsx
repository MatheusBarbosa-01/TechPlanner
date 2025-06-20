import { useNavigate } from 'react-router-dom'
import '../login/style.css'
import api from '../../services/api.json'
import { useRef, useState } from 'react'

function Login () {
  const navigate = useNavigate()
  const matriculaRef = useRef()
  const senhaRef = useRef()
  const [isLoading, setIsLoading] = useState(false)

  function send(e) {
    e.preventDefault()

    const matriculaDigitada = matriculaRef.current.value
    const senhaDigitada = senhaRef.current.value

    setIsLoading(true)

    const usuario = [...api.Alunos, ...api.Professor].find(v => v.matrícula === matriculaDigitada)

    if (!usuario) {
      alert("Matrícula incorreta")
      setIsLoading(false)
      return
    }

    if (usuario.senha !== senhaDigitada) {
      alert("Senha incorreta")
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      alert(`Bem-vindo, ${usuario.nome}`)
      navigate('/home', { state: { userName: usuario.nome } })
      setIsLoading(false)
    }, 1500)

  }

  return (
    <div id="login">
      <form id='formLogin' onSubmit={send}>
        <div id="modalLogin">
          <div id="blueModal">
            <p>Olá!</p><br />
            <p>Coloque as informações para entrar em sua conta</p>
          </div>
          <div id="whiteModal">
            <h1>ENTRE AQUI</h1>
            <input ref={matriculaRef} type="text" placeholder="Digite sua matrícula" autoFocus required />
            <input ref={senhaRef} type="password" placeholder="Digite sua senha" required/>
            <button id='btnEntrar' type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
