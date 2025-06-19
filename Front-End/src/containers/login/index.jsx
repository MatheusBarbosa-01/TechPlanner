import { useNavigate } from 'react-router-dom'
import '../login/style.css'
import api from '../../services/api.json'
import { useRef } from 'react'

function Login () {
  const navigate = useNavigate()
  const matriculaRef = useRef()
  const senhaRef = useRef()

  function send(e) {
    e.preventDefault()

    const matriculaDigitada = matriculaRef.current.value
    const senhaDigitada = senhaRef.current.value

    const usuario = [...api.Alunos, ...api.Professor].find(v => v.matrícula === matriculaDigitada)

    if (!usuario) {
      alert("Matrícula incorreta")
      return
    }

    if (usuario.senha !== senhaDigitada) {
      alert("Senha incorreta")
      return
    }

    alert(`Bem-vindo, ${usuario.nome}`)
    navigate('/home')
  }

  return (
    <div id="login">
      <form onSubmit={send}>
        <div id="modalLogin">
          <div id="blueModal">
            <p>Olá!</p><br />
            <p>Coloque as informações para entrar em sua conta</p>
          </div>
          <div id="whiteModal">
            <h1>ENTRE AQUI</h1>
            <input ref={matriculaRef} type="text" placeholder="Digite sua matrícula" />
            <input ref={senhaRef} type="password" placeholder="Digite sua senha" />
            <button type="submit">Entre</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
